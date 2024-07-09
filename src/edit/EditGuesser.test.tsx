import React from 'react';
import { AdminContext, FormTab, TextInput } from 'react-admin';
import { Resource } from '@api-platform/api-doc-parser';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import EditGuesser from './EditGuesser.js';
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

describe('<EditGuesser />', () => {
  test('renders default fields', async () => {
    render(
      <AdminContext dataProvider={dataProvider}>
        <SchemaAnalyzerContext.Provider value={hydraSchemaAnalyzer}>
          <EditGuesser resource="users" id="/users/123" />
        </SchemaAnalyzerContext.Provider>
      </AdminContext>,
    );

    await waitFor(() => {
      expect(screen.queryAllByRole('tab')).toHaveLength(0);
      expect(screen.queryByText('resources.users.fields.id')).toBeVisible();
      expect(screen.queryByLabelText('resources.users.fields.id')).toHaveValue(
        123,
      );
      expect(screen.queryByText('resources.users.fields.fieldA')).toBeVisible();
      expect(
        screen.queryByLabelText('resources.users.fields.fieldA *'),
      ).toHaveValue('fieldA value');
      expect(screen.queryByText('resources.users.fields.fieldB')).toBeVisible();
      expect(
        screen.queryByLabelText('resources.users.fields.fieldB *'),
      ).toHaveValue('fieldB value');
      expect(
        screen.queryByText('resources.users.fields.deprecatedField'),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText('resources.users.fields.body'),
      ).not.toBeInTheDocument();
      expect(screen.queryByText('resources.users.fields.title')).toBeVisible();
      expect(
        screen.queryByLabelText('resources.users.fields.title'),
      ).toHaveValue('Title');
    });
  });

  test('renders with custom fields', async () => {
    render(
      <AdminContext dataProvider={dataProvider}>
        <SchemaAnalyzerContext.Provider value={hydraSchemaAnalyzer}>
          <EditGuesser resource="users" id="/users/123">
            <TextInput source="id" label="label of id" />
            <TextInput source="title" label="label of title" />
            <TextInput source="body" label="label of body" />
          </EditGuesser>
        </SchemaAnalyzerContext.Provider>
      </AdminContext>,
    );

    await waitFor(() => {
      expect(screen.queryAllByRole('tab')).toHaveLength(0);
      expect(screen.queryByText('label of id')).toBeVisible();
      expect(screen.queryByLabelText('label of id')).toHaveValue('/users/123');
      expect(screen.queryByText('label of title')).toBeVisible();
      expect(screen.queryByLabelText('label of title')).toHaveValue('Title');
      expect(screen.queryByText('label of body')).toBeVisible();
      expect(screen.queryByLabelText('label of body')).toHaveValue('Body');
    });
  });

  test.each([0, 1])('renders with tabs', async (tabId) => {
    const user = userEvent.setup();

    render(
      <AdminContext dataProvider={dataProvider}>
        <SchemaAnalyzerContext.Provider value={hydraSchemaAnalyzer}>
          <EditGuesser resource="users" id="/users/123">
            <FormTab label="FormTab 1">
              <TextInput source="id" label="label of id" />
              <TextInput source="title" label="label of title" />
            </FormTab>
            <FormTab label="FormTab 2">
              <TextInput source="body" label="label of body" />
            </FormTab>
          </EditGuesser>
        </SchemaAnalyzerContext.Provider>
      </AdminContext>,
    );

    await waitFor(async () => {
      expect(screen.queryAllByRole('tab')).toHaveLength(2);
      const tab = screen.getAllByRole('tab')[tabId];
      if (tab) {
        await user.click(tab);
      }
      if (tabId === 0) {
        // First tab, available.
        expect(screen.queryByText('label of id')).toBeVisible();
        expect(screen.queryByLabelText('label of id')).toHaveValue(
          '/users/123',
        );
        expect(screen.queryByText('label of title')).toBeVisible();
        expect(screen.queryByLabelText('label of title')).toHaveValue('Title');
        // Second tab, unavailable.
        expect(screen.queryByText('label of body')).not.toBeVisible();
      } else {
        // First tab, unavailable.
        expect(screen.queryByText('label of id')).not.toBeVisible();
        expect(screen.queryByText('label of title')).not.toBeVisible();
        // Second tab, available.
        expect(screen.queryByText('label of body')).toBeVisible();
        expect(screen.queryByLabelText('label of body')).toHaveValue('Body');
      }
    });
  });
});
