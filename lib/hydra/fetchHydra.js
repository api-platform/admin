import _Promise from 'babel-runtime/core-js/promise';
import _extends from 'babel-runtime/helpers/extends';
import HttpError from 'admin-on-rest/lib/util/HttpError';
import fetchJsonLd from 'api-doc-parser/lib/hydra/fetchJsonLd';
import { getDocumentationUrlFromHeaders } from 'api-doc-parser/lib/hydra/parseHydraDocumentation';
import { promises } from 'jsonld';

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
export default (function (url) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var requestHeaders = options.headers || new Headers();

  if (options.user && options.user.authenticated && options.user.token) {
    requestHeaders.set('Authorization', options.user.token);
  }

  return fetchJsonLd(url, _extends({}, options, {
    headers: requestHeaders
  })).then(function (data) {
    var status = data.response.status;

    if (status < 200 || status >= 300) {
      return promises.expand(data.body, {
        base: getDocumentationUrlFromHeaders(data.response.headers)
      }).then(function (json) {
        return _Promise.reject(new HttpError(json[0]['http://www.w3.org/ns/hydra/core#description'][0]['@value'], status));
      }).catch(function (e) {
        if (e instanceof HttpError) {
          return _Promise.reject(e);
        }

        return _Promise.reject(new HttpError(data.response.statusText, status));
      });
    }

    return {
      status: status,
      headers: data.response.headers,
      json: data.body
    };
  });
});