import type { Api, Resource } from '@api-platform/api-doc-parser';
import { mercureManager } from '../mercure/index.js';
import type {
  ApiDocumentationParserResponse,
  ApiPlatformAdminDataProviderFactoryParams,
  ApiPlatformAdminRecord,
  MercureOptions,
} from '../types.js';

export default (
  factoryParams: Required<ApiPlatformAdminDataProviderFactoryParams>,
) => {
  const { entrypoint, docEntrypoint, apiDocumentationParser } = factoryParams;
  const entrypointUrl = new URL(entrypoint, window.location.href);
  const docEntrypointUrl = new URL(docEntrypoint, window.location.href);
  const mercure: MercureOptions | null = factoryParams.mercure
    ? {
        hub: null,
        jwt: null,
        topicUrl: entrypointUrl,
        ...(factoryParams.mercure === true ? {} : factoryParams.mercure),
      }
    : null;
  mercureManager.setMercureOptions(mercure);

  let apiSchema: Api & { resources: Resource[] };

  return {
    introspect: (_resource = '', _params = {}) =>
      apiSchema
        ? Promise.resolve({ data: apiSchema })
        : apiDocumentationParser(docEntrypointUrl.toString())
            .then(({ api }: ApiDocumentationParserResponse) => {
              if (api.resources && api.resources.length > 0) {
                apiSchema = { ...api, resources: api.resources };
              }
              return { data: api };
            })
            .catch((err) => {
              const { status, error } = err;
              let { message } = err;
              // Note that the `api-doc-parser` rejects with a non-standard error object hence the check
              if (error?.message) {
                message = error.message;
              }

              throw new Error(
                `Cannot fetch API documentation:\n${
                  message
                    ? `${message}\nHave you verified that CORS is correctly configured in your API?\n`
                    : ''
                }${status ? `Status: ${status}` : ''}`,
              );
            }),
    subscribe: (
      resourceIds: string[],
      callback: (document: ApiPlatformAdminRecord) => void,
    ) => {
      resourceIds.forEach((resourceId) => {
        mercureManager.subscribe(resourceId, resourceId, callback);
      });

      return Promise.resolve({ data: null });
    },
    unsubscribe: (_resource: string, resourceIds: string[]) => {
      resourceIds.forEach((resourceId) => {
        mercureManager.unsubscribe(resourceId);
      });

      return Promise.resolve({ data: null });
    },
  };
};
