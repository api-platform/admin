import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Admin,
  ComponentPropType,
  Error as DefaultError,
  Loading,
  TranslationProvider,
  defaultI18nProvider,
} from 'react-admin';
import { createHashHistory } from 'history';
import { createTheme as createMuiTheme } from '@material-ui/core';

import ErrorBoundary from './ErrorBoundary';
import IntrospectionContext from './IntrospectionContext';
import ResourceGuesser from './ResourceGuesser';
import SchemaAnalyzerContext from './SchemaAnalyzerContext';
import { Layout } from './layout';
import introspectReducer from './introspectReducer';

const displayOverrideCode = (resources) => {
  if (process.env.NODE_ENV === 'production') return;

  let code =
    'If you want to override at least one resource, paste this content in the <AdminGuesser> component of your app:\n\n';

  resources.forEach((r) => {
    code += `<ResourceGuesser name={"${r.name}"} />\n`;
  });
  console.info(code);
};

/**
 * AdminResourcesGuesser automatically renders an `<AdminUI>` component for resources exposed by a web API documented with Hydra, OpenAPI or any other format supported by `@api-platform/api-doc-parser`.
 * If child components are passed (usually `<ResourceGuesser>` or `<Resource>` components, but it can be any other React component), they are rendered in the given order.
 * If no children are passed, a `<ResourceGuesser>` component is created for each resource type exposed by the API, in the order they are specified in the API documentation.
 */
export const AdminResourcesGuesser = ({
  // Admin props
  customReducers = {},
  loadingPage: LoadingPage = Loading,
  admin: AdminEl = Admin,
  // Props
  children,
  includeDeprecated,
  resources,
  loading,
  ...rest
}) => {
  if (loading) {
    return <LoadingPage />;
  }

  let resourceChildren = children;
  if (!resourceChildren && resources) {
    const guessResources = includeDeprecated
      ? resources
      : resources.filter((r) => !r.deprecated);
    resourceChildren = guessResources.map((r) => (
      <ResourceGuesser name={r.name} key={r.name} />
    ));
    displayOverrideCode(guessResources);
  }

  return (
    <AdminEl
      customReducers={{ introspect: introspectReducer, ...customReducers }}
      loading={LoadingPage}
      {...rest}>
      {resourceChildren}
    </AdminEl>
  );
};

const defaultTheme = createMuiTheme({
  palette: {
    primary: {
      contrastText: '#ffffff',
      main: '#38a9b4',
    },
    secondary: {
      main: '#288690',
    },
  },
});

const AdminGuesser = ({
  // Props for SchemaAnalyzerContext
  schemaAnalyzer,
  // Props for AdminResourcesGuesser
  includeDeprecated = false,
  // Admin props
  dataProvider,
  history,
  customRoutes = [],
  layout = Layout,
  loading: loadingPage,
  theme = defaultTheme,
  // Other props
  children,
  ...rest
}) => {
  const [resources, setResources] = useState();
  const [loading, setLoading] = useState(true);
  const [, setError] = useState();
  const [addedCustomRoutes, setAddedCustomRoutes] = useState([]);
  const [introspect, setIntrospect] = useState(true);

  if (!history) {
    history = typeof window === 'undefined' ? {} : createHashHistory();
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
      .then(({ data, customRoutes = [] }) => {
        setResources(data.resources);
        setAddedCustomRoutes(customRoutes);
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

  return (
    <IntrospectionContext.Provider
      value={{
        introspect: () => {
          setLoading(true);
          setIntrospect(true);
        },
      }}>
      <SchemaAnalyzerContext.Provider value={schemaAnalyzer}>
        <AdminResourcesGuesser
          includeDeprecated={includeDeprecated}
          resources={resources}
          loading={loading}
          dataProvider={dataProvider}
          history={history}
          customRoutes={[...addedCustomRoutes, ...customRoutes]}
          layout={layout}
          loadingPage={loadingPage}
          theme={theme}
          {...rest}>
          {children}
        </AdminResourcesGuesser>
      </SchemaAnalyzerContext.Provider>
    </IntrospectionContext.Provider>
  );
};

AdminGuesser.propTypes = {
  dataProvider: PropTypes.oneOfType([PropTypes.object, PropTypes.func])
    .isRequired,
  authProvider: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  i18nProvider: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  history: PropTypes.object,
  customReducers: PropTypes.object,
  customSagas: PropTypes.array,
  initialState: PropTypes.object,
  schemaAnalyzer: PropTypes.object.isRequired,
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  theme: PropTypes.object,
  includeDeprecated: PropTypes.bool,
  customRoutes: PropTypes.array,
};

const AdminGuesserWithError = ({ error, ...props }) => (
  <TranslationProvider i18nProvider={props.i18nProvider}>
    <ErrorBoundary error={error}>
      <AdminGuesser {...props} />
    </ErrorBoundary>
  </TranslationProvider>
);

AdminGuesserWithError.defaultProps = {
  error: DefaultError,
  i18nProvider: defaultI18nProvider,
};

AdminGuesserWithError.propTypes = {
  error: ComponentPropType,
};

export default AdminGuesserWithError;
