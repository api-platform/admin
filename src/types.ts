import { JsonLdObj } from 'jsonld/jsonld-spec';
import {
  CREATE,
  CreateParams,
  CreateResult,
  CustomRoutes,
  DataProvider,
  DELETE,
  DELETE_MANY,
  DeleteManyParams,
  DeleteManyResult,
  DeleteParams,
  DeleteResult,
  GET_LIST,
  GET_MANY,
  GET_MANY_REFERENCE,
  GET_ONE,
  GetListParams,
  GetListResult,
  GetManyParams,
  GetManyResult,
  GetManyReferenceParams,
  GetManyReferenceResult,
  GetOneParams,
  GetOneResult,
  Record as RaRecord,
  UPDATE,
  UPDATE_MANY,
  UpdateManyParams,
  UpdateManyResult,
  UpdateParams,
  UpdateResult,
  HttpError,
  ReduxState,
} from 'react-admin';
import { Api, Field, Resource } from '@api-platform/api-doc-parser';

export interface ApiPlatformAdminRecord extends RaRecord {
  originId?: string;
}

export type Hydra = JsonLdObj | HydraCollection;

export interface HydraView extends JsonLdObj {
  '@type': 'hydra:PartialCollectionView';
  'hydra:first': string;
  'hydra:last': string;
  'hydra:next': string;
}

export interface HydraCollection extends JsonLdObj {
  'hydra:member': JsonLdObj[];
  'hydra:totalItems'?: number;
  'hydra:view'?: HydraView;
}

export interface HydraHttpClientOptions {
  headers?: HeadersInit | (() => HeadersInit);
  user?: {
    authenticated: boolean;
    token: string;
  };
}

export interface HydraHttpClientResponse {
  status: number;
  headers: Headers;
  json: Hydra;
}

export interface ApiDocumentationParserOptions
  extends Omit<RequestInit, 'headers'> {
  headers?: HeadersInit | (() => HeadersInit);
}

export interface ApiDocumentationParserResponse {
  api: Api;
  response: Response;
  status: number;
  customRoutes?: CustomRoutes;
}

export interface SubmissionErrors {
  [key: string]: string;
}

export interface SchemaAnalyzer {
  getFieldNameFromSchema: (schema: Resource) => string;
  getOrderParametersFromSchema: (schema: Resource) => Promise<string[]>;
  getFiltersParametersFromSchema: (
    schema: Resource,
  ) => Promise<FilterParameter[]>;
  getFieldType: (
    field: Field,
  ) =>
    | 'id'
    | 'email'
    | 'url'
    | 'array'
    | 'integer'
    | 'float'
    | 'boolean'
    | 'date'
    | 'dateTime'
    | 'text';
  getSubmissionErrors: (error: HttpError) => null | SubmissionErrors;
}

export interface MercureOptions {
  hub: string | null;
  jwt: string | null;
  topicUrl: string;
}

export interface MercureSubscription {
  subscribed: boolean;
  topic: string;
  callback: (document: ApiPlatformAdminRecord) => void;
  count: number;
  eventSource?: EventSource;
  eventListener?: (event: MessageEvent) => void;
}

export interface SearchParams {
  [key: string]: string;
}

export interface ApiPlatformAdminGetListParams extends GetListParams {
  searchParams?: SearchParams;
}

export interface ApiPlatformAdminGetOneParams extends GetOneParams {
  searchParams?: SearchParams;
}

export interface ApiPlatformAdminGetManyParams extends GetManyParams {
  searchParams?: SearchParams;
}

export interface ApiPlatformAdminGetManyReferenceParams
  extends GetManyReferenceParams {
  searchParams?: SearchParams;
}

export interface ApiPlatformAdminUpdateParams extends UpdateParams {
  searchParams?: SearchParams;
}

export interface ApiPlatformAdminUpdateManyParams extends UpdateManyParams {
  searchParams?: SearchParams;
}

export interface ApiPlatformAdminCreateParams extends CreateParams {
  searchParams?: SearchParams;
}

export interface ApiPlatformAdminDeleteParams extends DeleteParams {
  searchParams?: SearchParams;
}

export interface ApiPlatformAdminDeleteManyParams extends DeleteManyParams {
  searchParams?: SearchParams;
}

export type ApiPlatformAdminDataProviderParams =
  | ApiPlatformAdminGetListParams
  | ApiPlatformAdminGetOneParams
  | ApiPlatformAdminGetManyParams
  | ApiPlatformAdminGetManyReferenceParams
  | ApiPlatformAdminUpdateParams
  | ApiPlatformAdminUpdateManyParams
  | ApiPlatformAdminCreateParams
  | ApiPlatformAdminDeleteParams
  | ApiPlatformAdminDeleteManyParams;
export type DataProviderType =
  | typeof GET_LIST
  | typeof GET_ONE
  | typeof GET_MANY
  | typeof GET_MANY_REFERENCE
  | typeof UPDATE
  | typeof UPDATE_MANY
  | typeof CREATE
  | typeof DELETE
  | typeof DELETE_MANY;
export type ApiPlatformAdminDataProviderTypeParams<T extends DataProviderType> =
  T extends typeof GET_LIST
    ? ApiPlatformAdminGetListParams
    : T extends typeof GET_ONE
    ? ApiPlatformAdminGetOneParams
    : T extends typeof GET_MANY
    ? ApiPlatformAdminGetManyParams
    : T extends typeof GET_MANY_REFERENCE
    ? ApiPlatformAdminGetManyReferenceParams
    : T extends typeof UPDATE
    ? ApiPlatformAdminUpdateParams
    : T extends typeof UPDATE_MANY
    ? ApiPlatformAdminUpdateManyParams
    : T extends typeof CREATE
    ? ApiPlatformAdminCreateParams
    : T extends typeof DELETE
    ? ApiPlatformAdminDeleteParams
    : T extends typeof DELETE_MANY
    ? ApiPlatformAdminDeleteManyParams
    : never;

export interface HydraDataProviderFactoryParams {
  entrypoint: string;
  httpClient?: (
    url: URL,
    options?: HydraHttpClientOptions,
  ) => Promise<HydraHttpClientResponse>;
  apiDocumentationParser?: (
    entrypointUrl: string,
    options?: ApiDocumentationParserOptions,
  ) => Promise<ApiDocumentationParserResponse>;
  mercure?: Partial<MercureOptions>;
  useEmbedded?: boolean;
  disableCache?: boolean;
}

export interface ApiPlatformAdminDataProvider extends DataProvider {
  getList: <RecordType extends ApiPlatformAdminRecord>(
    resource: string,
    params: ApiPlatformAdminGetListParams,
  ) => Promise<GetListResult<RecordType>>;
  getOne: <RecordType extends ApiPlatformAdminRecord>(
    resource: string,
    params: ApiPlatformAdminGetOneParams,
  ) => Promise<GetOneResult<RecordType>>;
  getMany: <RecordType extends ApiPlatformAdminRecord>(
    resource: string,
    params: ApiPlatformAdminGetManyParams,
  ) => Promise<GetManyResult<RecordType>>;
  getManyReference: <RecordType extends ApiPlatformAdminRecord>(
    resource: string,
    params: ApiPlatformAdminGetManyReferenceParams,
  ) => Promise<GetManyReferenceResult<RecordType>>;
  update: <RecordType extends ApiPlatformAdminRecord>(
    resource: string,
    params: ApiPlatformAdminUpdateParams,
  ) => Promise<UpdateResult<RecordType>>;
  updateMany: (
    resource: string,
    params: ApiPlatformAdminUpdateManyParams,
  ) => Promise<UpdateManyResult>;
  create: <RecordType extends ApiPlatformAdminRecord>(
    resource: string,
    params: ApiPlatformAdminCreateParams,
  ) => Promise<CreateResult<RecordType>>;
  delete: <RecordType extends ApiPlatformAdminRecord>(
    resource: string,
    params: ApiPlatformAdminDeleteParams,
  ) => Promise<DeleteResult<RecordType>>;
  deleteMany: (
    resource: string,
    params: ApiPlatformAdminDeleteManyParams,
  ) => Promise<DeleteManyResult>;
  introspect: (
    _resource?: string,
    _params?: object,
  ) => Promise<{
    data: Api;
    customRoutes?: CustomRoutes;
  }>;
  subscribe: (
    resourceIds: string[],
    callback: (document: ApiPlatformAdminRecord) => void,
  ) => Promise<{ data: null }>;
  unsubscribe: (
    _resource: string,
    resourceIds: string[],
  ) => Promise<{ data: null }>;
}

export interface FilterParameter {
  name: string;
  isRequired: boolean;
}

export interface IntrospectPayload {
  data: Api;
}

export interface ApiPlatformAdminState extends ReduxState {
  introspect: {
    introspect?: IntrospectPayload;
  };
}

export interface IntrospectedGuesserProps {
  schemaAnalyzer: SchemaAnalyzer;
  resource: string;
  schema: Resource;
  fields: Field[];
  readableFields: Field[];
  writableFields: Field[];
}
