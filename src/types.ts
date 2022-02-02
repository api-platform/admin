import type { ComponentType } from 'react';
import type { JsonLdObj } from 'jsonld/jsonld-spec';
import type {
  ArrayFieldProps,
  ArrayInputProps,
  BooleanFieldProps,
  CREATE,
  CreateParams,
  CreateProps,
  CreateResult,
  CustomRoutes,
  DELETE,
  DELETE_MANY,
  DataProvider,
  DatagridProps,
  DateFieldProps,
  DateInputProps,
  DateTimeInputProps,
  DeleteManyParams,
  DeleteManyResult,
  DeleteParams,
  DeleteResult,
  EditProps,
  EmailFieldProps,
  GET_LIST,
  GET_MANY,
  GET_MANY_REFERENCE,
  GET_ONE,
  GetListParams,
  GetListResult,
  GetManyParams,
  GetManyReferenceParams,
  GetManyReferenceResult,
  GetManyResult,
  GetOneParams,
  GetOneResult,
  HttpError,
  ListProps,
  NumberFieldProps,
  NumberInputProps,
  FilterProps as RaFilterProps,
  InputProps as RaInputProps,
  Record as RaRecord,
  ReduxState,
  ReferenceArrayFieldProps,
  ReferenceArrayInputProps,
  ReferenceFieldProps,
  ReferenceInputProps,
  ShowProps,
  SimpleFormProps,
  TextFieldProps,
  TextInputProps,
  UPDATE,
  UPDATE_MANY,
  UpdateManyParams,
  UpdateManyResult,
  UpdateParams,
  UpdateResult,
  UrlFieldProps,
} from 'react-admin';
import type { Api, Field, Resource } from '@api-platform/api-doc-parser';
import type { SwitchProps } from '@material-ui/core/Switch';
import type { FormGroupProps } from '@material-ui/core/FormGroup';

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

export interface IntrospectState {
  introspect?: IntrospectPayload;
}

export interface ApiPlatformAdminState extends ReduxState {
  introspect: IntrospectState;
}

interface IntrospectedGuesserProps {
  schemaAnalyzer: SchemaAnalyzer;
  resource: string;
  schema: Resource;
  fields: Field[];
  readableFields: Field[];
  writableFields: Field[];
}

export interface ResourcesIntrospecterProps {
  component: ComponentType<IntrospectedGuesserProps>;
  schemaAnalyzer: SchemaAnalyzer;
  includeDeprecated: boolean;
  resource: string;
  resources: Resource[];
  loading: boolean;
  error: Error | null;
}

type BaseIntrospecterProps = Pick<
  ResourcesIntrospecterProps,
  'component' | 'resource'
> &
  Partial<Pick<ResourcesIntrospecterProps, 'includeDeprecated'>>;

type CreateSimpleFormProps = CreateProps & Omit<SimpleFormProps, 'children'>;

export type IntrospectedCreateGuesserProps = CreateSimpleFormProps &
  IntrospectedGuesserProps;

export type CreateGuesserProps = Omit<
  CreateSimpleFormProps & BaseIntrospecterProps,
  'component' | 'resource'
>;

type EditSimpleFormProps = EditProps & Omit<SimpleFormProps, 'children'>;

export type IntrospectedEditGuesserProps = EditSimpleFormProps &
  IntrospectedGuesserProps;

export type EditGuesserProps = Omit<
  EditSimpleFormProps & BaseIntrospecterProps,
  'component' | 'resource'
>;

type ListDatagridProps = ListProps & DatagridProps;

export type IntrospectedListGuesserProps = ListDatagridProps &
  IntrospectedGuesserProps;

export type ListGuesserProps = Omit<
  ListDatagridProps & BaseIntrospecterProps,
  'component' | 'resource'
> &
  Partial<Pick<BaseIntrospecterProps, 'resource'>>;

type ShowSimpleFormProps = ShowProps & Omit<SimpleFormProps, 'children'>;

export type IntrospectedShowGuesserProps = ShowSimpleFormProps &
  IntrospectedGuesserProps;

export type ShowGuesserProps = Omit<
  ShowSimpleFormProps & BaseIntrospecterProps,
  'component' | 'resource'
>;

type FilterProps = Omit<RaFilterProps, 'children'> & {
  hasShow?: boolean;
  hasEdit?: boolean;
};

export type IntrospectedFiterGuesserProps = FilterProps &
  IntrospectedGuesserProps;

export type FilterGuesserProps = Omit<
  FilterProps & BaseIntrospecterProps,
  'component' | 'resource'
> &
  Partial<Pick<BaseIntrospecterProps, 'resource'>>;

export type FieldProps =
  | TextFieldProps
  | DateFieldProps
  | BooleanFieldProps
  | NumberFieldProps
  | UrlFieldProps
  | EmailFieldProps
  | ArrayFieldProps
  | ReferenceArrayFieldProps
  | ReferenceFieldProps;

export type IntrospectedFieldGuesserProps = FieldProps &
  IntrospectedGuesserProps;

export type FieldGuesserProps = Omit<
  FieldProps & BaseIntrospecterProps,
  'component' | 'resource'
> &
  Partial<Pick<BaseIntrospecterProps, 'resource'>>;

// @TODO Remove after react-admin 3.19.8 is released.
export type BooleanInputProps = RaInputProps<SwitchProps> &
  Omit<FormGroupProps, 'defaultValue' | 'onChange' | 'onBlur' | 'onFocus'>;

type InputProps =
  | TextInputProps
  | DateTimeInputProps
  | DateInputProps
  | BooleanInputProps
  | NumberInputProps
  | ArrayInputProps
  | ReferenceArrayInputProps
  | ReferenceInputProps;

export type IntrospectedInputGuesserProps = Partial<InputProps> &
  IntrospectedGuesserProps;

export type InputGuesserProps = Omit<
  InputProps & BaseIntrospecterProps,
  'component' | 'resource'
> &
  Partial<Pick<BaseIntrospecterProps, 'resource'>>;

export type IntrospecterProps = (
  | CreateGuesserProps
  | EditGuesserProps
  | FieldGuesserProps
  | FilterGuesserProps
  | InputGuesserProps
  | ListGuesserProps
  | ShowGuesserProps
) &
  BaseIntrospecterProps;
