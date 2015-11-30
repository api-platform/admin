'use strict';

// Expand a JSON-LD document.
// Needed to be sure that every docs have the same format
function expandJsonLdDoc($q, $log, url, options) {
    return $q(function (resolve, reject) {
        jsonld.expand(url, options, function (err, doc) {
            if (err) {
                $log.log('An error occurred while expanding the JSON-LD document.');
                reject();
            } else {
                resolve(doc);
            }
        });
    });
}

// Find a supported class in the Hydra doc
function findHydraSupportedClass(hydraDoc, supportedClass) {
    var supportedClasses = hydraDoc[0]['http://www.w3.org/ns/hydra/core#supportedClass'];

    for (var i = 0; i < supportedClasses.length; i++) {
        if (supportedClasses[i]['@id'] === supportedClass) {
            return supportedClasses[i];
        }
    }
}

// Retrieve the Hydra documentation and the entrypoint of the API
// This must be done before the AngularJS bootstrap
function fetchHydraDoc(entrypointUrl) {
    var initInjector = angular.injector(['ng']);
    var $http = initInjector.get('$http');
    var $log = initInjector.get('$log');
    var $q = initInjector.get('$q');

    return $http.get(entrypointUrl).then(function (response) {
        return $q(function (resolve, reject) {
            var linkHeader = response.headers('Link');

            if (!linkHeader) {
                reject();
            }

            var matches = linkHeader.match(/<(.+)>; rel="http\:\/\/www.w3.org\/ns\/hydra\/core#apiDocumentation"/);

            if (!matches[1]) {
                reject();
            }

            expandJsonLdDoc($q, $log, response.data, {base: entrypointUrl}).then(function (doc) {
                resolve({entrypointUrl: entrypointUrl, entrypointDoc: doc, hydraDocUrl: matches[1]});
            }, function () {
                reject();
            });
        });
    }, function () {
        $log.log('An error occurred while loading the API entrypoint.');
    }).then(function (data) {
        return $q(function (resolve, reject) {
            $http.get(data.hydraDocUrl).then(function (response) {
                data.hydraDoc = response.data;
                resolve(data);
            }, function () {
                reject();
            })
        });
    }, function () {
        $log.log('An error occurred while loading the Hydra documentation.');
    }).then(function (data) {
        return $q(function (resolve, reject) {
            expandJsonLdDoc($q, $log, data.hydraDoc, {base: data.hydraDocUrl}).then(function(doc) {
                data.hydraDoc = doc;
                resolve(data);
            }, function () {
                reject();
            });
        });
    }, function () {
        $log.log('An error occurred while loading the Hydra documentation.');
    });
}

angular.module('api-platform-hydra-admin', [])
.provider('ApiPlatformHydraAdminConfiguration', ['NgAdminConfigurationProvider', function (nga) {
    // Configure ng-admin using data provided by the Hydra documentation
    nga.getAdminFromHydraDoc = function (data, admin) {
        // Convert a RDF range to a ng-admin type
        function getTypeFromRange(range) {
            switch (range) {
                case 'http://www.w3.org/2001/XMLSchema#dateTime':
                    return 'datetime';

                case 'http://www.w3.org/2001/XMLSchema#integer':
                    return 'number';

                case 'http://www.w3.org/2001/XMLSchema#float':
                    return 'float';

                case 'http://www.w3.org/2001/XMLSchema#boolean':
                    return 'boolean';
            }

            return 'string';
        }

        // Set the title of the API
        if (!admin) {
            if (data['hydraDoc'][0]['http://www.w3.org/ns/hydra/core#title'][0]['@value']) {
                admin = nga.application(data['hydraDoc'][0]['http://www.w3.org/ns/hydra/core#title'][0]['@value']);
            } else {
                admin = nga.application('Admin');
            }
        }

        var entrypointSupportedClass = findHydraSupportedClass(data.hydraDoc, data.entrypointDoc[0]['@type'][0]);
        var idField = nga.field('id');

        // Add entities
        for(var i = 0; i < entrypointSupportedClass['http://www.w3.org/ns/hydra/core#supportedProperty'].length; i++) {
            var property = entrypointSupportedClass['http://www.w3.org/ns/hydra/core#supportedProperty'][i]['http://www.w3.org/ns/hydra/core#property'][0];
            var url = data.entrypointDoc[0][property['@id']][0]['@id'];
            var entity = nga.entity(new URL(url).pathname.substr(1));

            var entrypointSupportedOperations = property['http://www.w3.org/ns/hydra/core#supportedOperation'];

            // Add fields
            for (var j = 0; j < entrypointSupportedOperations.length; j++) {
                var className = entrypointSupportedOperations[j]['http://www.w3.org/ns/hydra/core#returns'][0]['@id'];

                if (0 === className.indexOf('http://www.w3.org/ns/hydra/core')) {
                    continue;
                }

                var supportedClass = findHydraSupportedClass(data.hydraDoc, className);

                var readableFields = [idField];
                var writableFields = [];

                angular.forEach(supportedClass['http://www.w3.org/ns/hydra/core#supportedProperty'], function (supportedProperty) {
                    var rdfProperty = supportedProperty['http://www.w3.org/ns/hydra/core#property'][0];
                    var property = rdfProperty['http://www.w3.org/2000/01/rdf-schema#label'][0]['@value'];
                    var field = nga.field(property, getTypeFromRange(rdfProperty['http://www.w3.org/2000/01/rdf-schema#range'][0]['@id']));

                    // Add validation
                    if (supportedProperty['http://www.w3.org/ns/hydra/core#required'][0]['@value']) {
                        field.validation({ required: true });
                    }

                    // Add placeholder
                    field.attributes({ placeholder: supportedProperty['http://www.w3.org/ns/hydra/core#description'][0]['@value'] });

                    // list fields
                    if (supportedProperty['http://www.w3.org/ns/hydra/core#readable'][0]['@value']) {
                        readableFields.push(field);
                    }

                    // edition and creation fields
                    if (supportedProperty['http://www.w3.org/ns/hydra/core#writable'][0]['@value']) {
                        writableFields.push(field);
                    }
                });

                entity.listView().fields(readableFields);
                entity.creationView().fields(writableFields);
                entity.editionView().fields(writableFields);
                admin.addEntity(entity);

                break;
            }
        }

        return admin;
    };

    return nga;
}])
.provider('ApiPlatformHydraAdminRestangular', ['RestangularProvider', function (RestangularProvider) {
    // Automatically configure Restangular to deal with the Hydra powered API
    RestangularProvider.getRestangularProviderForHydra = function (data) {
        // The URL of the API endpoint
        RestangularProvider.setBaseUrl(data.entrypointUrl);
        RestangularProvider.setSelfLinkAbsoluteUrl(false);

        // Hydra collections support
        RestangularProvider.addResponseInterceptor(function (data, operation, what, url, response) {
            // Remove trailing slash to make Restangular working
            function populateId(data) {
                if (data['@id']) {
                    var iriParts = data['@id'].split('/');
                    data.id = iriParts[iriParts.length - 1];
                }
            }

            // Populate href property for the collection
            populateId(data);

            if ('getList' === operation) {
                // TODO the JSON-LD document should be expanded to work with other implementation than API Platform
                var collectionResponse = data['hydra:member'];
                collectionResponse.metadata = {};

                // Put metadata in a property of the collection
                angular.forEach(data, function (value, key) {
                    if ('hydra:member' !== key) {
                        collectionResponse.metadata[key] = value;
                    }
                });

                // Populate href property for all elements of the collection
                angular.forEach(collectionResponse, function (value) {
                    populateId(value);
                });

                // Pagination
                response.totalCount = data['hydra:totalItems'];

                return collectionResponse;
            }

            return data;
        });

        RestangularProvider.addFullRequestInterceptor(function(element, operation, what, url, headers, params) {
            if (operation == 'getList') {
                if (1 !== params._page) {
                    params.page = params._page;
                }
                params.itemsPerPage = params._perPage;

                delete params._page;
                delete params._perPage;
            }
            return { params: params };
        });
    };

    return RestangularProvider;
}]);
