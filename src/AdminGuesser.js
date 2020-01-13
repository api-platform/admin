import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { AdminContext, AdminUI, Error as ErrorUI, Loading } from 'react-admin';
import { createHashHistory } from 'history';
import { createMuiTheme } from '@material-ui/core';

import ResourceGuesser from './ResourceGuesser';
import SchemaAnalyzerContext from './SchemaAnalyzerContext';
import { Layout } from './layout';
import introspectReducer from './introspectReducer';

const displayOverrideCode = resources => {
  if (process.env.NODE_ENV === 'production') return;

  let code =
    'If you want to override at least one resource, paste this content in the <AdminGuesser> component of your app:\n\n';

  resources.forEach(r => {
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
  children,
  includeDeprecated,
  resources,
  loading,
  error,
  ...rest
}) => {
  if (loading) {
    return <Loading />;
  }

  if (error) {
    const errorMessage = `API schema is not readable: ${error.message}`;

    if ('production' === process.env.NODE_ENV) {
      console.error(errorMessage);
    }

    return (
      <ErrorUI
        error={new Error(errorMessage)}
        errorInfo={{ componentStack: null }}
      />
    );
  }

  let resourceChildren = children;
  if (!resourceChildren && resources) {
    const guessResources = includeDeprecated
      ? resources
      : resources.filter(r => !r.deprecated);
    resourceChildren = guessResources.map(r => (
      <ResourceGuesser name={r.name} key={r.name} />
    ));
    displayOverrideCode(guessResources);
  }

  return <AdminUI {...rest}>{resourceChildren}</AdminUI>;
};

const defaultHistory = createHashHistory();
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
  // Props for AdminContext
  dataProvider,
  authProvider,
  i18nProvider,
  history = defaultHistory,
  customReducers = {},
  customSagas,
  initialState,
  // Props for AdminResourcesGuesser
  includeDeprecated = false,
  // Props for AdminUI
  appLayout,
  layout = Layout,
  loginPage,
  locale,
  theme = defaultTheme,
  // Other props
  children,
  ...rest
}) => {
  const [resources, setResources] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();

  if (appLayout && process.env.NODE_ENV !== 'production') {
    console.warn(
      'You are using deprecated prop "appLayout", it was replaced by "layout", see https://github.com/marmelab/react-admin/issues/2918',
    );
  }
  if (loginPage === true && process.env.NODE_ENV !== 'production') {
    console.warn(
      'You passed true to the loginPage prop. You must either pass false to disable it or a component class to customize it',
    );
  }
  if (locale && process.env.NODE_ENV !== 'production') {
    console.warn(
      'You are using deprecated prop "locale". You must now pass the initial locale to your i18nProvider',
    );
  }

  useEffect(() => {
    if (typeof dataProvider.introspect !== 'function') {
      setError(
        new Error(
          'The given dataProvider needs to expose an "introspect" function returning a parsed API documentation from api-doc-parser',
        ),
      );
      setLoading(false);

      return;
    }

    dataProvider
      .introspect()
      .then(({ data }) => {
        setResources(data.resources);
        setLoading(false);
      })
      .catch(error => {
        setError(error);
        setLoading(false);
      });
  }, []);

  return (
    <SchemaAnalyzerContext.Provider value={schemaAnalyzer}>
      <AdminContext
        authProvider={authProvider}
        dataProvider={dataProvider}
        i18nProvider={i18nProvider}
        history={history}
        customReducers={{ introspect: introspectReducer, ...customReducers }}
        customSagas={customSagas}
        initialState={initialState}>
        <AdminResourcesGuesser
          includeDeprecated={includeDeprecated}
          resources={resources}
          loading={loading}
          error={error}
          layout={appLayout || layout}
          loginPage={loginPage}
          theme={theme}
          {...rest}>
          {children}
        </AdminResourcesGuesser>
      </AdminContext>
    </SchemaAnalyzerContext.Provider>
  );
};

AdminGuesser.propTypes = {
  dataProvider: PropTypes.oneOfType([PropTypes.object, PropTypes.func])
    .isRequired,
  schemaAnalyzer: PropTypes.object.isRequired,
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  theme: PropTypes.object,
  includeDeprecated: PropTypes.bool,
};

export default AdminGuesser;
