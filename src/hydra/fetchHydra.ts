import { HttpError } from 'react-admin';
import {
  fetchJsonLd,
  getDocumentationUrlFromHeaders,
} from '@api-platform/api-doc-parser';
import jsonld from 'jsonld';
import { JsonLdObj } from 'jsonld/jsonld-spec';
import { HydraHttpClientOptions, HydraHttpClientResponse } from '../types';

/**
 * Sends HTTP requests to a Hydra API.
 */
function fetchHydra(
  url: URL,
  options: HydraHttpClientOptions = {},
): Promise<HydraHttpClientResponse> {
  const requestHeaders = options.headers || new Headers();

  if (options.user && options.user.authenticated && options.user.token) {
    requestHeaders.set('Authorization', options.user.token);
  }

  const authOptions = { ...options, headers: requestHeaders };

  return fetchJsonLd(url.href, authOptions).then((data) => {
    const status = data.response.status;

    if (status < 200 || status >= 300) {
      const body = data.body;

      'trace' in body && delete body.trace;

      return jsonld
        .expand(body, {
          base: getDocumentationUrlFromHeaders(data.response.headers),
          documentLoader: (input) => fetchJsonLd(input, authOptions),
        })
        .then((json) => {
          return Promise.reject(
            new HttpError(
              (
                json[0][
                  'http://www.w3.org/ns/hydra/core#description'
                ] as JsonLdObj[]
              )?.[0]?.['@value'],
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

    if (Array.isArray(data.body)) {
      return Promise.reject('Hydra response should not be an array.');
    }
    if (!('@id' in data.body)) {
      return Promise.reject('Hydra response needs to have an @id member.');
    }

    return {
      status: status,
      headers: data.response.headers,
      json: data.body,
    };
  });
}

export default fetchHydra;
