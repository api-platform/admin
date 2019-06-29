import {
  CREATE,
  DELETE,
  DELETE_MANY,
  GET_LIST,
  GET_MANY,
  GET_MANY_REFERENCE,
  GET_ONE,
  UPDATE,
} from 'react-admin';
import isPlainObject from 'lodash.isplainobject';
import fetchHydra from './fetchHydra';

class ReactAdminDocument {
  constructor(obj) {
    Object.assign(this, obj, {
      originId: obj.id,
      id: obj['@id'],
    });
  }

  /**
   * @return {string}
   */
  toString() {
    return `[object ${this.id}]`;
  }
}

/**
 * Local cache containing embedded documents.
 * It will be used to prevent useless extra HTTP query if the relation is displayed.
 *
 * @type {Map}
 */
const reactAdminDocumentsCache = new Map();

/**
 * Transforms a JSON-LD document to a react-admin compatible document.
 *
 * @param {Object} document
 * @param {bool} clone
 *
 * @return {ReactAdminDocument}
 */
export const transformJsonLdDocumentToReactAdminDocument = (
  document,
  clone = true,
  addToCache = true,
) => {
  if (clone) {
    // deep clone documents
    document = JSON.parse(JSON.stringify(document));
  }

  // The main document is a JSON-LD document, convert it and store it in the cache
  if (document['@id']) {
    document = new ReactAdminDocument(document);
  }

  // Replace embedded objects by their IRIs, and store the object itself in the cache to reuse without issuing new HTTP requests.
  Object.keys(document).forEach(key => {
    // to-one
    if (isPlainObject(document[key]) && document[key]['@id']) {
      if (addToCache) {
        reactAdminDocumentsCache[
          document[key]['@id']
        ] = transformJsonLdDocumentToReactAdminDocument(
          document[key],
          false,
          false,
        );
      }
      document[key] = document[key]['@id'];

      return;
    }

    // to-many
    if (
      Array.isArray(document[key]) &&
      document[key].length &&
      isPlainObject(document[key][0]) &&
      document[key][0]['@id']
    ) {
      document[key] = document[key].map(obj => {
        if (addToCache) {
          reactAdminDocumentsCache[
            obj['@id']
          ] = transformJsonLdDocumentToReactAdminDocument(obj, false, false);
        }

        return obj['@id'];
      });
    }
  });

  return document;
};

/**
 * Maps react-admin queries to a Hydra powered REST API
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
export default ({entrypoint, resources = []}, httpClient = fetchHydra) => {
  /**
   * @param {Object} resource
   * @param {Object} data
   *
   * @returns {Promise}
   */
  const convertReactAdminDataToHydraData = (resource, data = {}) => {
    const fieldData = [];
    resource.fields.forEach(({name, reference, normalizeData}) => {
      if (!(name in data)) {
        return;
      }

      if (reference && data[name] === '') {
        data[name] = null;
        return;
      }

      if (undefined === normalizeData) {
        return;
      }

      fieldData[name] = normalizeData(data[name]);
    });

    const fieldDataKeys = Object.keys(fieldData);
    const fieldDataValues = Object.values(fieldData);

    return Promise.all(fieldDataValues).then(fieldData => {
      const object = {};
      for (let i = 0; i < fieldDataKeys.length; i++) {
        object[fieldDataKeys[i]] = fieldData[i];
      }

      return {...data, ...object};
    });
  };

  /**
   * @param {Object} resource
   * @param {Object} data
   *
   * @returns {Promise}
   */
  const transformReactAdminDataToRequestBody = (resource, data = {}) => {
    resource = resources.find(({name}) => resource === name);
    if (undefined === resource) {
      return Promise.resolve(data);
    }

    return convertReactAdminDataToHydraData(resource, data).then(data => {
      return undefined === resource.encodeData
        ? JSON.stringify(data)
        : resource.encodeData(data);
    });
  };

  /**
   * @param {string} type
   * @param {string} resource
   * @param {Object} params
   *
   * @returns {Object}
   */
  const convertReactAdminRequestToHydraRequest = (type, resource, params) => {
    const entrypointUrl = new URL(entrypoint, window.location.href);
    const collectionUrl = new URL(`${entrypoint}/${resource}`, entrypointUrl);
    const itemUrl = new URL(params.id, entrypointUrl);

    switch (type) {
      case CREATE:
        return transformReactAdminDataToRequestBody(resource, params.data).then(
          body => ({
            options: {
              body,
              method: 'POST',
            },
            url: collectionUrl,
          }),
        );

      case DELETE:
        return Promise.resolve({
          options: {
            method: 'DELETE',
          },
          url: itemUrl,
        });

      case GET_LIST:
      case GET_MANY_REFERENCE: {
        const {
          pagination: {page, perPage},
          sort: {field, order},
        } = params;

        if (order) collectionUrl.searchParams.set(`order[${field}]`, order);
        if (page) collectionUrl.searchParams.set('page', page);
        if (perPage) collectionUrl.searchParams.set('perPage', perPage);
        if (params.filter) {
          Object.keys(params.filter).forEach(key => {
            const filterValue = params.filter[key];
            if (!isPlainObject(filterValue)) {
              collectionUrl.searchParams.set(key, params.filter[key]);
              return;
            }

            Object.keys(filterValue).forEach(subKey => {
              collectionUrl.searchParams.set(
                `${key}.${subKey}`,
                filterValue[subKey],
              );
            });
          });
        }

        if (type === GET_MANY_REFERENCE && params.target) {
          collectionUrl.searchParams.set(params.target, params.id);
        }

        return Promise.resolve({
          options: {},
          url: collectionUrl,
        });
      }

      case GET_ONE:
        return Promise.resolve({
          options: {},
          url: itemUrl,
        });

      case UPDATE:
        return transformReactAdminDataToRequestBody(resource, params.data).then(
          body => ({
            options: {
              body,
              method: 'PUT',
            },
            url: itemUrl,
          }),
        );

      default:
        throw new Error(`Unsupported fetch action type ${type}`);
    }
  };

  /**
   * @param {string} resource
   * @param {Object} data
   *
   * @returns {Promise}
   */
  const convertHydraDataToReactAdminData = (resource, data = {}) => {
    resource = resources.find(({name}) => resource === name);
    if (undefined === resource) {
      return Promise.resolve(data);
    }

    const fieldData = {};
    resource.fields.forEach(({name, denormalizeData}) => {
      if (!(name in data) || undefined === denormalizeData) {
        return;
      }

      fieldData[name] = denormalizeData(data[name]);
    });

    const fieldDataKeys = Object.keys(fieldData);
    const fieldDataValues = Object.values(fieldData);

    return Promise.all(fieldDataValues).then(fieldData => {
      const object = {};
      for (let i = 0; i < fieldDataKeys.length; i++) {
        object[fieldDataKeys[i]] = fieldData[i];
      }

      return {...data, ...object};
    });
  };

  /**
   * @param {Object} response
   * @param {string} resource
   * @param {string} type
   *
   * @returns {Promise}
   */
  const convertHydraResponseToReactAdminResponse = (
    type,
    resource,
    response,
  ) => {
    switch (type) {
      case GET_LIST:
      case GET_MANY_REFERENCE:
        // TODO: support other prefixes than "hydra:"
        return Promise.resolve(
          response.json['hydra:member'].map(
            transformJsonLdDocumentToReactAdminDocument,
          ),
        )
          .then(data =>
            Promise.all(
              data.map(data =>
                convertHydraDataToReactAdminData(resource, data),
              ),
            ),
          )
          .then(data => ({data, total: response.json['hydra:totalItems']}));

      case DELETE:
        return Promise.resolve({data: {id: null}});

      default:
        return Promise.resolve(
          transformJsonLdDocumentToReactAdminDocument(response.json),
        )
          .then(data => convertHydraDataToReactAdminData(resource, data))
          .then(data => ({data}));
    }
  };

  /**
   * @param {string} type
   * @param {string} resource
   * @param {Object} params
   *
   * @returns {Promise}
   */
  const fetchApi = (type, resource, params) => {
    // Hydra doesn't handle MANY requests, so we fallback to calling the ONE request n times instead
    switch (type) {
      case GET_MANY:
        return Promise.all(
          params.ids.map(id =>
            reactAdminDocumentsCache[id]
              ? Promise.resolve({data: reactAdminDocumentsCache[id]})
              : fetchApi(GET_ONE, resource, {id}),
          ),
        ).then(responses => ({data: responses.map(({data}) => data)}));

      case DELETE_MANY:
        return Promise.all(
          params.ids.map(id => fetchApi(DELETE, resource, {id})),
        ).then(responses => ({data: []}));

      default:
        return convertReactAdminRequestToHydraRequest(type, resource, params)
          .then(({url, options}) => httpClient(url, options))
          .then(response =>
            convertHydraResponseToReactAdminResponse(type, resource, response),
          );
    }
  };

  return fetchApi;
};
