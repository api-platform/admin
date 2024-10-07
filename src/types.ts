import type { ComponentType, ReactNode } from 'react';
import type { JsonLdObj } from 'jsonld/jsonld-spec';
import type {
  ArrayFieldProps,
  ArrayInputProps,
  BooleanFieldProps,
  BooleanInputProps,
  CREATE,
  CreateParams,
  CreateProps,
  CreateResult,
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
  RaRecord,
  ReferenceArrayFieldProps,
  ReferenceArrayInputProps,
  ReferenceFieldProps,
  ReferenceInputProps,
  ResourceProps,
  SelectArrayInputProps,
  SelectInputProps,
  ShowProps,
  SimpleFormProps,
  SingleFieldListProps,
  TabbedFormProps,
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
import type { SxProps } from '@mui/system';

type PickRename<T, K extends keyof T, R extends PropertyKey> = {
  [P in keyof T as P extends K ? R : P]: T[P];
};

export interface ApiPlatformAdminRecord extends RaRecord {
  originId?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DataTransformer = (parsedData: any) => ApiPlatformAdminRecord;

export type Hydra = JsonLdObj | HydraCollection;

export interface HydraView extends JsonLdObj {
  '@type': string;
  first: string;
  last: string;
  next: string;
  previous: string;
}

export interface HydraCollection extends JsonLdObj {
  member: JsonLdObj[];
  totalItems?: number;
  view?: HydraView;
}

export interface HttpClientOptions {
  headers?: HeadersInit | (() => HeadersInit);
  user?: {
    authenticated: boolean;
    token: string;
  };
  method?: string;
  body?: XMLHttpRequestBodyInit;
}

export interface HttpClientResponse {
  status: number;
  headers: Headers;
  json?: unknown;
}

export interface HydraHttpClientResponse extends HttpClientResponse {
  json?: Hydra;
}

export interface ApiDocumentationParserOptions
  extends Omit<RequestInit, 'headers'> {
  headers?: HeadersInit | (() => HeadersInit);
}

export interface ApiDocumentationParserResponse {
  api: Api;
  response: Response;
  status: number;
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
    | 'integer_id'
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
  topicUrl: URL;
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

export interface ApiPlatformAdminDataProviderFactoryParams {
  entrypoint: string;
  docEntrypoint?: string;
  httpClient?: (
    url: URL,
    options?: HttpClientOptions,
  ) => Promise<HttpClientResponse>;
  apiDocumentationParser?: (
    entrypointUrl: string,
    options?: ApiDocumentationParserOptions,
  ) => Promise<ApiDocumentationParserResponse>;
  mercure?: Partial<MercureOptions> | boolean;
}

export interface HydraDataProviderFactoryParams
  extends ApiPlatformAdminDataProviderFactoryParams {
  httpClient?: (
    url: URL,
    options?: HttpClientOptions,
  ) => Promise<HydraHttpClientResponse>;
  useEmbedded?: boolean;
  disableCache?: boolean;
}

export interface OpenApiDataProviderFactoryParams
  extends ApiPlatformAdminDataProviderFactoryParams {
  docEntrypoint: string;
  dataProvider: DataProvider;
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
  ) => Promise<IntrospectPayload>;
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

export type IntrospectedResourceGuesserProps = Omit<ResourceProps, 'name'> &
  IntrospectedGuesserProps;

export type ResourceGuesserProps = Omit<
  ResourceProps & Omit<BaseIntrospecterProps, 'resource'>,
  'component'
>;

type CreateFormProps = Omit<
  CreateProps & SimpleFormProps & TabbedFormProps,
  'children'
> &
  Partial<PickRename<CreateProps, 'component', 'viewComponent'>> &
  Partial<
    PickRename<SimpleFormProps & TabbedFormProps, 'component', 'formComponent'>
  > & {
    children?: ReactNode;
  };

export type IntrospectedCreateGuesserProps = CreateFormProps &
  IntrospectedGuesserProps;

export type CreateGuesserProps = Omit<
  CreateFormProps & Omit<BaseIntrospecterProps, 'resource'>,
  'component'
>;

type EditFormProps = Omit<
  EditProps & SimpleFormProps & TabbedFormProps,
  'children'
> &
  Partial<PickRename<EditProps, 'component', 'viewComponent'>> &
  Partial<
    PickRename<SimpleFormProps & TabbedFormProps, 'component', 'formComponent'>
  > & {
    children?: ReactNode;
  };

export type IntrospectedEditGuesserProps = EditFormProps &
  IntrospectedGuesserProps;

export type EditGuesserProps = Omit<
  EditFormProps & Omit<BaseIntrospecterProps, 'resource'>,
  'component'
>;

type ListDatagridProps = Omit<
  ListProps & Omit<DatagridProps, 'sx'>,
  'children'
> & {
  datagridSx?: SxProps;
  children?: ReactNode;
};

export type IntrospectedListGuesserProps = ListDatagridProps &
  IntrospectedGuesserProps;

export type ListGuesserProps = Omit<
  ListDatagridProps & Omit<BaseIntrospecterProps, 'resource'>,
  'component'
>;

type ShowFormProps = Omit<
  ShowProps & SimpleFormProps & TabbedFormProps,
  'children'
> &
  Partial<PickRename<ShowProps, 'component', 'viewComponent'>> & {
    children?: ReactNode;
  };

export type IntrospectedShowGuesserProps = ShowFormProps &
  IntrospectedGuesserProps;

export type ShowGuesserProps = Omit<
  ShowFormProps & Omit<BaseIntrospecterProps, 'resource'>,
  'component'
>;

type FilterProps = Omit<RaFilterProps, 'children'>;

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
  | (ReferenceArrayFieldProps & Pick<SingleFieldListProps, 'linkType'>)
  | EnumFieldProps
  | Omit<ReferenceFieldProps, 'reference'>;

export type EnumFieldProps = TextFieldProps & {
  transformEnum?: (value: string | number) => string | number;
};

export type IntrospectedFieldGuesserProps = Partial<FieldProps> &
  IntrospectedGuesserProps;

export type FieldGuesserProps = Omit<
  FieldProps & Omit<BaseIntrospecterProps, 'resource'>,
  'component'
>;

type InputProps =
  | TextInputProps
  | DateTimeInputProps
  | DateInputProps
  | BooleanInputProps
  | NumberInputProps
  | ArrayInputProps
  | SelectArrayInputProps
  | SelectInputProps;

export type IntrospectedInputGuesserProps = Partial<InputProps> &
  IntrospectedGuesserProps & {
    transformEnum?: (value: string | number) => string | number;
  } & Pick<
    ReferenceInputProps | ReferenceArrayInputProps,
    'filter' | 'page' | 'perPage' | 'sort' | 'enableGetChoices'
  >;

export type InputGuesserProps = Omit<
  InputProps & Omit<BaseIntrospecterProps, 'resource'>,
  'component'
> & {
  transformEnum?: (value: string | number) => string | number;
  // don't know why this TextInputProps doesn't surface in the final type, re-adding it here
  multiline?: boolean;
} & Pick<
    ReferenceInputProps | ReferenceArrayInputProps,
    'filter' | 'page' | 'perPage' | 'sort' | 'enableGetChoices'
  >;

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

export type UseOnSubmitProps = Pick<
  IntrospectedGuesserProps,
  'schemaAnalyzer' | 'resource' | 'fields'
> &
  Pick<CreateProps, 'mutationOptions' | 'transform'> &
  PickRename<CreateProps, 'redirect', 'redirectTo'>;
