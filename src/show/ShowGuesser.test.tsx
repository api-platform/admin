import React from 'react';
import {
  AdminContext,
  ResourceContextProvider,
  Tab,
  TextField,
} from 'react-admin';
import { Resource } from '@api-platform/api-doc-parser';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ShowGuesser from './ShowGuesser.js';
import SchemaAnalyzerContext from '../introspection/SchemaAnalyzerContext.js';
import schemaAnalyzer from '../hydra/schemaAnalyzer.js';
import type {
  ApiPlatformAdminDataProvider,
  ApiPlatformAdminRecord,
} from '../types.js';

import { API_FIELDS_DATA } from '../__fixtures__/parsedData.js';

const hydraSchemaAnalyzer = schemaAnalyzer();
const dataProvider: ApiPlatformAdminDataProvider = {
  getList: () => Promise.resolve({ data: [], total: 0 }),
  getMany: () => Promise.resolve({ data: [] }),
  getManyReference: () => Promise.resolve({ data: [], total: 0 }),
  update: <RecordType extends ApiPlatformAdminRecord>() =>
    Promise.resolve({ data: { id: 'id' } } as { data: RecordType }),
  updateMany: () => Promise.resolve({ data: [] }),
  create: <RecordType extends ApiPlatformAdminRecord>() =>
    Promise.resolve({ data: { id: 'id' } } as { data: RecordType }),
  delete: <RecordType extends ApiPlatformAdminRecord>() =>
    Promise.resolve({ data: { id: 'id' } } as { data: RecordType }),
  deleteMany: () => Promise.resolve({ data: [] }),
  getOne: () =>
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
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
        entrypoint: 'entrypoint',
        resources: [
          new Resource('users', '/users', {
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

describe('<ShowGuesser />', () => {
  test('renders with no children', async () => {
    render(
      <AdminContext dataProvider={dataProvider}>
        <SchemaAnalyzerContext.Provider value={hydraSchemaAnalyzer}>
          <ResourceContextProvider value="users">
            <ShowGuesser id="/users/123" />
          </ResourceContextProvider>
        </SchemaAnalyzerContext.Provider>
      </AdminContext>,
    );

    await waitFor(() => {
      expect(
        screen.queryAllByText('resources.users.fields.fieldA'),
      ).toHaveLength(1);
      expect(screen.queryAllByText('fieldA value')).toHaveLength(1);
      expect(
        screen.queryAllByText('resources.users.fields.fieldB'),
      ).toHaveLength(1);
      expect(screen.queryAllByText('fieldB value')).toHaveLength(1);
      expect(
        screen.queryAllByText('resources.users.fields.deprecatedField'),
      ).toHaveLength(0);
      expect(screen.queryAllByText('deprecatedField value')).toHaveLength(0);
    });
  });

  test('renders with custom fields', async () => {
    render(
      <AdminContext dataProvider={dataProvider}>
        <SchemaAnalyzerContext.Provider value={hydraSchemaAnalyzer}>
          <ShowGuesser resource="users" id="/users/123">
            <TextField source="id" label="label of id" />
            <TextField source="title" label="label of title" />
            <TextField source="body" label="label of body" />
          </ShowGuesser>
        </SchemaAnalyzerContext.Provider>
      </AdminContext>,
    );

    await waitFor(() => {
      expect(screen.queryAllByText('label of id')).toHaveLength(1);
      expect(screen.queryAllByText('/users/123')).toHaveLength(1);
      expect(screen.queryAllByText('label of title')).toHaveLength(1);
      expect(screen.queryAllByText('Title')).toHaveLength(1);
      expect(screen.queryAllByText('label of body')).toHaveLength(1);
      expect(screen.queryAllByText('Body')).toHaveLength(1);
    });
  });

  test.each([0, 1])('renders with tabs', async (tabId) => {
    const user = userEvent.setup();

    render(
      <AdminContext dataProvider={dataProvider}>
        <SchemaAnalyzerContext.Provider value={hydraSchemaAnalyzer}>
          <ShowGuesser resource="users" id="/users/123">
            <Tab label="Tab 1">
              <TextField source="id" label="label of id" />
              <TextField source="title" label="label of title" />
            </Tab>
            <Tab label="Tab 2">
              <TextField source="body" label="label of body" />
            </Tab>
          </ShowGuesser>
        </SchemaAnalyzerContext.Provider>
      </AdminContext>,
    );

    await waitFor(async () => {
      expect(screen.queryAllByRole('tab')).toHaveLength(2);
      const tab = screen.getAllByRole('tab')[tabId];
      if (tab) {
        await user.click(tab);
      }

      // First tab, available for tabId == 0.
      expect(screen.queryAllByText('label of id')).toHaveLength(tabId ? 0 : 1);
      expect(screen.queryAllByText('/users/123')).toHaveLength(tabId ? 0 : 1);
      expect(screen.queryAllByText('label of title')).toHaveLength(
        tabId ? 0 : 1,
      );
      expect(screen.queryAllByText('Title')).toHaveLength(tabId ? 0 : 1);
      // Second tab, available for tabId == 1.
      expect(screen.queryAllByText('label of body')).toHaveLength(
        tabId ? 1 : 0,
      );
      expect(screen.queryAllByText('Body')).toHaveLength(tabId ? 1 : 0);
    });
  });
});
