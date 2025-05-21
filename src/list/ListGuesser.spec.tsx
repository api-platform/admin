import * as React from 'react';
import { Resource } from '@api-platform/api-doc-parser';
import { render } from '@testing-library/react';
import { AdminContext } from 'react-admin';
import type { GetListResult, GetManyResult } from 'react-admin';
import ListGuesser from './ListGuesser';
import SchemaAnalyzerContext from '../introspection/SchemaAnalyzerContext.js';
import schemaAnalyzer from '../hydra/schemaAnalyzer.js';
import type {
  ApiPlatformAdminDataProvider,
  ApiPlatformAdminRecord,
} from '../types.js';
import { API_FIELDS_DATA } from '../__fixtures__/parsedData.js';

const dataProvider: ApiPlatformAdminDataProvider = {
  getList: <RecordType extends ApiPlatformAdminRecord>() =>
    Promise.resolve({ data: [], total: 0 } as GetListResult<RecordType>),
  getMany: <RecordType extends ApiPlatformAdminRecord>() =>
    Promise.resolve({ data: [] } as GetManyResult<RecordType>),
  getManyReference: <RecordType extends ApiPlatformAdminRecord>() =>
    Promise.resolve({ data: [], total: 0 } as GetManyResult<RecordType>),
  update: <RecordType extends ApiPlatformAdminRecord>() =>
    Promise.resolve({ data: { id: 'id' } } as { data: RecordType }),
  updateMany: () => Promise.resolve({ data: [] }),
  create: <RecordType extends ApiPlatformAdminRecord>() =>
    Promise.resolve({ data: { id: 'id' } } as { data: RecordType }),
  delete: <RecordType extends ApiPlatformAdminRecord>() =>
    Promise.resolve({ data: { id: 'id' } } as { data: RecordType }),
  deleteMany: () => Promise.resolve({ data: [] }),
  getOne: <RecordType extends ApiPlatformAdminRecord>() =>
    Promise.resolve({ data: { id: 'id' } } as { data: RecordType }),
  introspect: () =>
    Promise.resolve({
      data: {
        entrypoint: 'entrypoint',
        resources: [
          new Resource('books', '/books', {
            fields: API_FIELDS_DATA,
            readableFields: API_FIELDS_DATA,
            writableFields: API_FIELDS_DATA,
            parameters: [],
          }),
        ],
      },
    }),
  subscribe: () => Promise.resolve({ data: null }),
  unsubscribe: () => Promise.resolve({ data: null }),
};

// eslint-disable-next-line tree-shaking/no-side-effects-in-initialization
describe('ListGuesser', () => {
  it('passing hasEdit and hasShow props are allowed', async () => {
    render(
      <AdminContext dataProvider={dataProvider}>
        <SchemaAnalyzerContext.Provider value={schemaAnalyzer()}>
          <ListGuesser hasShow={false} hasEdit={false} resource="books" />
        </SchemaAnalyzerContext.Provider>
      </AdminContext>,
    );
  });
});
