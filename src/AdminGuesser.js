import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {AdminUI, Error as ErrorUI, Loading, useDataProvider} from 'react-admin';
import {createMuiTheme} from '@material-ui/core/styles';

import {Layout} from './layout';
import ResourceGuesser from './ResourceGuesser';

const displayOverrideCode = resources => {
  let code =
    'If you want to override at least one resource, paste this content in the <HydraAdmin> component of your app:\n\n';

  resources.forEach(r => {
    code += `<ResourceGuesser name={"${r.name}"} />\n`;
  });
  console.info(code);
};

export const AdminGuesserComponent = ({
  children,
  includeDeprecated,

  resources,
  fetching,
  error,

  ...rest
}) => {
  if (fetching) {
    return <Loading />;
  }

  if (error) {
    if ('production' === process.env.NODE_ENV) {
      console.error(error);
    }

    return (
      <ErrorUI
        error={new Error('API schema is not readable')}
        errorInfo={{componentStack: null}}
      />
    );
  }

  if (!children && resources) {
    const guessResources = includeDeprecated
      ? resources
      : resources.filter(r => !r.deprecated);
    children = guessResources.map(r => (
      <ResourceGuesser name={r.name} key={r.name} />
    ));
    displayOverrideCode(guessResources);
  }

  return <AdminUI {...rest}>{children}</AdminUI>;
};

/**
 * AdminGuesser automatically renders an `<AdminUI>` component for resources exposed by a web API documented with Hydra, OpenAPI or any other format supported by `@api-platform/api-doc-parser`.
 * If child components are passed (usually `<ResourceGuesser>` or `<Resource>` components, but it can be any other React component), they are rendered in the given order.
 * If no children are passed, a `<ResourceGuesser>` component is created for each resource type exposed by the API, in the order they are specified in the API documentation.
 */
const AdminGuesser = ({
  children,
  includeDeprecated,

  appLayout,
  layout,
  loginPage,
  locale,

  ...rest
}) => {
  const dataProvider = useDataProvider();
  const [resources, setResources] = useState();
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState();

  if (appLayout) {
    console.warn(
      'You are using deprecated prop "appLayout", it was replaced by "layout", see https://github.com/marmelab/react-admin/issues/2918',
    );
  }
  if (loginPage === true && process.env.NODE_ENV !== 'production') {
    console.warn(
      'You passed true to the loginPage prop. You must either pass false to disable it or a component class to customize it',
    );
  }
  if (locale) {
    console.warn(
      'You are using deprecated prop "locale". You must now pass the initial locale to your i18nProvider',
    );
  }

  useEffect(() => {
    dataProvider('INTROSPECT')
      .then(({data}) => {
        setResources(data.resources);
        setFetching(false);
      })
      .catch(error => {
        setError(error);
        setFetching(false);
      });
  }, []);

  return (
    <AdminGuesserComponent
      includeDeprecated={includeDeprecated}
      resources={resources}
      fetching={fetching}
      error={error}
      layout={appLayout || layout}
      loginPage={loginPage}
      {...rest}>
      {children}
    </AdminGuesserComponent>
  );
};

AdminGuesser.defaultProps = {
  includeDeprecated: false,
  theme: createMuiTheme({
    palette: {
      primary: {
        contrastText: '#ffffff',
        main: '#38a9b4',
      },
      secondary: {
        main: '#288690',
      },
    },
  }),
  layout: Layout,
};

AdminGuesser.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  theme: PropTypes.object,
  includeDeprecated: PropTypes.bool,
};

export default AdminGuesser;
