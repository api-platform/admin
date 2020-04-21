import { HttpError } from 'react-admin';
import {
  fetchJsonLd,
  getDocumentationUrlFromHeaders,
} from '@api-platform/api-doc-parser';
import { promises } from 'jsonld';

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
  }).then((data) => {
    const status = data.response.status;

    if (status < 200 || status >= 300) {
      const body = data.body;
      delete body.trace;

      return promises
        .expand(body, {
          base: getDocumentationUrlFromHeaders(data.response.headers),
        })
        .then((json) => {
          return Promise.reject(
            new HttpError(
              json[0]['http://www.w3.org/ns/hydra/core#description'][0][
                '@value'
              ],
              status,
              json,
            ),
          );
        })
        .catch((e) => {
          if (e.hasOwnProperty('body')) {
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
