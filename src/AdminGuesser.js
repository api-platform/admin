import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
import {Admin, Loading, Query, TranslationProvider} from 'react-admin';
import {createMuiTheme} from '@material-ui/core/styles';
import ResourceGuesser from './ResourceGuesser';
import {existsAsChild} from './docsUtils';

export const render = (
  {blacklist = [], children, ...props},
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

  return (
    <Admin {...props}>
      {children || <Fragment />}
      {data.resources
        .filter(
          resource =>
            !resource.deprecated &&
            !blacklist.includes(resource.name) &&
            existsAsChild(children)(resource.name),
        )
        .map(resource => (
          <ResourceGuesser name={resource.name} key={resource.name} />
        ))}
    </Admin>
  );
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
  blacklist: PropTypes.array,
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  theme: PropTypes.object,
};

export default AdminGuesser;
