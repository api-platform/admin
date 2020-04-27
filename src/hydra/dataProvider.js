import {
  CREATE,
  DELETE,
  GET_LIST,
  GET_MANY_REFERENCE,
  GET_ONE,
  UPDATE,
} from 'react-admin';
import isPlainObject from 'lodash.isplainobject';
import { parseHydraDocumentation } from '@api-platform/api-doc-parser';
import fetchHydra from './fetchHydra';
import { resolveSchemaParameters } from './schemaAnalyzer';

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
 * @param {bool} addToCache
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
  Object.keys(document).forEach((key) => {
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
      document[key] = document[key].map((obj) => {
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
export default (
  entrypoint,
  httpClient = fetchHydra,
  apiDocumentationParser = parseHydraDocumentation,
) => {
  /** @type {Api} */
  let apiSchema;

  /**
   * @param {Object} resource
   * @param {Object} data
   *
   * @returns {Promise}
   */
  const convertReactAdminDataToHydraData = (resource, data = {}) => {
    const fieldData = [];
    resource.fields.forEach(({ name, reference, normalizeData }) => {
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

    return Promise.all(fieldDataValues).then((fieldData) => {
      const object = {};
      for (let i = 0; i < fieldDataKeys.length; i++) {
        object[fieldDataKeys[i]] = fieldData[i];
      }

      return { ...data, ...object };
    });
  };

  /**
   * @param {Object} resource
   * @param {Object} data
   *
   * @returns {Promise}
   */
  const transformReactAdminDataToRequestBody = (resource, data = {}) => {
    resource = apiSchema.resources.find(({ name }) => resource === name);
    if (undefined === resource) {
      return Promise.resolve(data);
    }

    return convertReactAdminDataToHydraData(resource, data).then((data) =>
      JSON.stringify(data),
    );
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
          (body) => ({
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
          pagination: { page, perPage },
          sort: { field, order },
        } = params;

        if (order) collectionUrl.searchParams.set(`order[${field}]`, order);
        if (page) collectionUrl.searchParams.set('page', page);
        if (perPage) collectionUrl.searchParams.set('itemsPerPage', perPage);
        if (params.filter) {
          const buildFilterParams = (key, nestedFilter, rootKey) => {
            const filterValue = nestedFilter[key];

            if (Array.isArray(filterValue)) {
              filterValue.forEach((arrayFilterValue, index) => {
                collectionUrl.searchParams.set(
                  `${rootKey}[${index}]`,
                  arrayFilterValue,
                );
              });
              return;
            }

            if (!isPlainObject(filterValue)) {
              collectionUrl.searchParams.set(rootKey, filterValue);
              return;
            }

            Object.keys(filterValue).forEach((subKey) => {
              if (
                rootKey === 'exists' ||
                [
                  'after',
                  'before',
                  'strictly_after',
                  'strictly_before',
                  'lt',
                  'gt',
                  'lte',
                  'gte',
                  'between',
                ].includes(subKey)
              ) {
                return buildFilterParams(
                  subKey,
                  filterValue,
                  `${rootKey}[${subKey}]`,
                );
              }
              buildFilterParams(subKey, filterValue, `${rootKey}.${subKey}`);
            });
          };

          Object.keys(params.filter).forEach((key) => {
            buildFilterParams(key, params.filter, key);
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
          (body) => ({
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
    resource = apiSchema.resources.find(({ name }) => resource === name);
    if (undefined === resource) {
      return Promise.resolve(data);
    }

    const fieldData = {};
    resource.fields.forEach(({ name, denormalizeData }) => {
      if (!(name in data) || undefined === denormalizeData) {
        return;
      }

      fieldData[name] = denormalizeData(data[name]);
    });

    const fieldDataKeys = Object.keys(fieldData);
    const fieldDataValues = Object.values(fieldData);

    return Promise.all(fieldDataValues).then((fieldData) => {
      const object = {};
      for (let i = 0; i < fieldDataKeys.length; i++) {
        object[fieldDataKeys[i]] = fieldData[i];
      }

      return { ...data, ...object };
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
          .then((data) =>
            Promise.all(
              data.map((data) =>
                convertHydraDataToReactAdminData(resource, data),
              ),
            ),
          )
          .then((data) => ({ data, total: response.json['hydra:totalItems'] }));

      case DELETE:
        return Promise.resolve({ data: { id: null } });

      default:
        return Promise.resolve(
          transformJsonLdDocumentToReactAdminDocument(response.json),
        )
          .then((data) => convertHydraDataToReactAdminData(resource, data))
          .then((data) => ({ data }));
    }
  };

  /**
   * @param {string} type
   * @param {string} resource
   * @param {Object} params
   *
   * @returns {Promise}
   */
  const fetchApi = (type, resource, params) =>
    convertReactAdminRequestToHydraRequest(type, resource, params)
      .then(({ url, options }) => httpClient(url, options))
      .then((response) =>
        convertHydraResponseToReactAdminResponse(type, resource, response),
      );

  /**
   * @param {string} resource
   *
   * @returns {Promise<boolean>}
   */
  const hasIdSearchFilter = (resource) => {
    const schema = apiSchema.resources.find((r) => r.name === resource);
    return resolveSchemaParameters(schema).then((parameters) =>
      parameters.map((filter) => filter.variable).includes('id'),
    );
  };

  return {
    getList: (resource, params) => fetchApi(GET_LIST, resource, params),
    getOne: (resource, params) => fetchApi(GET_ONE, resource, params),
    getMany: (resource, params) => {
      return hasIdSearchFilter(resource).then((result) => {
        // Hydra doesn't handle MANY requests but if a search filter for the id is available, it is used.
        if (result) {
          return fetchApi(GET_LIST, resource, {
            pagination: {},
            sort: {},
            filter: { id: params.ids },
          });
        }

        // Else fallback to calling the ONE request n times instead.
        return Promise.all(
          params.ids.map((id) =>
            reactAdminDocumentsCache[id]
              ? Promise.resolve({ data: reactAdminDocumentsCache[id] })
              : fetchApi(GET_ONE, resource, { id }),
          ),
        ).then((responses) => ({ data: responses.map(({ data }) => data) }));
      });
    },
    getManyReference: (resource, params) =>
      fetchApi(GET_MANY_REFERENCE, resource, params),
    update: (resource, params) => fetchApi(UPDATE, resource, params),
    updateMany: (resource, params) =>
      Promise.all(
        params.ids.map((id) => fetchApi(UPDATE, resource, { id })),
      ).then(() => ({ data: [] })),
    create: (resource, params) => fetchApi(CREATE, resource, params),
    delete: (resource, params) => fetchApi(DELETE, resource, params),
    deleteMany: (resource, params) =>
      Promise.all(
        params.ids.map((id) => fetchApi(DELETE, resource, { id })),
      ).then(() => ({ data: [] })),
    introspect: () =>
      apiSchema
        ? Promise.resolve({ data: apiSchema })
        : apiDocumentationParser(entrypoint)
            .then(({ api, customRoutes = [] }) => {
              apiSchema = api;
              return { data: api, customRoutes };
            })
            .catch((error) => {
              if (error.status) {
                throw new Error(`Cannot fetch documentation: ${error.status}`);
              }
              throw error;
            }),
  };
};
