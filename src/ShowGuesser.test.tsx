import React from 'react';
import { DataProviderContext, TextField } from 'react-admin';
import { renderWithRedux } from 'ra-test';
import { waitFor } from '@testing-library/react';
import { Resource } from '@api-platform/api-doc-parser';

import ShowGuesser from './ShowGuesser';
import SchemaAnalyzerContext from './SchemaAnalyzerContext';
import introspectReducer from './introspectReducer';
import schemaAnalyzer from './hydra/schemaAnalyzer';
import { ApiPlatformAdminDataProvider } from './types';

import { API_FIELDS_DATA } from './__fixtures__/parsedData';

const hydraSchemaAnalyzer = schemaAnalyzer();
const dataProvider = {
  getList: () => Promise.resolve({ data: [], total: 0 }),
  getMany: () => Promise.resolve({ data: [] }),
  getManyReference: () => Promise.resolve({ data: [], total: 0 }),
  update: () => Promise.resolve({ data: {} }),
  updateMany: () => Promise.resolve({ data: [] }),
  create: () => Promise.resolve({ data: null }),
  delete: () => Promise.resolve({ data: { id: 'id' } }),
  deleteMany: () => Promise.resolve({ data: [] }),
  getOne: () =>
    Promise.resolve({
      data: {
        id: '/users/123',
        fieldA: 'fieldA value',
        fieldB: 'fieldB value',
        deprecatedField: 'deprecatedField value',
        title: 'Title',
        body: 'Body',
      },
    }),
  introspect: () =>
    Promise.resolve({
      data: {
        resources: [
          new Resource('user', '/users', {
            fields: API_FIELDS_DATA,
            readableFields: API_FIELDS_DATA,
            writableFields: API_FIELDS_DATA,
            parameters: [],
          }),
        ],
      },
      customRoutes: [],
    }),
  subscribe: () => Promise.resolve({ data: null }),
  unsubscribe: () => Promise.resolve({ data: null }),
} as ApiPlatformAdminDataProvider;

describe('<ShowGuesser />', () => {
  test('renders with no children', async () => {
    const { queryAllByText } = renderWithRedux(
      <DataProviderContext.Provider value={dataProvider}>
        <SchemaAnalyzerContext.Provider value={hydraSchemaAnalyzer as any}>
          <ShowGuesser basePath="/users" resource="user" id="/users/123" />
        </SchemaAnalyzerContext.Provider>
      </DataProviderContext.Provider>,
      {
        admin: {
          resources: {
            user: {
              data: {},
            },
          },
        },
      },
      {},
      { introspect: introspectReducer },
    );

    await waitFor(() => {
      expect(queryAllByText('resources.user.fields.fieldA')).toHaveLength(1);
      expect(queryAllByText('fieldA value')).toHaveLength(1);
      expect(queryAllByText('resources.user.fields.fieldB')).toHaveLength(1);
      expect(queryAllByText('fieldB value')).toHaveLength(1);
      expect(
        queryAllByText('resources.user.fields.deprecatedField'),
      ).toHaveLength(0);
      expect(queryAllByText('deprecatedField value')).toHaveLength(0);
    });
  });

  test('renders with custom fields', async () => {
    const { queryAllByText } = renderWithRedux(
      <DataProviderContext.Provider value={dataProvider}>
        <SchemaAnalyzerContext.Provider value={hydraSchemaAnalyzer as any}>
          <ShowGuesser basePath="/users" resource="user" id="/users/123">
            <TextField source="id" label={'label of id'} />
            <TextField source="title" label={'label of title'} />
            <TextField source="body" label={'label of body'} />
          </ShowGuesser>
        </SchemaAnalyzerContext.Provider>
      </DataProviderContext.Provider>,
      {
        admin: {
          resources: {
            user: {
              data: {},
            },
          },
        },
      },
      {},
      { introspect: introspectReducer },
    );

    await waitFor(() => {
      expect(queryAllByText('label of id')).toHaveLength(1);
      expect(queryAllByText('/users/123')).toHaveLength(1);
      expect(queryAllByText('label of title')).toHaveLength(1);
      expect(queryAllByText('Title')).toHaveLength(1);
      expect(queryAllByText('label of body')).toHaveLength(1);
      expect(queryAllByText('Body')).toHaveLength(1);
    });
  });
});
