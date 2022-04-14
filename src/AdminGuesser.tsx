import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Admin,
  ComponentPropType,
  I18nContextProvider,
  Loading,
  ThemeProvider,
  defaultI18nProvider,
} from 'react-admin';
import { createHashHistory, createMemoryHistory } from 'history';
import { ErrorBoundary } from 'react-error-boundary';
import type { FallbackProps } from 'react-error-boundary';
import type { ComponentType, ErrorInfo } from 'react';
import type { AdminProps, ErrorProps } from 'react-admin';
import type { Resource } from '@api-platform/api-doc-parser';

import IntrospectionContext from './IntrospectionContext';
import ResourceGuesser from './ResourceGuesser';
import SchemaAnalyzerContext from './SchemaAnalyzerContext';
import { Error as DefaultError, Layout, LoginPage, lightTheme } from './layout';
import type { ApiPlatformAdminDataProvider, SchemaAnalyzer } from './types';
import getRoutesAndResourcesFromNodes, {
  isSingleChildFunction,
} from './getRoutesAndResourcesFromNodes';

export interface AdminGuesserProps extends AdminProps {
  dataProvider: ApiPlatformAdminDataProvider;
  schemaAnalyzer: SchemaAnalyzer;
  includeDeprecated?: boolean;
}

interface AdminGuesserWithErrorProps extends AdminGuesserProps {
  error?: ComponentType<ErrorProps>;
}

interface AdminResourcesGuesserProps extends Omit<AdminProps, 'loading'> {
  admin?: ComponentType<AdminProps>;
  includeDeprecated: boolean;
  loading: boolean;
  loadingPage?: ComponentType;
  resources: Resource[];
}

const displayOverrideCode = (resources: Resource[]) => {
  if (process.env.NODE_ENV === 'production') return;

  let code =
    'If you want to override at least one resource, paste this content in the <AdminGuesser> component of your app:\n\n';

  resources.forEach((r) => {
    code += `<ResourceGuesser name={"${r.name}"} />\n`;
  });
  // eslint-disable-next-line no-console
  console.info(code);
};

/**
 * AdminResourcesGuesser automatically renders an `<AdminUI>` component for resources exposed by a web API documented with Hydra, OpenAPI or any other format supported by `@api-platform/api-doc-parser`.
 * If child components are passed (usually `<ResourceGuesser>` or `<Resource>` components, but it can be any other React component), they are rendered in the given order.
 * If no children are passed, a `<ResourceGuesser>` component is created for each resource type exposed by the API, in the order they are specified in the API documentation.
 */
export const AdminResourcesGuesser = ({
  // Admin props
  loadingPage: LoadingPage = Loading,
  admin: AdminEl = Admin,
  // Props
  children,
  includeDeprecated,
  resources,
  loading,
  ...rest
}: AdminResourcesGuesserProps) => {
  if (loading) {
    return <LoadingPage />;
  }

  let adminChildren = children;
  const { resources: resourceChildren, customRoutes } =
    getRoutesAndResourcesFromNodes(children);
  if (
    !isSingleChildFunction(adminChildren) &&
    resourceChildren.length === 0 &&
    resources
  ) {
    const guessResources = includeDeprecated
      ? resources
      : resources.filter((r) => !r.deprecated);
    adminChildren = [
      ...customRoutes,
      ...guessResources.map((r) => (
        <ResourceGuesser name={r.name} key={r.name} />
      )),
    ];
    displayOverrideCode(guessResources);
  }

  return (
    <AdminEl loading={LoadingPage} {...rest}>
      {adminChildren}
    </AdminEl>
  );
};

const AdminGuesser = ({
  // Props for SchemaAnalyzerContext
  schemaAnalyzer,
  // Props for AdminResourcesGuesser
  includeDeprecated = false,
  // Admin props
  dataProvider,
  history,
  layout = Layout,
  loginPage = LoginPage,
  loading: loadingPage,
  theme = lightTheme,
  // Other props
  children,
  ...rest
}: AdminGuesserProps) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState();
  const [introspect, setIntrospect] = useState(true);
  let adminHistory = history;

  if (!adminHistory) {
    adminHistory =
      typeof window === 'undefined'
        ? createMemoryHistory()
        : createHashHistory();
  }

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
      .catch((error) => {
        // Allow error to be caught by the error boundary
        setError(() => {
          throw error;
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
    <IntrospectionContext.Provider value={introspectionContext}>
      <SchemaAnalyzerContext.Provider value={schemaAnalyzer}>
        <AdminResourcesGuesser
          includeDeprecated={includeDeprecated}
          resources={resources}
          loading={loading}
          dataProvider={dataProvider}
          history={adminHistory}
          layout={layout}
          loginPage={loginPage}
          loadingPage={loadingPage}
          theme={theme}
          {...rest}>
          {children}
        </AdminResourcesGuesser>
      </SchemaAnalyzerContext.Provider>
    </IntrospectionContext.Provider>
  );
};

/* eslint-disable tree-shaking/no-side-effects-in-initialization */
AdminGuesser.propTypes = {
  dataProvider: PropTypes.oneOfType([PropTypes.object, PropTypes.func])
    .isRequired,
  authProvider: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  i18nProvider: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  history: PropTypes.object,
  customSagas: PropTypes.array,
  initialState: PropTypes.object,
  schemaAnalyzer: PropTypes.object.isRequired,
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  theme: PropTypes.object,
  includeDeprecated: PropTypes.bool,
};
/* eslint-enable tree-shaking/no-side-effects-in-initialization */

const AdminGuesserWithError = ({
  error: ErrorComponent = DefaultError,
  i18nProvider = defaultI18nProvider,
  theme = lightTheme,
  ...props
}: AdminGuesserWithErrorProps) => {
  const [errorInfo, setErrorInfo] = useState<ErrorInfo>();

  const handleError = (_error: Error, info: ErrorInfo) => {
    setErrorInfo(info);
  };

  const renderError = useCallback(
    (fallbackRenderProps: FallbackProps) => (
      <ErrorComponent {...fallbackRenderProps} errorInfo={errorInfo} />
    ),
    [ErrorComponent, errorInfo],
  );

  return (
    <I18nContextProvider value={i18nProvider}>
      <ThemeProvider theme={theme}>
        <ErrorBoundary onError={handleError} fallbackRender={renderError}>
          <AdminGuesser {...props} />
        </ErrorBoundary>
      </ThemeProvider>
    </I18nContextProvider>
  );
};

AdminGuesserWithError.propTypes = {
  error: ComponentPropType,
};

export default AdminGuesserWithError;
