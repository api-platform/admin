import React from 'react';
import {
  AdminContext,
  Edit,
  ResourceContextProvider,
  SimpleForm,
} from 'react-admin';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Resource } from '@api-platform/api-doc-parser';

import InputGuesser from './InputGuesser';
import SchemaAnalyzerContext from './SchemaAnalyzerContext';
import schemaAnalyzer from './hydra/schemaAnalyzer';
import type {
  ApiPlatformAdminDataProvider,
  ApiPlatformAdminRecord,
} from './types';

import { API_FIELDS_DATA } from './__fixtures__/parsedData';

const hydraSchemaAnalyzer = schemaAnalyzer();
const dataProvider: ApiPlatformAdminDataProvider = {
  getList: () => Promise.resolve({ data: [], total: 0 }),
  getMany: () => Promise.resolve({ data: [] }),
  getManyReference: () => Promise.resolve({ data: [], total: 0 }),
  update: <RecordType extends ApiPlatformAdminRecord>() =>
    Promise.resolve({ data: { id: '/users/123' } } as { data: RecordType }),
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
        description: 'Lorem ipsum dolor sit amet',
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

describe('<InputGuesser />', () => {
  test('renders a parsed integer identifier input', async () => {
    const user = userEvent.setup();
    let updatedData = {};

    render(
      <AdminContext dataProvider={dataProvider}>
        <SchemaAnalyzerContext.Provider value={hydraSchemaAnalyzer}>
          <ResourceContextProvider value="users">
            <Edit id="/users/123" mutationMode="pessimistic">
              <SimpleForm
                onSubmit={(data: { id?: number }) => {
                  updatedData = data;
                }}>
                <InputGuesser source="id" />
              </SimpleForm>
            </Edit>
          </ResourceContextProvider>
        </SchemaAnalyzerContext.Provider>
      </AdminContext>,
    );

    expect(
      await screen.findAllByText('resources.users.fields.id'),
    ).toHaveLength(1);
    const idField = screen.getByLabelText('resources.users.fields.id');
    expect(idField).toHaveValue(123);

    await user.type(idField, '4');
    await user.tab();
    expect(idField).toHaveValue(1234);

    const saveButton = screen.getByRole('button', { name: 'ra.action.save' });
    fireEvent.click(saveButton);
    await waitFor(() => {
      expect(updatedData).toMatchObject({ id: 1234 });
    });
  });

  test('renders a sanitized text input', async () => {
    const user = userEvent.setup();
    let updatedData = {};

    render(
      <AdminContext dataProvider={dataProvider}>
        <SchemaAnalyzerContext.Provider value={hydraSchemaAnalyzer}>
          <ResourceContextProvider value="users">
            <Edit id="/users/123" mutationMode="pessimistic">
              <SimpleForm
                onSubmit={(data: {
                  title?: string | null;
                  description?: string | null;
                }) => {
                  updatedData = data;
                }}>
                <InputGuesser source="title" />
                <InputGuesser source="description" sanitizeEmptyValue={false} />
              </SimpleForm>
            </Edit>
          </ResourceContextProvider>
        </SchemaAnalyzerContext.Provider>
      </AdminContext>,
    );

    expect(
      await screen.findAllByText('resources.users.fields.title'),
    ).toHaveLength(1);
    const titleField = screen.getByLabelText('resources.users.fields.title');
    expect(titleField).toHaveValue('Title');
    expect(
      await screen.findAllByText('resources.users.fields.description'),
    ).toHaveLength(1);
    const descriptionField = screen.getByLabelText(
      'resources.users.fields.description',
    );
    expect(descriptionField).toHaveValue('Lorem ipsum dolor sit amet');

    await user.clear(titleField);
    expect(titleField).toHaveValue('');
    await user.clear(descriptionField);
    expect(descriptionField).toHaveValue('');

    const saveButton = screen.getByRole('button', { name: 'ra.action.save' });
    fireEvent.click(saveButton);
    await waitFor(() => {
      expect(updatedData).toMatchObject({ title: null, description: '' });
    });
  });
});
