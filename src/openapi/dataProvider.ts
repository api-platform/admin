import { parseOpenApi3Documentation } from '@api-platform/api-doc-parser';
import { fetchUtils } from 'react-admin';
import { adminDataProvider } from '../dataProvider/index.js';
import type {
  ApiPlatformAdminDataProvider,
  HttpClientOptions,
  MercureOptions,
  OpenApiDataProviderFactoryParams,
} from '../types.js';

const fetchJson = (url: URL, options: HttpClientOptions = {}) => {
  let { headers } = options;
  if (!headers) {
    headers = {};
  }
  headers = typeof headers === 'function' ? headers() : headers;
  headers = new Headers(headers);

  return fetchUtils.fetchJson(url, { ...options, headers });
};

const defaultParams: Required<
  Omit<
    OpenApiDataProviderFactoryParams,
    'entrypoint' | 'docEntrypoint' | 'dataProvider'
  >
> = {
  httpClient: fetchJson,
  apiDocumentationParser: parseOpenApi3Documentation,
  mercure: false,
};

function dataProvider(
  factoryParams: OpenApiDataProviderFactoryParams,
): ApiPlatformAdminDataProvider {
  const {
    dataProvider: {
      getList,
      getOne,
      getMany,
      getManyReference,
      update,
      updateMany,
      create,
      delete: deleteFn,
      deleteMany,
    },
    entrypoint,
    docEntrypoint,
    httpClient,
    apiDocumentationParser,
  }: Required<OpenApiDataProviderFactoryParams> = {
    ...defaultParams,
    ...factoryParams,
  };
  const entrypointUrl = new URL(entrypoint, window.location.href);
  const mercure: MercureOptions | null = factoryParams.mercure
    ? {
        hub: null,
        jwt: null,
        topicUrl: entrypointUrl,
        ...(factoryParams.mercure === true ? {} : factoryParams.mercure),
      }
    : null;

  const { introspect, subscribe, unsubscribe } = adminDataProvider({
    entrypoint,
    docEntrypoint,
    httpClient,
    apiDocumentationParser,
    mercure: factoryParams.mercure ?? false,
  });

  return {
    getList,
    getOne,
    getMany,
    getManyReference,
    update,
    updateMany,
    create,
    delete: deleteFn,
    deleteMany,
    introspect,
    subscribe: (resourceIds, callback) => {
      if (mercure?.hub === null) {
        return Promise.resolve({ data: null });
      }

      return subscribe(resourceIds, callback);
    },
    unsubscribe,
  };
}

export default dataProvider;
