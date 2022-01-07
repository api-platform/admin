import React from 'react';
import ShallowRenderer from 'react-test-renderer/shallow';
import { AdminResourcesGuesser } from './AdminGuesser';
import ResourceGuesser from './ResourceGuesser';
import { DataProvider } from 'react-admin';
import resources from './__fixtures__/resources';

const dataProvider = {
  getList: () => Promise.resolve({ data: [], total: 0 }),
  getOne: () => Promise.resolve({ data: { id: 'id' } }),
  getMany: () => Promise.resolve({ data: [] }),
  getManyReference: () => Promise.resolve({ data: [], total: 0 }),
  update: () => Promise.resolve({ data: {} }),
  updateMany: () => Promise.resolve({ data: [] }),
  create: () => Promise.resolve({ data: null }),
  delete: () => Promise.resolve({ data: { id: 'id' } }),
  deleteMany: () => Promise.resolve({ data: [] }),
} as DataProvider;

describe('<AdminGuesser />', () => {
  const renderer = new ShallowRenderer();

  test('renders loading', () => {
    const tree = renderer.render(
      <AdminResourcesGuesser
        resources={[]}
        loading={true}
        includeDeprecated={false}
        dataProvider={dataProvider}
      />,
    );

    expect(tree).toMatchSnapshot();
  });

  test('renders without custom resources', () => {
    const tree = renderer.render(
      <AdminResourcesGuesser
        resources={resources}
        loading={false}
        includeDeprecated={false}
        dataProvider={dataProvider}
      />,
    );

    expect(tree).toMatchSnapshot();
  });

  test('renders with custom resources', () => {
    const tree = renderer.render(
      <AdminResourcesGuesser
        resources={resources}
        loading={false}
        includeDeprecated={false}
        dataProvider={dataProvider}>
        <ResourceGuesser name="custom" />
      </AdminResourcesGuesser>,
    );

    expect(tree).toMatchSnapshot();
  });

  test('renders without data', () => {
    const tree = renderer.render(
      <AdminResourcesGuesser
        resources={[]}
        loading={false}
        includeDeprecated={false}
        dataProvider={dataProvider}
      />,
    );

    expect(tree).toMatchSnapshot();
  });
});
