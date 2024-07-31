import React, { useEffect, useMemo, useState } from 'react';
import {
  AdminContext,
  defaultI18nProvider,
  /* tree-shaking no-side-effects-when-called */ localStorageStore,
} from 'react-admin';

import type { ComponentType } from 'react';
import type { AdminProps } from 'react-admin';
import type { Resource } from '@api-platform/api-doc-parser';

import { AdminResourcesGuesser } from './AdminResourcesGuesser.js';
import IntrospectionContext from '../introspection/IntrospectionContext.js';
import SchemaAnalyzerContext from '../introspection/SchemaAnalyzerContext.js';
import {
  Error as DefaultError,
  Layout,
  LoginPage,
  darkTheme as defaultDarkTheme,
  lightTheme as defaultLightTheme,
} from '../layout/index.js';
import type { ApiPlatformAdminDataProvider, SchemaAnalyzer } from '../types.js';

export interface AdminGuesserProps extends AdminProps {
  admin?: ComponentType<AdminProps>;
  dataProvider: ApiPlatformAdminDataProvider;
  schemaAnalyzer: SchemaAnalyzer;
  includeDeprecated?: boolean;
}

const defaultStore = localStorageStore();

const AdminGuesser = ({
  // Props for SchemaAnalyzerContext
  schemaAnalyzer,
  // Props for AdminResourcesGuesser
  includeDeprecated = false,
  // Admin props
  basename,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error = DefaultError as any,
  store = defaultStore,
  dataProvider,
  i18nProvider = defaultI18nProvider,
  authProvider,
  queryClient,
  defaultTheme,
  layout = Layout,
  loginPage = LoginPage,
  loading: loadingPage,
  theme = defaultLightTheme,
  darkTheme = defaultDarkTheme,
  // Other props
  children,
  ...rest
}: AdminGuesserProps) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState();
  const [introspect, setIntrospect] = useState(true);

  useEffect(() => {
    if (typeof dataProvider.introspect !== 'function') {
      throw new Error(
        'The given dataProvider needs to expose an "introspect" function returning a parsed API documentation from api-doc-parser',
      );
    }

    if (!introspect) {
      return;
    }

    dataProvider
      .introspect()
      .then(({ data }) => {
        setResources(data.resources ?? []);
        setIntrospect(false);
        setLoading(false);
      })
      .catch((err) => {
        // Allow err to be caught by the error boundary
        setError(() => {
          throw err;
        });
      });
  }, [introspect, dataProvider]);

  const introspectionContext = useMemo(
    () => ({
      introspect: () => {
        setLoading(true);
        setIntrospect(true);
      },
    }),
    [setLoading, setIntrospect],
  );

  return (
    <AdminContext
      i18nProvider={i18nProvider}
      dataProvider={dataProvider}
      basename={basename}
      authProvider={authProvider}
      store={store}
      queryClient={queryClient}
      theme={theme}
      darkTheme={darkTheme}
      defaultTheme={defaultTheme}>
      <IntrospectionContext.Provider value={introspectionContext}>
        <SchemaAnalyzerContext.Provider value={schemaAnalyzer}>
          <AdminResourcesGuesser
            includeDeprecated={includeDeprecated}
            resources={resources}
            loading={loading}
            dataProvider={dataProvider}
            layout={layout}
            loginPage={loginPage}
            loadingPage={loadingPage}
            theme={theme}
            error={error}
            {...rest}>
            {children}
          </AdminResourcesGuesser>
        </SchemaAnalyzerContext.Provider>
      </IntrospectionContext.Provider>
    </AdminContext>
  );
};

export default AdminGuesser;
