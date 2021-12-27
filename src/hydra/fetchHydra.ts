import { HttpError } from 'react-admin';
import {
  fetchJsonLd,
  getDocumentationUrlFromHeaders,
} from '@api-platform/api-doc-parser';
import jsonld from 'jsonld';

interface FetchHydraOptions {
  headers?: Headers;
  user?: {
    authenticated: boolean;
    token: string;
  };
}

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
function fetchHydra(url: URL, options: FetchHydraOptions = {}) {
  const requestHeaders = options.headers || new Headers();

  if (options.user && options.user.authenticated && options.user.token) {
    requestHeaders.set('Authorization', options.user.token);
  }

  const authOptions = { ...options, headers: requestHeaders };

  return fetchJsonLd(url.href, authOptions).then((data) => {
    const status = data.response.status;

    if (status < 200 || status >= 300) {
      const body = data.body;

      // @ts-ignore
      delete body.trace;

      return (
        jsonld
          // TODO: Fix fetchJsonLd return (from api-doc-parser) missing property
          // https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/jsonld/jsonld-spec.d.ts
          // @ts-ignore
          .expand(body, {
            base: getDocumentationUrlFromHeaders(data.response.headers),
            documentLoader: (input) => fetchJsonLd(input, authOptions),
          })
          .then((json) => {
            return Promise.reject(
              new HttpError(
                json[0]['http://www.w3.org/ns/hydra/core#description']?.[0][
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
          })
      );
    }

    return {
      status: status,
      headers: data.response.headers,
      json: data.body,
    };
  });
}

export default fetchHydra;
