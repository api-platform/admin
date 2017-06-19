import {
  GET_LIST,
  GET_ONE,
  GET_MANY,
  GET_MANY_REFERENCE,
  CREATE,
  UPDATE,
  DELETE,
  fetchUtils
} from 'admin-on-rest';
import isPlainObject from 'lodash.isplainobject'
import fetchHydra from './fetchHydra'

/**
 * Transform a Json-ld document to an Admin On Rest compatible document.
 *
 * @param {Number} depth
 * @param {Number} maxDepth
 */
export const transformJsonLdToAOR = (maxDepth = 2, depth = 1) => (doc) => {
  if (!isPlainObject(doc)) return doc;

  if ('undefined' !== typeof doc.id) {
    doc.originId = doc.id;
  }

  if (doc['@id']) doc.id = doc['@id'];

  if (depth < maxDepth) {
    Object.keys(doc).forEach((key) => {
      doc[key] = transformJsonLdToAOR(maxDepth, depth++)(doc[key]);
    });
  }

  return doc;
};

/**
 * Maps admin-on-rest queries to a Hydra powered REST API
 *
 * @see http://www.hydra-cg.com/
 * @example
 * GET_LIST     => GET http://my.api.url/posts
 * GET_ONE      => GET http://my.api.url/posts/123
 * GET_MANY     => GET http://my.api.url/posts/123, GET http://my.api.url/posts/456, GET http://my.api.url/posts/789
 * UPDATE       => PUT http://my.api.url/posts/123
 * CREATE       => POST http://my.api.url/posts/123
 * DELETE       => DELETE http://my.api.url/posts/123
 */
export default (apiUrl, httpClient = fetchHydra) => {
  /**
   * @param {String} type One of the constants appearing at the top if this file, e.g. 'UPDATE'
   * @param {String} resource Name of the resource to fetch, e.g. 'posts'
   * @param {Object} params The REST request params, depending on the type
   * @returns {Object} { url, options } The HTTP request parameters
   */
  const convertRESTRequestToHTTP = (type, resource, params) => {
    let url = '';
    const options = {};
    switch (type) {
      case GET_LIST: {
        const { page } = params.pagination;
        const { field, order } = params.sort;
        const query = {
          ...params.filter,
          sort: field,
          order: order,
          page: page,
        };
        url = `${apiUrl}/${resource}?${fetchUtils.queryParameters(query)}`;
        break;
      }
      case GET_ONE:
        url = apiUrl+params.id;
        break;
      case GET_MANY_REFERENCE:
        url = `${apiUrl}/${resource}?${fetchUtils.queryParameters({ [params.target]: params.id })}`;
        break;
      case UPDATE:
        url = apiUrl+params.id;
        options.method = 'PUT';
        options.body = JSON.stringify(params.data);
        break;
      case CREATE:
        url = `${apiUrl}/${resource}`;
        options.method = 'POST';
        options.body = JSON.stringify(params.data);
        break;
      case DELETE:
        url = apiUrl+params.id;
        options.method = 'DELETE';
        break;
      default:
        throw new Error(`Unsupported fetch action type ${type}`);
    }
    return { url, options };
  };

  /**
   * @param {Object} response - HTTP response from fetch()
   * @param {String} type     - One of the constants appearing at the top if this file, e.g. 'UPDATE'
   * @param {String} resource -  Name of the resource to fetch, e.g. 'posts'
   * @param {Object} params   - The REST request params, depending on the type
   * @returns {Object}        - REST response
   */
  const convertHTTPResponseToREST = (response, type, resource, params) => {
    switch (type) {
      case GET_LIST:
        // TODO: support other prefixes than "hydra:"
        return {
          data: response.json['hydra:member'].map(transformJsonLdToAOR()),
          total: response.json['hydra:totalItems'],
        };
      default:
        return {data: transformJsonLdToAOR()(response.json)};
    }
  };

  /**
   * @param {string} type Request type, e.g GET_LIST
   * @param {string} resource Resource name, e.g. "posts"
   * @param {Object} payload Request parameters. Depends on the request type
   * @returns {Promise} the Promise for a REST response
   */
  return (type, resource, params) => {
    // Hydra doesn't handle WHERE IN requests, so we fallback to calling GET_ONE n times instead
    if (type === GET_MANY) {
      return Promise.all(params.ids.map(id => httpClient(apiUrl+id)))
        .then((responses) => {
          const restResponse = { data: [] };
          restResponse.data = responses.map(response => response.json);
          restResponse.data.map(transformJsonLdToAOR());
          return restResponse;
        });
    }
    const { url, options } = convertRESTRequestToHTTP(type, resource, params);
    return httpClient(url, options)
      .then(response => convertHTTPResponseToREST(response, type, resource, params));
  };
};
