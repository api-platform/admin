import {
  CREATE,
  DELETE,
  GET_LIST,
  GET_MANY_REFERENCE,
  GET_ONE,
  UPDATE,
} from 'react-admin';
import lodashIsPlainObject from 'lodash.isplainobject';
import { parseHydraDocumentation } from '@api-platform/api-doc-parser';
import type { JsonLdObj } from 'jsonld/jsonld-spec';
import type { Api, Field, Resource } from '@api-platform/api-doc-parser';
import type {
  CreateParams,
  DataProviderResult,
  DeleteParams,
  GetListParams,
  GetListResult,
  GetManyReferenceParams,
  GetManyReferenceResult,
  GetOneResult,
  UpdateParams,
} from 'react-admin';

import fetchHydra from './fetchHydra.js';
import { resolveSchemaParameters } from '../introspection/schemaAnalyzer.js';
import { adminDataProvider } from '../dataProvider/index.js';
import { mercureManager } from '../mercure/index.js';
import { removeTrailingSlash } from '../removeTrailingSlash.js';
import type {
  ApiPlatformAdminDataProvider,
  ApiPlatformAdminDataProviderParams,
  ApiPlatformAdminDataProviderTypeParams,
  ApiPlatformAdminRecord,
  DataProviderType,
  HydraCollection,
  HydraDataProviderFactoryParams,
  HydraHttpClientResponse,
  HydraView,
  MercureOptions,
  SearchParams,
} from '../types.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isPlainObject = (value: any): value is Record<string, any> =>
  lodashIsPlainObject(value);

let apiSchema: Api & { resources: Resource[] };

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
    if (Array.isArray(obj['@id'])) {
      throw new Error('Document needs to have a string @id member.');
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
  let clonedDocument = jsonLdDocument;
  if (clone) {
    // deep clone documents
    clonedDocument = JSON.parse(JSON.stringify(clonedDocument));
  }

  const document: ApiPlatformAdminRecord = new ReactAdminDocument(
    clonedDocument,
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
        if (addToCache && obj['@id'] && !Array.isArray(obj['@id'])) {
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

  return matches?.[1] ? matches[1] : null;
};

const defaultParams: Required<
  Omit<HydraDataProviderFactoryParams, 'entrypoint' | 'docEntrypoint'>
> = {
  httpClient: fetchHydra,
  apiDocumentationParser: parseHydraDocumentation,
  mercure: true,
  useEmbedded: true,
  disableCache: false,
};

function normalizeHydraKey(json: JsonLdObj, key: string): JsonLdObj {
  if (json[`hydra:${key}`]) {
    const copy = JSON.parse(JSON.stringify(json));
    copy[key] = copy[`hydra:${key}`];
    delete copy[`hydra:${key}`];
    return copy;
  }
  return json;
}

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
 * UPDATE   => PATCH http://my.api.url/posts/123
 */
function dataProvider(
  factoryParams: HydraDataProviderFactoryParams,
): ApiPlatformAdminDataProvider {
  const {
    entrypoint,
    httpClient,
    apiDocumentationParser,
    useEmbedded,
    disableCache,
  }: Required<Omit<HydraDataProviderFactoryParams, 'docEntrypoint'>> = {
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

  const convertReactAdminDataToHydraData = (
    resource: Resource,
    data: Record<string, unknown> = {},
  ) => {
    const reactAdminData = data;
    const fieldData: Record<string, unknown> = {};
    if (resource.fields) {
      (
        resource.fields as (Field & {
          normalizeData: (data: unknown) => unknown;
        })[]
      ).forEach(({ name, reference, normalizeData }) => {
        if (!(name in reactAdminData)) {
          return;
        }

        if (reference && reactAdminData[name] === '') {
          reactAdminData[name] = null;
          return;
        }

        if (undefined === normalizeData) {
          return;
        }

        fieldData[name] = normalizeData(reactAdminData[name]);
      });
    }

    const fieldDataKeys = Object.keys(fieldData);
    const fieldDataValues = Object.values(fieldData);

    return Promise.all(fieldDataValues).then((normalizedFieldData) => {
      const object: Record<string, unknown> = {};
      for (let i = 0; i < fieldDataKeys.length; i += 1) {
        const key = fieldDataKeys[i];
        if (key) {
          object[key] = normalizedFieldData[i];
        }
      }

      return { ...reactAdminData, ...object };
    });
  };

  const transformReactAdminDataToRequestBody = (
    apiResource: undefined | Resource,
    data: Record<string, unknown> | XMLHttpRequestBodyInit,
    extraInformation: { hasFileField?: boolean },
  ): Promise<XMLHttpRequestBodyInit> => {
    if (undefined === apiResource) {
      return Promise.resolve(data as XMLHttpRequestBodyInit);
    }

    return convertReactAdminDataToHydraData(
      apiResource,
      data as Record<string, unknown>,
    ).then((hydraData) => {
      const values = Object.values(hydraData);
      const containFile = (element: unknown): boolean =>
        Array.isArray(element)
          ? element.length > 0 && element.every((value) => containFile(value))
          : isPlainObject(element) &&
            Object.values(element as Record<string, unknown>).some(
              (value) => value instanceof File,
            );

      type ToJSONObject = { toJSON(): string };
      const hasToJSON = (
        element: string | ToJSONObject,
      ): element is ToJSONObject =>
        !!element &&
        typeof element !== 'string' &&
        typeof element.toJSON === 'function';

      if (
        !extraInformation.hasFileField &&
        !values.some((value) => containFile(value))
      ) {
        return JSON.stringify(hydraData);
      }

      const body = new FormData();
      Object.entries<string | ToJSONObject>(
        hydraData as Record<string, string | ToJSONObject>,
      ).forEach(([key, value]) => {
        // React-Admin FileInput format is an object containing a file.
        if (containFile(value)) {
          const findFile = (element: string | ToJSONObject): Blob | undefined =>
            Object.values(element).find((val) => val instanceof Blob);
          if (Array.isArray(value)) {
            value
              .map((val) => findFile(val))
              .forEach((file) => {
                body.append(key.endsWith('[]') ? key : `${key}[]`, file!);
              });
          } else {
            body.append(key, findFile(value)!);
          }

          return;
        }
        if (hasToJSON(value)) {
          body.append(key, value.toJSON());
          return;
        }
        if (isPlainObject(value) || Array.isArray(value)) {
          body.append(key, JSON.stringify(value));
          return;
        }
        body.append(key, value);
      });

      return body;
    });
  };

  const shouldUseItemUrl = (type: DataProviderType) => {
    switch (type) {
      case 'GET_ONE':
      case 'UPDATE':
      case 'DELETE':
        return true;
      default:
        return false;
    }
  };

  const convertReactAdminRequestToHydraRequest = (
    type: DataProviderType,
    resource: string,
    dataProviderParams: ApiPlatformAdminDataProviderParams,
  ) => {
    const params = dataProviderParams;
    let url: URL;
    if ('id' in params && shouldUseItemUrl(type)) {
      url = new URL(params.id.toString(), entrypointUrl);
    } else {
      url = new URL(
        `${removeTrailingSlash(entrypointUrl.toString())}/${resource}`,
        entrypointUrl,
      );
    }

    const searchParams: SearchParams = params.searchParams ?? {};
    const searchParamKeys = Object.keys(searchParams);
    searchParamKeys.forEach((searchParamKey) => {
      const searchParam = searchParams[searchParamKey];
      if (searchParam) {
        url.searchParams.set(searchParamKey, searchParam);
      }
    });
    let extraInformation: { hasFileField?: boolean } = {};
    if (typeof params.meta === 'object') {
      extraInformation = params.meta;
    }

    const apiResource = (apiSchema?.resources ?? []).find(
      ({ name }) => resource === name,
    );

    let updateHttpMethod = 'POST';

    if (!extraInformation.hasFileField) {
      updateHttpMethod =
        apiResource?.operations?.find((operation) => operation.type === 'edit')
          ?.method ?? 'PUT';
    }

    switch (type) {
      case CREATE:
        return transformReactAdminDataToRequestBody(
          apiResource,
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
        const { pagination, sort, filter } = params as
          | GetListParams
          | GetManyReferenceParams;
        const { page, perPage } = pagination ?? { page: 1, perPage: 25 };
        const { field, order } = sort ?? { field: 'id', order: 'DESC' };
        if (order && field) {
          field.split(',').forEach((fieldName) => {
            url.searchParams.set(`order[${fieldName.trim()}]`, order);
          });
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
                buildFilterParams(subKey, filterValue, `${rootKey}[${subKey}]`);
                return;
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
        return transformReactAdminDataToRequestBody(
          apiResource,
          (params as UpdateParams).data,
          extraInformation,
        ).then((body) => ({
          options: {
            body,
            method: updateHttpMethod,
            headers:
              updateHttpMethod === 'PATCH'
                ? { 'content-type': 'application/merge-patch+json' }
                : {},
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

    return Promise.all(fieldDataValues).then((normalizedFieldData) => {
      const object: Record<string, unknown> = {};
      for (let i = 0; i < fieldDataKeys.length; i += 1) {
        const key = fieldDataKeys[i];
        if (key) {
          object[key] = normalizedFieldData[i];
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
    if (mercure !== null && mercure.hub === null) {
      const hubUrl = extractHubUrl(response);
      if (hubUrl) {
        mercure.hub = hubUrl;
        mercureManager.setMercureOptions(mercure);
        mercureManager.initSubscriptions();
      }
    }

    switch (type) {
      case GET_LIST:
      case GET_MANY_REFERENCE: {
        if (!response.json) {
          return Promise.reject(
            new Error(`An empty response was received for "${type}".`),
          );
        }
        const json = normalizeHydraKey(response.json, 'member');
        if (!json.member) {
          return Promise.reject(
            new Error("Response doesn't have a member field."),
          );
        }
        // TODO: support other prefixes than "hydra:"
        let hydraCollection = json as HydraCollection;
        return Promise.resolve(
          hydraCollection.member.map((document: JsonLdObj) =>
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
              data.map((hydraData) =>
                convertHydraDataToReactAdminData(resource, hydraData),
              ),
            ),
          )
          .then((data) => {
            hydraCollection = normalizeHydraKey(
              hydraCollection,
              'totalItems',
            ) as HydraCollection;
            if (hydraCollection.totalItems !== undefined) {
              return {
                data,
                total: hydraCollection.totalItems,
              };
            }
            hydraCollection = normalizeHydraKey(
              hydraCollection,
              'view',
            ) as HydraCollection;
            if (hydraCollection.view) {
              let hydraView = normalizeHydraKey(
                hydraCollection.view,
                'next',
              ) as HydraView;
              hydraView = normalizeHydraKey(hydraView, 'previous') as HydraView;
              const pageInfo = {
                hasNextPage: !!hydraView.next,
                hasPreviousPage: !!hydraView.previous,
              };
              return {
                data,
                pageInfo,
              };
            }

            return {
              data,
            };
          });
      }
      case DELETE:
        return Promise.resolve({ data: { id: (params as DeleteParams).id } });

      default:
        if (!response.json) {
          return Promise.reject(
            new Error(`An empty response was received for "${type}".`),
          );
        }
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
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
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
    const pageParams = params;

    const pageResult = (await fetchApi(type, resource, pageParams)) as
      | GetListResult
      | GetManyReferenceResult;

    const result = previousResult ?? pageResult;
    if (previousResult) {
      result.data.push(...pageResult.data);
      if (pageResult.total && result.total && pageResult.total < result.total) {
        // The total can have changed between 2 requests
        result.total = pageResult.total;
      }
    }

    // Minimalist infinite loop protection
    if (
      pageParams.pagination?.page &&
      pageParams.pagination?.page >= result.data.length
    ) {
      return result;
    }

    if (
      pageResult.data.length > 0 &&
      ((!!result.total && result.data.length < result.total) ||
        result.pageInfo?.hasNextPage)
    ) {
      if (pageParams.pagination) {
        pageParams.pagination.page += 1;
      } else {
        pageParams.pagination = { page: 2, perPage: 25 };
      }
      return fetchAllPages(type, resource, pageParams, result);
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

  const { introspect, subscribe, unsubscribe } = adminDataProvider({
    entrypoint,
    docEntrypoint: entrypoint,
    httpClient,
    apiDocumentationParser,
    mercure: factoryParams.mercure ?? true,
  });
  mercureManager.setDataTransformer((jsonLdDocument) =>
    transformJsonLdDocumentToReactAdminDocument(
      jsonLdDocument,
      true,
      !disableCache,
      useEmbedded,
    ),
  );

  return {
    getList: (resource, params) => fetchApi(GET_LIST, resource, params),
    getOne: (resource, params) => fetchApi(GET_ONE, resource, params),

    getMany: (resource, params) =>
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      hasIdSearchFilter(resource).then((result) => {
        // Hydra doesn't handle MANY requests but if a search filter for the id is available, it is used.
        if (result) {
          return fetchAllPages(GET_LIST, resource, {
            pagination: {
              // Asking for the good amount of items, as we could want to retrieve more items than the default amount sent by the API.
              perPage: params.ids?.length,
              page: 1,
            },
            filter: { id: params.ids },
            sort: { field: '', order: 'ASC' },
          }).then(({ data }) => ({ data }));
        }

        // Else fallback to calling the ONE request n times instead.
        return Promise.all(
          params.ids.map((id) => {
            const document = reactAdminDocumentsCache.get(id.toString());
            if (document) {
              return Promise.resolve({ data: document });
            }
            return fetchApi(GET_ONE, resource, { id }) as Promise<
              GetOneResult<ApiPlatformAdminRecord>
            >;
          }),
        ).then((responses) => ({ data: responses.map(({ data }) => data) }));
      }),
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
      introspect().then(({ data }) => {
        if (data.resources && data.resources.length > 0) {
          apiSchema = { ...data, resources: data.resources };
        }

        return { data };
      }),
    subscribe,
    unsubscribe,
  };
}

export default dataProvider;
