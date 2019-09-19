import React from 'react';
import PropTypes from 'prop-types';
import {Admin, Loading, Query, TranslationProvider} from 'react-admin';
import {createMuiTheme} from '@material-ui/core/styles';
import ResourceGuesser from './ResourceGuesser';

export const render = (
  {resources, children, ...props},
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

  // Children are always rendered, first
  // Then resources listed in the "resources" prop are rendered, in that order
  // If and only if both children and the "resources" prop are empty, then all available resources are rendered

  const childrenAsArray = React.Children.toArray(children);
  const useResourcesProp = Array.isArray(resources);
  if (useResourcesProp) {
    resources.forEach(name =>
      childrenAsArray.push(<ResourceGuesser name={name} key={name} />),
    );
  }

  if (!children && !useResourcesProp) {
    data.resources
      .filter(r => !r.deprecated)
      .forEach(r =>
        childrenAsArray.push(<ResourceGuesser name={r.name} key={r.name} />),
      );
  }

  return <Admin {...props}>{childrenAsArray}</Admin>;
};

const AdminGuesser = props => (
  <Query type={'INTROSPECT'}>{state => render(props, state)}</Query>
);

AdminGuesser.defaultProps = {
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
};

AdminGuesser.propTypes = {
  resources: PropTypes.array,
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  theme: PropTypes.object,
};

export default AdminGuesser;
