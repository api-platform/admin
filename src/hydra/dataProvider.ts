import {
  CREATE,
  DELETE,
  GET_LIST,
  GET_MANY_REFERENCE,
  GET_ONE,
  UPDATE,
  CreateParams,
  DataProviderResult,
  DeleteParams,
  GetListParams,
  GetListResult,
  GetOneResult,
  GetManyReferenceParams,
  GetManyReferenceResult,
  UpdateParams,
} from 'react-admin';
import { JsonLdObj } from 'jsonld/jsonld-spec';
import lodashIsPlainObject from 'lodash.isplainobject';
import {
  Api,
  Resource,
  parseHydraDocumentation,
  Field,
} from '@api-platform/api-doc-parser';
import fetchHydra from './fetchHydra';
import { resolveSchemaParameters } from './schemaAnalyzer';
import {
  ApiDocumentationParserResponse,
  ApiPlatformAdminDataProvider,
  ApiPlatformAdminDataProviderParams,
  ApiPlatformAdminDataProviderTypeParams,
  ApiPlatformAdminRecord,
  DataProviderType,
  HydraCollection,
  HydraDataProviderFactoryParams,
  HydraHttpClientResponse,
  MercureOptions,
  MercureSubscription,
  SearchParams,
} from '../types';

const isPlainObject = (value: any): value is object =>
  lodashIsPlainObject(value);

class ReactAdminDocument implements ApiPlatformAdminRecord {
  originId?: string;
  id: string;

  constructor(obj: JsonLdObj) {
    Object.assign(this, obj);
    if (obj.id) {
      this.originId = obj.id.toString();
    }
    if (!obj['@id']) {
      throw new Error('Document needs to have an @id member.');
    }
    this.id = obj['@id'];
  }

  toString() {
    return `[object ${this.id}]`;
  }
}

/**
 * Local cache containing embedded documents.
 * It will be used to prevent useless extra HTTP query if the relation is displayed.
 */
const reactAdminDocumentsCache = new Map<string, ApiPlatformAdminRecord>();

/**
 * Transforms a JSON-LD document to a react-admin compatible document.
 */
export const transformJsonLdDocumentToReactAdminDocument = (
  jsonLdDocument: JsonLdObj,
  clone = true,
  addToCache = true,
  useEmbedded = false,
): ApiPlatformAdminRecord => {
  if (clone) {
    // deep clone documents
    jsonLdDocument = JSON.parse(JSON.stringify(jsonLdDocument));
  }

  const document: ApiPlatformAdminRecord = new ReactAdminDocument(
    jsonLdDocument,
  );

  // Replace embedded objects by their IRIs, and store the object itself in the cache to reuse without issuing new HTTP requests.
  Object.keys(document).forEach((key) => {
    // to-one
    if (isPlainObject(document[key]) && document[key]['@id']) {
      if (addToCache) {
        reactAdminDocumentsCache.set(
          document[key]['@id'],
          transformJsonLdDocumentToReactAdminDocument(
            document[key],
            false,
            false,
          ),
        );
      }
      document[key] = useEmbedded ? document[key] : document[key]['@id'];

      return;
    }

    // to-many
    if (
      Array.isArray(document[key]) &&
      document[key].length &&
      isPlainObject(document[key][0]) &&
      document[key][0]['@id']
    ) {
      document[key] = document[key].map((obj: JsonLdObj) => {
        if (addToCache && obj['@id']) {
          reactAdminDocumentsCache.set(
            obj['@id'],
            transformJsonLdDocumentToReactAdminDocument(obj, false, false),
          );
        }

        return useEmbedded ? obj : obj['@id'];
      });
    }
  });

  return document;
};

const extractHubUrl = (response: HydraHttpClientResponse) => {
  const linkHeader = response.headers.get('Link');
  if (!linkHeader) {
    return null;
  }

  const matches = linkHeader.match(
    /<([^>]+)>;\s+rel=(?:mercure|"[^"]*mercure[^"]*")/,
  );

  return matches && matches[1] ? matches[1] : null;
};

const createSubscription = (
  mercure: MercureOptions,
  topic: string,
  callback: (document: ApiPlatformAdminRecord) => void,
): MercureSubscription => {
  if (mercure.hub === null) {
    return {
      subscribed: false,
      topic,
      callback,
      count: 1,
    };
  }

  const url = new URL(mercure.hub, window.origin);
  url.searchParams.append('topic', new URL(topic, mercure.topicUrl).toString());

  if (mercure.jwt !== null) {
    document.cookie = `mercureAuthorization=${mercure.jwt}; Path=${mercure.hub}; Secure; SameSite=None`;
  }

  const eventSource = new EventSource(url.toString(), {
    withCredentials: mercure.jwt !== null,
  });
  const eventListener = (event: MessageEvent) => {
    const document = transformJsonLdDocumentToReactAdminDocument(
      JSON.parse(event.data),
    );
    // the only need for this callback is for accessing redux's `dispatch` method to update RA's state.
    callback(document);
  };
  eventSource.addEventListener('message', eventListener);

  return {
    subscribed: true,
    topic,
    callback,
    eventSource,
    eventListener,
    count: 1,
  };
};

const defaultParams: Required<
  Omit<HydraDataProviderFactoryParams, 'entrypoint'>
> = {
  httpClient: fetchHydra,
  apiDocumentationParser: parseHydraDocumentation,
  mercure: {},
  useEmbedded: false,
  disableCache: false,
};

/**
 * Maps react-admin queries to a Hydra powered REST API
 *
 * @see http://www.hydra-cg.com/
 *
 * @example
 * CREATE   => POST http://my.api.url/posts/123
 * DELETE   => DELETE http://my.api.url/posts/123
 * GET_LIST => GET http://my.api.url/posts
 * GET_MANY => GET http://my.api.url/posts/123, GET http://my.api.url/posts/456, GET http://my.api.url/posts/789
 * GET_ONE  => GET http://my.api.url/posts/123
 * UPDATE   => PUT http://my.api.url/posts/123
 */
function dataProvider(
  entrypointOrParams: string | HydraDataProviderFactoryParams,
  httpClient = fetchHydra,
  apiDocumentationParser = parseHydraDocumentation,
  useEmbedded = false, // remove this parameter for 3.0 (as true)
): ApiPlatformAdminDataProvider {
  let entrypoint: string;
  let mercure: MercureOptions;
  let disableCache: boolean;
  if (typeof entrypointOrParams === 'string') {
    entrypoint = entrypointOrParams;
    mercure = {
      hub: null,
      jwt: null,
      topicUrl: entrypoint,
    };
    disableCache = false;
  }
  if (typeof entrypointOrParams === 'object') {
    const params: Required<HydraDataProviderFactoryParams> = {
      ...defaultParams,
      ...entrypointOrParams,
    };
    entrypoint = params.entrypoint;
    httpClient = params.httpClient;
    apiDocumentationParser = params.apiDocumentationParser;
    mercure = {
      hub: null,
      jwt: null,
      topicUrl: params.entrypoint,
      ...params.mercure,
    };
    disableCache = params.disableCache;
    useEmbedded = params.useEmbedded;
  } else {
    console.warn(
      'Passing a list of arguments for building the data provider is deprecated. Please use an object instead.',
    );
  }

  let apiSchema: Api & { resources: Resource[] };

  // store mercure subscriptions
  const subscriptions: Record<string, MercureSubscription> = {};

  const convertReactAdminDataToHydraData = (
    resource: Resource,
    data: Record<string, unknown> = {},
  ) => {
    const fieldData: Record<string, unknown> = {};
    if (resource.fields) {
      (
        resource.fields as (Field & {
          normalizeData: (data: unknown) => unknown;
        })[]
      ).forEach(({ name, reference, normalizeData }) => {
        if (!(name in data)) {
          return;
        }

        if (reference && data[name] === '') {
          data[name] = null;
          return;
        }

        if (undefined === normalizeData) {
          return;
        }

        fieldData[name] = normalizeData(data[name]);
      });
    }

    const fieldDataKeys = Object.keys(fieldData);
    const fieldDataValues = Object.values(fieldData);

    return Promise.all(fieldDataValues).then((fieldData) => {
      const object: Record<string, unknown> = {};
      for (let i = 0; i < fieldDataKeys.length; i++) {
        const key = fieldDataKeys[i];
        if (key) {
          object[key] = fieldData[i];
        }
      }

      return { ...data, ...object };
    });
  };

  const transformReactAdminDataToRequestBody = (
    resource: string,
    data: Record<string, unknown> | XMLHttpRequestBodyInit,
    extraInformation: { hasFileField?: boolean },
  ): Promise<XMLHttpRequestBodyInit> => {
    const apiResource = apiSchema.resources.find(
      ({ name }) => resource === name,
    );
    if (undefined === apiResource) {
      return Promise.resolve(data as XMLHttpRequestBodyInit);
    }

    return convertReactAdminDataToHydraData(
      apiResource,
      data as Record<string, unknown>,
    ).then((data) => {
      const values = Object.values(data);
      const containFile = (element: unknown) =>
        isPlainObject(element) &&
        Object.values(element as Record<string, unknown>).some(
          (value) => value instanceof File,
        );
      type toJSONObject = { toJSON(): string };
      const hasToJSON = (
        element: string | toJSONObject,
      ): element is toJSONObject =>
        !!element &&
        'string' !== typeof element &&
        'function' === typeof element.toJSON;

      if (
        !extraInformation.hasFileField &&
        !values.some((value) => containFile(value))
      ) {
        return JSON.stringify(data);
      }

      const body = new FormData();
      Object.entries<string | toJSONObject>(
        data as Record<string, string | toJSONObject>,
      ).map(([key, value]) => {
        // React-Admin FileInput format is an object containing a file.
        if (containFile(value)) {
          return body.append(
            key,
            Object.values(value).find((value) => value instanceof File),
          );
        }
        if (hasToJSON(value)) {
          return body.append(key, value.toJSON());
        }
        if (isPlainObject(value) || Array.isArray(value)) {
          return body.append(key, JSON.stringify(value));
        }
        return body.append(key, value);
      });

      return body;
    });
  };

  const convertReactAdminRequestToHydraRequest = (
    type: DataProviderType,
    resource: string,
    params: ApiPlatformAdminDataProviderParams,
  ) => {
    const entrypointUrl = new URL(entrypoint, window.location.href);
    let url: URL;
    if ('id' in params) {
      url = new URL(params.id.toString(), entrypointUrl);
    } else {
      url = new URL(`${entrypoint}/${resource}`, entrypointUrl);
    }

    const searchParams: SearchParams = params.searchParams || {};
    for (const searchParamKey in searchParams) {
      if (!searchParams.hasOwnProperty(searchParamKey)) {
        continue;
      }
      const searchParam = searchParams[searchParamKey];
      if (searchParam) {
        url.searchParams.set(searchParamKey, searchParam);
      }
    }
    let extraInformation: { hasFileField?: boolean } = {};
    if ('data' in params && params.data.extraInformation) {
      extraInformation = params.data.extraInformation;
      delete params.data.extraInformation;
    }

    switch (type) {
      case CREATE:
        return transformReactAdminDataToRequestBody(
          resource,
          (params as CreateParams).data,
          extraInformation,
        ).then((body) => ({
          options: {
            body,
            method: 'POST',
          },
          url,
        }));

      case DELETE:
        return Promise.resolve({
          options: {
            method: 'DELETE',
          },
          url,
        });

      case GET_LIST:
      case GET_MANY_REFERENCE: {
        const {
          pagination: { page, perPage },
          sort: { field, order },
          filter,
        } = params as GetListParams | GetManyReferenceParams;

        if (order && field) {
          url.searchParams.set(`order[${field}]`, order);
        }
        if (page) url.searchParams.set('page', page.toString());
        if (perPage) url.searchParams.set('itemsPerPage', perPage.toString());
        if (filter) {
          const buildFilterParams = (
            key: string,
            nestedFilter: Record<
              string,
              | string
              | boolean
              | number
              | Record<string, string | boolean | number>
            >,
            rootKey: string,
          ) => {
            const filterValue = nestedFilter[key];
            if (filterValue === undefined) {
              return;
            }

            if (Array.isArray(filterValue)) {
              filterValue.forEach((arrayFilterValue, index) => {
                url.searchParams.set(`${rootKey}[${index}]`, arrayFilterValue);
              });
              return;
            }

            if (!isPlainObject(filterValue)) {
              url.searchParams.set(rootKey, filterValue.toString());
              return;
            }

            Object.keys(filterValue).forEach((subKey) => {
              if (
                rootKey === 'exists' ||
                [
                  'after',
                  'before',
                  'strictly_after',
                  'strictly_before',
                  'lt',
                  'gt',
                  'lte',
                  'gte',
                  'between',
                ].includes(subKey)
              ) {
                return buildFilterParams(
                  subKey,
                  filterValue,
                  `${rootKey}[${subKey}]`,
                );
              }
              buildFilterParams(subKey, filterValue, `${rootKey}.${subKey}`);
            });
          };

          Object.keys(filter).forEach((key) => {
            buildFilterParams(key, filter, key);
          });
        }

        if (type === GET_MANY_REFERENCE) {
          const { target, id } = params as GetManyReferenceParams;
          if (target) {
            url.searchParams.set(target, id.toString());
          }
        }

        return Promise.resolve({
          options: {},
          url,
        });
      }

      case GET_ONE:
        return Promise.resolve({
          options: {},
          url,
        });

      case UPDATE:
        const updateHttpMethod = extraInformation.hasFileField ? 'POST' : 'PUT';
        return transformReactAdminDataToRequestBody(
          resource,
          (params as UpdateParams).data,
          extraInformation,
        ).then((body) => ({
          options: {
            body,
            method: updateHttpMethod,
          },
          url,
        }));

      default:
        throw new Error(`Unsupported fetch action type ${type}`);
    }
  };

  const convertHydraDataToReactAdminData = (
    resource: string,
    data: ApiPlatformAdminRecord,
  ) => {
    const apiResource = apiSchema.resources.find(
      ({ name }) => resource === name,
    );
    if (undefined === apiResource) {
      return Promise.resolve(data);
    }

    const fieldData: Record<string, unknown> = {};
    if (apiResource.fields) {
      (
        apiResource.fields as (Field & {
          denormalizeData: (data: unknown) => unknown;
        })[]
      ).forEach(({ name, denormalizeData }) => {
        if (!(name in data) || undefined === denormalizeData) {
          return;
        }

        fieldData[name] = denormalizeData(data[name]);
      });
    }

    const fieldDataKeys = Object.keys(fieldData);
    const fieldDataValues = Object.values(fieldData);

    return Promise.all(fieldDataValues).then((fieldData) => {
      const object: Record<string, unknown> = {};
      for (let i = 0; i < fieldDataKeys.length; i++) {
        const key = fieldDataKeys[i];
        if (key) {
          object[key] = fieldData[i];
        }
      }

      return { ...data, ...object };
    });
  };

  const convertHydraResponseToReactAdminResponse = (
    type: DataProviderType,
    resource: string,
    params: ApiPlatformAdminDataProviderParams,
    response: HydraHttpClientResponse,
  ): Promise<DataProviderResult<ApiPlatformAdminRecord>> => {
    if (mercure.hub === null) {
      const hubUrl = extractHubUrl(response);
      if (hubUrl) {
        mercure.hub = hubUrl;
        for (const subKey in subscriptions) {
          const sub = subscriptions[subKey];
          if (sub && !sub.subscribed) {
            subscriptions[subKey] = createSubscription(
              mercure,
              sub.topic,
              sub.callback,
            );
          }
        }
      }
    }

    switch (type) {
      case GET_LIST:
      case GET_MANY_REFERENCE:
        // TODO: support other prefixes than "hydra:"
        const hydraCollection = response.json as HydraCollection;
        return Promise.resolve(
          hydraCollection['hydra:member'].map((document) =>
            transformJsonLdDocumentToReactAdminDocument(
              document,
              true,
              !disableCache,
              useEmbedded,
            ),
          ),
        )
          .then((data) =>
            Promise.all(
              data.map((data) =>
                convertHydraDataToReactAdminData(resource, data),
              ),
            ),
          )
          .then((data) => ({
            data,
            total: hydraCollection.hasOwnProperty('hydra:totalItems')
              ? hydraCollection['hydra:totalItems']
              : hydraCollection['hydra:view']
              ? hydraCollection['hydra:view']['hydra:next']
                ? -2 // there is a next page
                : -1 // no next page
              : -3, // no information
          }));

      case DELETE:
        return Promise.resolve({ data: { id: (params as DeleteParams).id } });

      default:
        return Promise.resolve(
          transformJsonLdDocumentToReactAdminDocument(
            response.json,
            true,
            !disableCache,
            useEmbedded,
          ),
        )
          .then((data) => convertHydraDataToReactAdminData(resource, data))
          .then((data) => ({ data }));
    }
  };

  const fetchApi = <
    T extends DataProviderType,
    R extends DataProviderResult<ApiPlatformAdminRecord>,
  >(
    type: T,
    resource: string,
    params: ApiPlatformAdminDataProviderTypeParams<T>,
  ): Promise<R> =>
    // @ts-ignore
    convertReactAdminRequestToHydraRequest(type, resource, params)
      .then(({ url, options }) => httpClient(url, options))
      .then((response) =>
        convertHydraResponseToReactAdminResponse(
          type,
          resource,
          params,
          response,
        ),
      );

  /*
   * The fetchAllPages method allows running as many requests as needed in order to load all pages of a list.
   * This function uses the already transformed react-admin response data and could be improved by using the hydra pagination.
   */
  const fetchAllPages = async (
    type: typeof GET_LIST | typeof GET_MANY_REFERENCE,
    resource: string,
    params: GetListParams | GetManyReferenceParams,
    previousResult?: GetListResult | GetManyReferenceResult,
  ): Promise<GetListResult | GetManyReferenceResult> => {
    const pageParams: GetListParams | GetManyReferenceParams = {
      ...params,
    };

    const pageResult = (await fetchApi(type, resource, pageParams)) as
      | GetListResult
      | GetManyReferenceResult;

    const result = previousResult ?? pageResult;
    if (previousResult) {
      result.data.push(...pageResult.data);
      if (pageResult.total < result.total) {
        // The total can have changed between 2 requests
        result.total = pageResult.total;
      }
    }

    // Minimalist infinite loop protection
    if (params.pagination.page >= result.data.length) {
      return result;
    }

    if (pageResult.data.length > 0 && result.data.length < result.total) {
      params.pagination.page += 1;
      return fetchAllPages(type, resource, params, result);
    }

    return result;
  };

  const hasIdSearchFilter = (resource: string) => {
    const schema = apiSchema.resources.find((r) => r.name === resource);
    if (!schema) {
      return Promise.resolve(false);
    }
    return resolveSchemaParameters(schema).then((parameters) =>
      parameters.map((filter) => filter.variable).includes('id'),
    );
  };

  return {
    getList: (resource, params) => fetchApi(GET_LIST, resource, params),
    getOne: (resource, params) => fetchApi(GET_ONE, resource, params),
    getMany: (resource, params) => {
      return hasIdSearchFilter(resource).then((result) => {
        // Hydra doesn't handle MANY requests but if a search filter for the id is available, it is used.
        if (result) {
          return fetchAllPages(GET_LIST, resource, {
            pagination: {
              // Asking for the good amount of items, as we could want to retrieve more items than the default amount sent by the API.
              perPage: params.ids?.length,
              page: 1,
            },
            filter: { id: params.ids },
            sort: { field: '', order: '' },
          }).then(({ data }) => ({ data }));
        }

        // Else fallback to calling the ONE request n times instead.
        return Promise.all(
          params.ids.map((id) => {
            const document = reactAdminDocumentsCache.get(id.toString());
            if (document) {
              return Promise.resolve(document);
            }
            return fetchApi(GET_ONE, resource, { id }) as Promise<GetOneResult>;
          }),
        ).then((responses) => ({ data: responses.map(({ data }) => data) }));
      });
    },
    getManyReference: (resource, params) =>
      fetchApi(GET_MANY_REFERENCE, resource, params),
    update: (resource, params) => fetchApi(UPDATE, resource, params),
    updateMany: (resource, params) =>
      Promise.all(
        params.ids.map((id) =>
          fetchApi(UPDATE, resource, { ...params, id, previousData: { id } }),
        ),
      ).then(() => ({ data: [] })),
    create: (resource, params) => fetchApi(CREATE, resource, params),
    delete: (resource, params) => fetchApi(DELETE, resource, params),
    deleteMany: (resource, params) =>
      Promise.all(
        params.ids.map((id) => fetchApi(DELETE, resource, { id })),
      ).then(() => ({ data: [] })),
    introspect: (_resource = '', _params = {}) =>
      apiSchema
        ? Promise.resolve({ data: apiSchema })
        : apiDocumentationParser(entrypoint)
            .then(
              ({ api, customRoutes = [] }: ApiDocumentationParserResponse) => {
                if (api.resources && api.resources.length > 0) {
                  apiSchema = { ...api, resources: api.resources };
                }
                return { data: api, customRoutes };
              },
            )
            .catch((err) => {
              const { status, error } = err;
              let { message } = err;
              // Note that the `api-doc-parser` rejects with a non-standard error object hence the check
              if (error && error.message) {
                message = error.message;
              }

              throw new Error(
                'Cannot fetch API documentation:\n' +
                  (message
                    ? `${message}\nHave you verified that CORS is correctly configured in your API?\n`
                    : '') +
                  (status ? `Status: ${status}` : ''),
              );
            }),
    subscribe: (resourceIds, callback) => {
      resourceIds.forEach((resourceId) => {
        const sub = subscriptions[resourceId];
        if (sub !== undefined) {
          sub.count++;
          return;
        }

        subscriptions[resourceId] = createSubscription(
          mercure,
          resourceId,
          callback,
        );
      });

      return Promise.resolve({ data: null });
    },
    unsubscribe: (_resource, resourceIds) => {
      resourceIds.forEach((resourceId) => {
        const sub = subscriptions[resourceId];
        if (sub === undefined) {
          return;
        }

        sub.count--;

        if (sub.count <= 0) {
          if (sub.subscribed && sub.eventSource && sub.eventListener) {
            sub.eventSource.removeEventListener('message', sub.eventListener);
          }
          delete subscriptions[resourceId];
        }
      });

      return Promise.resolve({ data: null });
    },
  };
}

export default dataProvider;
