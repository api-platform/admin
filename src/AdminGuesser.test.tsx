import React from 'react';
import ReactTestRenderer from 'react-test-renderer/shallow';
import { AdminResourcesGuesser } from './AdminGuesser';
import ResourceGuesser from './ResourceGuesser';
import resources from './__fixtures__/resources';
import { API_DATA } from './__fixtures__/parsedData';
import type {
  ApiPlatformAdminDataProvider,
  ApiPlatformAdminRecord,
} from './types';

const dataProvider: ApiPlatformAdminDataProvider = {
  getList: () => Promise.resolve({ data: [], total: 0 }),
  getOne: <RecordType extends ApiPlatformAdminRecord>() =>
    Promise.resolve({ data: { id: 'id' } } as { data: RecordType }),
  getMany: () => Promise.resolve({ data: [] }),
  getManyReference: () => Promise.resolve({ data: [], total: 0 }),
  update: <RecordType extends ApiPlatformAdminRecord>() =>
    Promise.resolve({ data: {} } as { data: RecordType }),
  updateMany: () => Promise.resolve({ data: [] }),
  create: <RecordType extends ApiPlatformAdminRecord>() =>
    Promise.resolve({ data: {} } as { data: RecordType }),
  delete: <RecordType extends ApiPlatformAdminRecord>() =>
    Promise.resolve({ data: { id: 'id' } } as { data: RecordType }),
  deleteMany: () => Promise.resolve({ data: [] }),
  introspect: () => Promise.resolve({ data: API_DATA }),
  subscribe: () => Promise.resolve({ data: null }),
  unsubscribe: () => Promise.resolve({ data: null }),
};

describe('<AdminGuesser />', () => {
  const renderer = ReactTestRenderer.createRenderer();

  test('renders loading', () => {
    renderer.render(
      <AdminResourcesGuesser
        resources={[]}
        loading
        includeDeprecated={false}
        dataProvider={dataProvider}
      />,
    );

    expect(renderer.getRenderOutput()).toMatchSnapshot();
  });

  test('renders without custom resources', () => {
    renderer.render(
      <AdminResourcesGuesser
        resources={resources}
        loading={false}
        includeDeprecated={false}
        dataProvider={dataProvider}
      />,
    );

    expect(renderer.getRenderOutput()).toMatchSnapshot();
  });

  test('renders with custom resources', () => {
    renderer.render(
      <AdminResourcesGuesser
        resources={resources}
        loading={false}
        includeDeprecated={false}
        dataProvider={dataProvider}>
        <ResourceGuesser name="custom" />
      </AdminResourcesGuesser>,
    );

    expect(renderer.getRenderOutput()).toMatchSnapshot();
  });

  test('renders without data', () => {
    renderer.render(
      <AdminResourcesGuesser
        resources={[]}
        loading={false}
        includeDeprecated={false}
        dataProvider={dataProvider}
      />,
    );

    expect(renderer.getRenderOutput()).toMatchSnapshot();
  });
});
