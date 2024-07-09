import React from 'react';
import { AdminContext, Show } from 'react-admin';
import { Resource } from '@api-platform/api-doc-parser';
import { render, screen, waitFor } from '@testing-library/react';

import FieldGuesser from './FieldGuesser.js';
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
        genre: ['MYTH', 'FAIRY_TALE'],
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

describe('<FieldGuesser />', () => {
  test.each([
    // Default enum names.
    {
      transformEnum: undefined,
      expectedValues: [
        'Https://schema.org/ebook',
        'Available',
        'Myth',
        'Fairy tale',
      ],
    },
    // Custom transformation.
    {
      transformEnum: (value: string | number): string =>
        `${value}`
          .split('/')
          .slice(-1)[0]
          ?.replace(/([a-z])([A-Z])/, '$1_$2')
          .toUpperCase() ?? '',
      expectedValues: ['EBOOK', 'AVAILABLE', 'MYTH', 'FAIRY_TALE'],
    },
  ])(
    'renders enum fields with transformation',
    async ({ transformEnum, expectedValues }) => {
      const props = transformEnum ? { transformEnum } : {};
      render(
        <AdminContext dataProvider={dataProvider}>
          <SchemaAnalyzerContext.Provider value={hydraSchemaAnalyzer}>
            <Show resource="users" id="/users/123">
              <FieldGuesser source="title" />
              <FieldGuesser source="formatType" {...props} />
              <FieldGuesser source="status" {...props} />
              <FieldGuesser source="genre" {...props} />
            </Show>
          </SchemaAnalyzerContext.Provider>
        </AdminContext>,
      );
      await waitFor(() => {
        expect(screen.queryAllByText('Title')).toHaveLength(1);
        expectedValues.forEach((value) => {
          expect(screen.queryAllByText(value)).toHaveLength(1);
        });
      });
    },
  );
});
