import {
  CREATE,
  DELETE,
  fetchUtils,
  GET_LIST,
  GET_MANY,
  GET_MANY_REFERENCE,
  GET_ONE,
  UPDATE,
} from 'admin-on-rest';
import isPlainObject from 'lodash.isplainobject';
import fetchHydra from './fetchHydra';

/**
 * Transforms a JSON-LD document to an admin-on-rest compatible document
 *
 * @param {number} maxDepth
 * @param {number} depth
 */
export const transformJsonLdDocumentToAORDocument = (
  maxDepth = 2,
  depth = 1,
) => documents => {
  if (!isPlainObject(documents) && !Array.isArray(documents)) {
    return documents;
  }

  documents = Array.isArray(documents)
    ? Array.from(documents)
    : Object.assign({}, documents, {
        originId: documents.id,
        id: documents['@id'],
      });

  if (depth < maxDepth) {
    depth++;

    if (Array.isArray(documents)) {
      documents = documents.map(document =>
        transformJsonLdDocumentToAORDocument(maxDepth, depth)(document),
      );
    } else {
      Object.keys(documents).forEach(key => {
        documents[key] = transformJsonLdDocumentToAORDocument(maxDepth, depth)(
          documents[key],
        );
      });
    }
  }

  return documents;
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
export default ({entrypoint, resources = []}, httpClient = fetchHydra) => {
  /**
   * @param {string} resource
   * @param {Object} data
   *
   * @returns {Promise}
   */
  const convertAORDataToHydraData = (resource, data = {}) => {
    resource = resources.find(({name}) => resource === name);
    if (undefined === resource) {
      return Promise.resolve(data);
    }

    const fieldData = [];
    resource.fields.forEach(({name, normalizeData}) => {
      if (!(name in data) || undefined === normalizeData) {
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
   * @param {string} type
   * @param {string} resource
   * @param {Object} params
   *
   * @returns {Object}
   */
  const convertAORRequestToHydraRequest = (type, resource, params) => {
    switch (type) {
      case CREATE:
        return convertAORDataToHydraData(resource, params.data).then(data => ({
          options: {
            body: JSON.stringify(data),
            method: 'POST',
          },
          url: `${entrypoint}/${resource}`,
        }));

      case DELETE:
        return Promise.resolve({
          options: {
            method: 'DELETE',
          },
          url: entrypoint + params.id,
        });

      case GET_LIST: {
        const {pagination: {page}} = params;

        return Promise.resolve({
          options: {},
          url: `${entrypoint}/${resource}?${fetchUtils.queryParameters({
            ...params.filter,
            page,
          })}`,
        });
      }

      case GET_MANY_REFERENCE:
        return Promise.resolve({
          options: {},
          url: `${entrypoint}/${resource}?${fetchUtils.queryParameters({
            [params.target]: params.id,
          })}`,
        });

      case GET_ONE:
        return Promise.resolve({
          options: {},
          url: entrypoint + params.id,
        });

      case UPDATE:
        return convertAORDataToHydraData(resource, params.data).then(data => ({
          options: {
            body: JSON.stringify(data),
            method: 'PUT',
          },
          url: entrypoint + params.id,
        }));

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
  const convertHydraDataToAORData = (resource, data = {}) => {
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
  const convertHydraResponseToAORResponse = (type, resource, response) => {
    switch (type) {
      case GET_LIST:
        // TODO: support other prefixes than "hydra:"
        return Promise.resolve(
          response.json['hydra:member'].map(
            transformJsonLdDocumentToAORDocument(),
          ),
        )
          .then(data =>
            Promise.all(
              data.map(data => convertHydraDataToAORData(resource, data)),
            ),
          )
          .then(data => ({data, total: response.json['hydra:totalItems']}));

      default:
        return Promise.resolve(
          transformJsonLdDocumentToAORDocument()(response.json),
        )
          .then(data => convertHydraDataToAORData(resource, data))
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
    // Hydra doesn't handle WHERE IN requests, so we fallback to calling GET_ONE n times instead
    if (GET_MANY === type) {
      return Promise.all(
        params.ids.map(id => fetchApi(GET_ONE, resource, {id})),
      ).then(responses => ({data: responses}));
    }

    return convertAORRequestToHydraRequest(type, resource, params)
      .then(({url, options}) => httpClient(url, options))
      .then(response =>
        convertHydraResponseToAORResponse(type, resource, response),
      );
  };

  return fetchApi;
};
