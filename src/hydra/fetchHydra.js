import HttpError from 'admin-on-rest/lib/util/HttpError'
import fetchJsonLd from 'api-doc-parser/lib/hydra/fetchJsonLd';
import {getDocumentationUrlFromHeaders} from  'api-doc-parser/lib/hydra/parseHydraDocumentation'
import {promises} from 'jsonld';

/**
 * Sends HTTP requests to a Hydra API.
 *
 * Adapted from AdminBuilder On Rest
 *
 * @copyright Kévin Dunglas
 *
 * @param {string} url
 * @param {object} options
 * @return {object}
 */
export default (url, options = {}) => {
  const requestHeaders = options.headers || new Headers();

  if (options.user && options.user.authenticated && options.user.token) {
    requestHeaders.set('Authorization', options.user.token);
  }

  return fetchJsonLd(url, { ...options, headers: requestHeaders })
    .then(data => {
      if (data.response.status < 200 || data.response.status >= 300) {
        return promises
          .expand(data.body, { base: getDocumentationUrlFromHeaders(data.response.headers) })
          .then(json => {
            try {
              return Promise.reject(new Error(json[0]['http://www.w3.org/ns/hydra/core#description'][0]['@value']));
            } catch (e) {
              return Promise.reject(new HttpError(data.response.statusText, status));
            }
          })
          .catch(() => {
            return Promise.reject(new HttpError(data.response.statusText, status));
          })
      }
      return {
        'status': data.response.status,
        'headers': data.response.headers,
        'json': data.body
      };
    });
};
