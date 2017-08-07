import _JSON$stringify from 'babel-runtime/core-js/json/stringify';
import _extends from 'babel-runtime/helpers/extends';
import _Object$values from 'babel-runtime/core-js/object/values';
import _Promise from 'babel-runtime/core-js/promise';
import _Object$keys from 'babel-runtime/core-js/object/keys';
import _Object$assign from 'babel-runtime/core-js/object/assign';
import _Array$from from 'babel-runtime/core-js/array/from';
import { CREATE, DELETE, fetchUtils, GET_LIST, GET_MANY, GET_MANY_REFERENCE, GET_ONE, UPDATE } from 'admin-on-rest';
import isArray from 'lodash.isarray';
import isPlainObject from 'lodash.isplainobject';
import fetchHydra from './fetchHydra';

/**
 * Transforms a JSON-LD document to an admin-on-rest compatible document
 *
 * @param {number} maxDepth
 * @param {number} depth
 */
export var transformJsonLdDocumentToAORDocument = function transformJsonLdDocumentToAORDocument() {
  var maxDepth = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 2;
  var depth = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
  return function (documents) {
    if (!isPlainObject(documents) && !isArray(documents)) {
      return documents;
    }

    documents = isArray(documents) ? _Array$from(documents) : _Object$assign({}, documents, {
      originId: documents.id,
      id: documents['@id']
    });

    if (depth < maxDepth) {
      depth++;

      if (isArray(documents)) {
        documents = documents.map(function (document) {
          return transformJsonLdDocumentToAORDocument(maxDepth, depth)(document);
        });
      } else {
        _Object$keys(documents).forEach(function (key) {
          documents[key] = transformJsonLdDocumentToAORDocument(maxDepth, depth)(documents[key]);
        });
      }
    }

    return documents;
  };
};

/**
 * Maps admin-on-rest queries to a Hydra powered REST API
 *
 * @see http://www.hydra-cg.com/
 *
 * @example
 * CREATE   => POST http://my.api.url/posts/123
 * DELETE   => DELETE http://my.api.url/posts/123
 * GET_LIST => GET http://my.api.url/posts
 * GET_MANY => GET http://my.api.url/posts/123, GET http://my.api.url/posts/456, GET http://my.api.url/posts/789
 * GET_ONE  => GET http://my.api.url/posts/123
 * UPDATE   => PUT http://my.api.url/posts/123
 */
export default (function (_ref) {
  var entrypoint = _ref.entrypoint,
      _ref$resources = _ref.resources,
      resources = _ref$resources === undefined ? [] : _ref$resources;
  var httpClient = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : fetchHydra;

  /**
   * @param {string} resource
   * @param {Object} data
   *
   * @returns {Promise}
   */
  var convertAORDataToHydraData = function convertAORDataToHydraData(resource) {
    var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    resource = resources.find(function (_ref2) {
      var name = _ref2.name;
      return resource === name;
    });
    if (undefined === resource) {
      return _Promise.resolve(data);
    }

    var fieldData = [];
    resource.fields.forEach(function (_ref3) {
      var name = _ref3.name,
          normalizeData = _ref3.normalizeData;

      if (!(name in data) || undefined === normalizeData) {
        return;
      }

      fieldData[name] = normalizeData(data[name]);
    });

    var fieldDataKeys = _Object$keys(fieldData);
    var fieldDataValues = _Object$values(fieldData);

    return _Promise.all(fieldDataValues).then(function (fieldData) {
      var object = {};
      for (var i = 0; i < fieldDataKeys.length; i++) {
        object[fieldDataKeys[i]] = fieldData[i];
      }

      return _extends({}, data, object);
    });
  };

  /**
   * @param {string} type
   * @param {string} resource
   * @param {Object} params
   *
   * @returns {Object}
   */
  var convertAORRequestToHydraRequest = function convertAORRequestToHydraRequest(type, resource, params) {
    var _fetchUtils$queryPara;

    switch (type) {
      case CREATE:
        return convertAORDataToHydraData(resource, params.data).then(function (data) {
          return {
            options: {
              body: _JSON$stringify(data),
              method: 'POST'
            },
            url: entrypoint + '/' + resource
          };
        });

      case DELETE:
        return _Promise.resolve({
          options: {
            method: 'DELETE'
          },
          url: entrypoint + params.id
        });

      case GET_LIST:
        {
          var page = params.pagination.page;


          return _Promise.resolve({
            options: {},
            url: entrypoint + '/' + resource + '?' + fetchUtils.queryParameters(_extends({}, params.filter, {
              page: page
            }))
          });
        }

      case GET_MANY_REFERENCE:
        return _Promise.resolve({
          options: {},
          url: entrypoint + '/' + resource + '?' + fetchUtils.queryParameters((_fetchUtils$queryPara = {}, _fetchUtils$queryPara[params.target] = params.id, _fetchUtils$queryPara))
        });

      case GET_ONE:
        return _Promise.resolve({
          options: {},
          url: entrypoint + params.id
        });

      case UPDATE:
        return convertAORDataToHydraData(resource, params.data).then(function (data) {
          return {
            options: {
              body: _JSON$stringify(data),
              method: 'PUT'
            },
            url: entrypoint + params.id
          };
        });

      default:
        throw new Error('Unsupported fetch action type ' + type);
    }
  };

  /**
   * @param {string} resource
   * @param {Object} data
   *
   * @returns {Promise}
   */
  var convertHydraDataToAORData = function convertHydraDataToAORData(resource) {
    var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    resource = resources.find(function (_ref4) {
      var name = _ref4.name;
      return resource === name;
    });
    if (undefined === resource) {
      return _Promise.resolve(data);
    }

    var fieldData = {};
    resource.fields.forEach(function (_ref5) {
      var name = _ref5.name,
          denormalizeData = _ref5.denormalizeData;

      if (!(name in data) || undefined === denormalizeData) {
        return;
      }

      fieldData[name] = denormalizeData(data[name]);
    });

    var fieldDataKeys = _Object$keys(fieldData);
    var fieldDataValues = _Object$values(fieldData);

    return _Promise.all(fieldDataValues).then(function (fieldData) {
      var object = {};
      for (var i = 0; i < fieldDataKeys.length; i++) {
        object[fieldDataKeys[i]] = fieldData[i];
      }

      return _extends({}, data, object);
    });
  };

  /**
   * @param {Object} response
   * @param {string} resource
   * @param {string} type
   *
   * @returns {Promise}
   */
  var convertHydraResponseToAORResponse = function convertHydraResponseToAORResponse(type, resource, response) {
    switch (type) {
      case GET_LIST:
        // TODO: support other prefixes than "hydra:"
        return _Promise.resolve(response.json['hydra:member'].map(transformJsonLdDocumentToAORDocument())).then(function (data) {
          return _Promise.all(data.map(function (data) {
            return convertHydraDataToAORData(resource, data);
          }));
        }).then(function (data) {
          return { data: data, total: response.json['hydra:totalItems'] };
        });

      default:
        return _Promise.resolve(transformJsonLdDocumentToAORDocument()(response.json)).then(function (data) {
          return convertHydraDataToAORData(resource, data);
        }).then(function (data) {
          return { data: data };
        });
    }
  };

  /**
   * @param {string} type
   * @param {string} resource
   * @param {Object} params
   *
   * @returns {Promise}
   */
  var fetchApi = function fetchApi(type, resource, params) {
    // Hydra doesn't handle WHERE IN requests, so we fallback to calling GET_ONE n times instead
    if (GET_MANY === type) {
      return _Promise.all(params.ids.map(function (id) {
        return fetchApi(GET_ONE, resource, { id: id });
      })).then(function (responses) {
        return { data: responses };
      });
    }

    return convertAORRequestToHydraRequest(type, resource, params).then(function (_ref6) {
      var url = _ref6.url,
          options = _ref6.options;
      return httpClient(url, options);
    }).then(function (response) {
      return convertHydraResponseToAORResponse(type, resource, response);
    });
  };

  return fetchApi;
});