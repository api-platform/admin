import React from 'react';
import { DataProviderContext, Edit, SimpleForm } from 'react-admin';
import { renderWithRedux } from 'ra-test';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Resource } from '@api-platform/api-doc-parser';
import { ThemeProvider } from '@material-ui/core';
import { createTheme } from '@material-ui/core/styles';

import InputGuesser from './InputGuesser';
import SchemaAnalyzerContext from './SchemaAnalyzerContext';
import introspectReducer from './introspectReducer';
import schemaAnalyzer from './hydra/schemaAnalyzer';
import type {
  ApiPlatformAdminDataProvider,
  ApiPlatformAdminRecord,
} from './types';

import { API_FIELDS_DATA } from './__fixtures__/parsedData';

const theme = createTheme();

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
      customRoutes: [],
    }),
  subscribe: () => Promise.resolve({ data: null }),
  unsubscribe: () => Promise.resolve({ data: null }),
};

describe('<InputGuesser />', () => {
  test('renders a parsed integer identifier input', async () => {
    let updatedData = {};

    renderWithRedux(
      <DataProviderContext.Provider value={dataProvider}>
        <SchemaAnalyzerContext.Provider value={hydraSchemaAnalyzer}>
          <ThemeProvider theme={theme}>
            <Edit
              basePath="/users"
              resource="users"
              id="/users/123"
              undoable={false}>
              <SimpleForm
                save={(data: { id: number }) => {
                  updatedData = data;
                }}>
                <InputGuesser source="id" />
              </SimpleForm>
            </Edit>
          </ThemeProvider>
        </SchemaAnalyzerContext.Provider>
      </DataProviderContext.Provider>,
      {
        admin: {
          resources: {
            users: {
              data: {},
            },
          },
        },
      },
      {},
      { introspect: introspectReducer },
    );

    expect(
      await screen.findAllByText('resources.users.fields.id'),
    ).toHaveLength(1);
    const idField = screen.getByLabelText('resources.users.fields.id');
    expect(idField).toHaveValue(123);

    userEvent.type(idField, '4');
    expect(idField).toHaveValue(1234);

    const saveButton = screen.getByRole('button', { name: 'ra.action.save' });
    userEvent.click(saveButton);
    expect(updatedData).toMatchObject({ id: 1234 });
  });
});
