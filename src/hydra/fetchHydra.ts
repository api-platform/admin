import { HttpError } from 'react-admin';
import {
  fetchJsonLd,
  getDocumentationUrlFromHeaders,
} from '@api-platform/api-doc-parser';
import jsonld from 'jsonld';
import type { NodeObject } from 'jsonld';
import type { JsonLdObj } from 'jsonld/jsonld-spec';
import type { HttpClientOptions, HydraHttpClientResponse } from '../types.js';

/**
 * Sends HTTP requests to a Hydra API.
 */
function fetchHydra(
  url: URL,
  options: HttpClientOptions = {},
): Promise<HydraHttpClientResponse> {
  let requestHeaders = options.headers ?? new Headers();

  if (
    typeof requestHeaders !== 'function' &&
    options.user &&
    options.user.authenticated &&
    options.user.token
  ) {
    requestHeaders = new Headers(requestHeaders);
    requestHeaders.set('Authorization', options.user.token);
  }

  const authOptions = { ...options, headers: requestHeaders };

  return fetchJsonLd(url.href, authOptions).then((data) => {
    const { status, statusText, headers } = data.response;
    const body = 'body' in data ? data.body : undefined;

    if (status < 200 || status >= 300) {
      if (!body) {
        return Promise.reject(new HttpError(statusText, status));
      }

      delete (body as NodeObject).trace;

      const documentLoader = (input: string) =>
        fetchJsonLd(input, authOptions).then((response) => {
          if (!('body' in response)) {
            throw new Error(
              'An empty response was received when expanding JSON-LD error document.',
            );
          }
          return response;
        });

      return jsonld
        .expand(body, {
          base: getDocumentationUrlFromHeaders(headers),
          documentLoader,
        })
        .then((json) =>
          Promise.reject(
            new HttpError(
              (
                json[0][
                  'http://www.w3.org/ns/hydra/core#description'
                ] as JsonLdObj[]
              )?.[0]?.['@value'],
              status,
              json,
            ),
          ),
        )
        .catch((e) => {
          if ('body' in e) {
            return Promise.reject(e);
          }

          return Promise.reject(new HttpError(statusText, status));
        });
    }

    if (Array.isArray(body)) {
      return Promise.reject(
        new Error('Hydra response should not be an array.'),
      );
    }
    if (body && !('@id' in body)) {
      return Promise.reject(
        new Error('Hydra response needs to have an @id member.'),
      );
    }

    return {
      status,
      headers,
      json: body,
    };
  });
}

export default fetchHydra;
