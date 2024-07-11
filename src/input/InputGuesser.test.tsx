import React from 'react';
import type { SortPayload } from 'react-admin';
import {
  AdminContext,
  Edit,
  ResourceContextProvider,
  SimpleForm,
} from 'react-admin';
import { Resource } from '@api-platform/api-doc-parser';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import InputGuesser from './InputGuesser.js';
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
        nullText: null,
        embedded: {
          address: '91 rue du Temple',
        },
        embeddeds: [
          {
            address: '16 avenue de Rivoli',
          },
        ],
        formatType: 'https://schema.org/EBook',
        status: 'AVAILABLE',
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

  test('renders text inputs', async () => {
    const user = userEvent.setup();
    let updatedData = {};

    render(
      <AdminContext dataProvider={dataProvider}>
        <SchemaAnalyzerContext.Provider value={hydraSchemaAnalyzer}>
          <ResourceContextProvider value="users">
            <Edit id="/users/123" mutationMode="pessimistic">
              <SimpleForm
                onSubmit={(data: {
                  title?: string;
                  description?: string;
                  nullText?: string;
                }) => {
                  updatedData = data;
                }}>
                <InputGuesser source="title" />
                <InputGuesser source="description" />
                <InputGuesser source="nullText" />
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
    expect(
      await screen.findAllByText('resources.users.fields.nullText'),
    ).toHaveLength(1);
    const nullTextField = screen.getByLabelText(
      'resources.users.fields.nullText',
    );
    expect(nullTextField).toHaveValue('');

    await user.type(titleField, ' Foo');
    expect(titleField).toHaveValue('Title Foo');
    await user.clear(descriptionField);
    expect(descriptionField).toHaveValue('');

    const saveButton = screen.getByRole('button', { name: 'ra.action.save' });
    fireEvent.click(saveButton);
    await waitFor(() => {
      expect(updatedData).toMatchObject({
        title: 'Title Foo',
        description: null,
        nullText: null,
      });
    });
  });

  test('renders embedded inputs', async () => {
    const user = userEvent.setup();
    let updatedData = {};

    render(
      <AdminContext dataProvider={dataProvider}>
        <SchemaAnalyzerContext.Provider value={hydraSchemaAnalyzer}>
          <ResourceContextProvider value="users">
            <Edit id="/users/123" mutationMode="pessimistic">
              <SimpleForm
                onSubmit={(data: {
                  embedded?: object;
                  embeddeds?: object[];
                }) => {
                  updatedData = data;
                }}>
                <InputGuesser source="embedded" />
                <InputGuesser source="embeddeds" />
              </SimpleForm>
            </Edit>
          </ResourceContextProvider>
        </SchemaAnalyzerContext.Provider>
      </AdminContext>,
    );

    expect(
      await screen.findAllByText('resources.users.fields.embedded'),
    ).toHaveLength(1);
    const embeddedField = screen.getByLabelText(
      'resources.users.fields.embedded',
    );
    expect(embeddedField).toHaveValue('{"address":"91 rue du Temple"}');
    const embeddedsField = await screen.findByLabelText(
      'resources.users.fields.embeddeds',
    );
    expect(embeddedsField).toHaveValue('{"address":"16 avenue de Rivoli"}');

    await user.type(embeddedField, '{ArrowLeft}, "city": "Paris"');
    expect(embeddedField).toHaveValue(
      '{"address":"91 rue du Temple","city":"Paris"}',
    );
    await user.type(embeddedsField, '{ArrowLeft}, "city": "Paris"');
    expect(embeddedsField).toHaveValue(
      '{"address":"16 avenue de Rivoli","city":"Paris"}',
    );

    const saveButton = screen.getByRole('button', { name: 'ra.action.save' });
    fireEvent.click(saveButton);
    await waitFor(() => {
      expect(updatedData).toMatchObject({
        embedded: {
          address: '91 rue du Temple',
          city: 'Paris',
        },
        embeddeds: [
          {
            address: '16 avenue de Rivoli',
            city: 'Paris',
          },
        ],
      });
    });
  });

  test('renders reference input', async () => {
    render(
      <AdminContext dataProvider={dataProvider}>
        <SchemaAnalyzerContext.Provider value={hydraSchemaAnalyzer}>
          <ResourceContextProvider value="users">
            <Edit id="/users/123" mutationMode="pessimistic">
              <SimpleForm>
                <InputGuesser
                  source="owner"
                  sort={{ field: 'id', order: 'DESC' } as SortPayload}
                />
              </SimpleForm>
            </Edit>
          </ResourceContextProvider>
        </SchemaAnalyzerContext.Provider>
      </AdminContext>,
    );

    expect(
      await screen.findAllByText('resources.users.fields.owner'),
    ).toHaveLength(1);
  });

  test.each([
    // Default enum names.
    {
      transformEnum: undefined,
      enums: {
        formatType: [
          'Https://schema.org/ebook',
          'Https://schema.org/audiobookformat',
          'Https://schema.org/hardcover',
        ],
        status: ['Available', 'Sold out'],
      },
    },
    // Custom transformation.
    {
      transformEnum: (value: string | number): string =>
        `${value}`
          .split('/')
          .slice(-1)[0]
          ?.replace(/([a-z])([A-Z])/, '$1_$2')
          .toUpperCase() ?? '',
      enums: {
        formatType: ['EBOOK', 'AUDIOBOOK_FORMAT', 'HARDCOVER'],
        status: ['AVAILABLE', 'SOLD_OUT'],
      },
    },
  ])(
    'renders enum input with transformation',
    async ({ transformEnum, enums }) => {
      let updatedData = {};

      render(
        <AdminContext dataProvider={dataProvider}>
          <SchemaAnalyzerContext.Provider value={hydraSchemaAnalyzer}>
            <ResourceContextProvider value="users">
              <Edit id="/users/123" mutationMode="pessimistic">
                <SimpleForm
                  onSubmit={(data: {
                    formatType?: string | null;
                    status?: string | null;
                  }) => {
                    updatedData = data;
                  }}>
                  <InputGuesser
                    transformEnum={transformEnum}
                    source="formatType"
                  />
                  <InputGuesser transformEnum={transformEnum} source="status" />
                </SimpleForm>
              </Edit>
            </ResourceContextProvider>
          </SchemaAnalyzerContext.Provider>
        </AdminContext>,
      );

      // eslint-disable-next-line no-restricted-syntax
      for (const [fieldId, options] of Object.entries(enums)) {
        // eslint-disable-next-line no-await-in-loop
        const field = await screen.findByLabelText(
          `resources.users.fields.${fieldId}`,
        );
        expect(field).toBeVisible();
        if (field) {
          fireEvent.mouseDown(field);
        }
        // First option is selected.
        expect(
          screen.queryAllByRole('option', { name: options[0], selected: true })
            .length,
        ).toEqual(1);
        expect(
          screen.queryAllByRole('option', { selected: false }).length,
        ).toEqual(options.length);

        // eslint-disable-next-line @typescript-eslint/no-loop-func
        options.forEach((option) => {
          expect(
            screen.queryAllByRole('option', { name: option }).length,
          ).toEqual(1);
        });
        // Select last option.
        const lastOption = screen.getByText(options.slice(-1)[0] ?? '');
        fireEvent.click(lastOption);
      }

      const saveButton = screen.getByRole('button', { name: 'ra.action.save' });
      fireEvent.click(saveButton);
      await waitFor(() => {
        expect(updatedData).toMatchObject({
          formatType: 'https://schema.org/Hardcover',
          status: 'SOLD_OUT',
        });
      });
    },
  );
});
