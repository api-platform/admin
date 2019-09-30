import React from 'react';
import PropTypes from 'prop-types';
import {Admin, Loading, Query, TranslationProvider} from 'react-admin';
import {createMuiTheme} from '@material-ui/core/styles';
import {Layout} from './layout';
import ResourceGuesser from './ResourceGuesser';

/**
 * AdminGuesserComponent automatically renders an `<Admin>` component for resources exposed by a web API documented with Hydra, OpenAPI or any other format supported by `@api-platform/api-doc-parser`.
 * If child components are passed (usually `<ResourceGuesser>` or `<Resource>` components, but it can be any other React component), they are rendered in the given order.
 * If no children are passed, a `<ResourceGuesser>` component created for each resource type exposed by the API, in the order they are specified in the API documentation.
 */
export const AdminGuesserComponent = (
  {children, includeDeprecated, ...props},
  {data, error, loading},
) => {
  if (loading) {
    return (
      <TranslationProvider>
        <Loading />
      </TranslationProvider>
    );
  }

  if (error) {
    if ('production' === process.env.NODE_ENV) {
      console.error(error);
    }
    return <div>Error while reading the API schema</div>;
  }

  if (!children) {
    const resources = includeDeprecated
      ? data.resources
      : data.resources.filter(r => !r.deprecated);
    children = resources.map(r => (
      <ResourceGuesser name={r.name} key={r.name} />
    ));
  }

  return <Admin {...props}>{children}</Admin>;
};

const AdminGuesser = props => (
  <Query type={'INTROSPECT'}>
    {state => AdminGuesserComponent(props, state)}
  </Query>
);

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
  appLayout: Layout,
};

AdminGuesser.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  theme: PropTypes.object,
  includeDeprecated: PropTypes.bool,
};

export default AdminGuesser;
