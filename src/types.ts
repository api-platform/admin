import { DataProvider, CustomRoutes } from 'react-admin';

export interface ApiPlatformAdminDataProvider extends DataProvider {
  introspect: (
    resource?: any,
    options?: any,
    reducer?: {
      action: 'INTROSPECT';
    },
  ) => Promise<{
    customRoutes: CustomRoutes;
    data: { resources: unknown };
  }>;
  subscribe: (...args: any) => void;
}
