import HttpError from 'ra-core/lib/util/HttpError';
import fetchJsonLd from '@api-platform/api-doc-parser/lib/hydra/fetchJsonLd';
import {getDocumentationUrlFromHeaders} from '@api-platform/api-doc-parser/lib/hydra/parseHydraDocumentation';
import {promises} from 'jsonld';

/**
 * Sends HTTP requests to a Hydra API.
 *
 * Adapted from react-admin
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

  return fetchJsonLd(url, {
    ...options,
    headers: requestHeaders,
  }).then(data => {
    const status = data.response.status;

    if (status < 200 || status >= 300) {
      return promises
        .expand(data.body, {
          base: getDocumentationUrlFromHeaders(data.response.headers),
        })
        .then(json => {
          return Promise.reject(
            new HttpError(
              json[0]['http://www.w3.org/ns/hydra/core#description'][0][
                '@value'
              ],
              status,
            ),
          );
        })
        .catch(e => {
          if (e instanceof HttpError) {
            return Promise.reject(e);
          }

          return Promise.reject(
            new HttpError(data.response.statusText, status),
          );
        });
    }

    return {
      status: status,
      headers: data.response.headers,
      json: data.body,
    };
  });
};
