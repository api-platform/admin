import { DataProvider, CustomRoutes } from 'react-admin';

export interface CustomDataProvider extends DataProvider {
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
