import React from 'react';
import { AdminUI, AuthContext } from 'react-admin';
import type { AdminProps, AuthProvider } from 'react-admin';
import ReactTestRenderer from 'react-test-renderer/shallow';
import AdminGuesser from './AdminGuesser.js';
import { AdminResourcesGuesser } from './AdminResourcesGuesser.js';
import ResourceGuesser from './ResourceGuesser.js';
import schemaAnalyzer from '../hydra/schemaAnalyzer.js';
import resources from '../__fixtures__/resources.js';
import { API_DATA } from '../__fixtures__/parsedData.js';
import type {
  ApiPlatformAdminDataProvider,
  ApiPlatformAdminRecord,
} from '../types.js';

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

  test('renders with admin element', () => {
    const authProvider: AuthProvider = {
      getPermissions: () => Promise.resolve(['user']),
      getIdentity: () =>
        Promise.resolve({
          id: '/users/2',
          fullName: 'Test User',
          avatar: undefined,
        }),
      login: () => Promise.resolve(),
      logout: () => Promise.resolve(),
      checkAuth: () => Promise.resolve(),
      checkError: () => Promise.resolve(),
    };

    const AdminEl = (props: AdminProps) => (
      <AuthContext.Provider value={authProvider}>
        <AdminUI {...props} />
      </AuthContext.Provider>
    );

    renderer.render(
      <AdminGuesser
        admin={AdminEl}
        dataProvider={dataProvider}
        schemaAnalyzer={schemaAnalyzer()}
      />,
    );

    expect(renderer.getRenderOutput()).not.toBeNull();
  });
});
