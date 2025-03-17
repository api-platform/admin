import React from 'react';
import {
  AdminContext,
  useGetOne,
  useGetRecordRepresentation,
} from 'react-admin';
import ReactTestRenderer from 'react-test-renderer/shallow';
import { Resource } from '@api-platform/api-doc-parser';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResourceGuesser from './ResourceGuesser.js';
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

describe('<ResourceGuesser />', () => {
  const renderer = ReactTestRenderer.createRenderer();

  test('renders with create', () => {
    const CustomCreate = () => null;

    renderer.render(<ResourceGuesser name="dummy" create={CustomCreate} />);

    expect(renderer.getRenderOutput()).toMatchSnapshot();
  });

  test('renders without create', () => {
    renderer.render(<ResourceGuesser name="dummy" />);

    expect(renderer.getRenderOutput()).toMatchSnapshot();
  });

  test('renders with edit', () => {
    const CustomEdit = () => null;

    renderer.render(<ResourceGuesser name="dummy" edit={CustomEdit} />);

    expect(renderer.getRenderOutput()).toMatchSnapshot();
  });

  test('renders without edit', () => {
    renderer.render(<ResourceGuesser name="dummy" />);

    expect(renderer.getRenderOutput()).toMatchSnapshot();
  });

  test('renders with list', () => {
    const CustomList = () => null;

    renderer.render(<ResourceGuesser name="dummy" list={CustomList} />);

    expect(renderer.getRenderOutput()).toMatchSnapshot();
  });

  test('renders without list', () => {
    renderer.render(<ResourceGuesser name="dummy" />);

    expect(renderer.getRenderOutput()).toMatchSnapshot();
  });

  test('renders with show', () => {
    const CustomShow = () => null;

    renderer.render(<ResourceGuesser name="dummy" show={CustomShow} />);

    expect(renderer.getRenderOutput()).toMatchSnapshot();
  });

  test('renders without show', () => {
    renderer.render(<ResourceGuesser name="dummy" />);

    expect(renderer.getRenderOutput()).toMatchSnapshot();
  });

  test('renders without show', () => {
    renderer.render(<ResourceGuesser name="dummy" />);

    expect(renderer.getRenderOutput()).toMatchSnapshot();
  });

  test('supports recordRepresentation', async () => {
    const TestComponent = () => {
      const { data: user } = useGetOne('users', { id: '/users/123' });
      const getRecordRepresentation = useGetRecordRepresentation('users');
      if (!user) {
        return 'loading';
      }
      return getRecordRepresentation(user);
    };
    render(
      <AdminContext dataProvider={dataProvider}>
        <SchemaAnalyzerContext.Provider value={hydraSchemaAnalyzer}>
          <ResourceGuesser
            name="users"
            list={<TestComponent />}
            recordRepresentation="fieldA"
          />
        </SchemaAnalyzerContext.Provider>
      </AdminContext>,
    );

    await screen.findByText('fieldA value');
  });
});
