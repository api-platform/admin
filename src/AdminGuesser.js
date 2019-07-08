import React from 'react';
import PropTypes from 'prop-types';
import {Admin, Loading, TranslationProvider, Query} from 'react-admin';
import {createMuiTheme} from '@material-ui/core/styles';
import ResourceGuesser from './ResourceGuesser';
import {notExistsAsChild} from './helpers';

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#38a9b4',
      contrastText: '#fff',
    },
    secondary: {
      main: '#288690',
    },
  },
});

const notBlackListed = (blacklist, resourceName) => {
  const blacklisted = new Set(blacklist);

  return !blacklisted.has(resourceName);
};

const AdminGuesser = ({children, blacklist, ...props}) => (
  <Query type="INTROSPECT">
    {({data, loading, error}) => {
      if (loading) {
        return (
          <TranslationProvider>
            <Loading />
          </TranslationProvider>
        );
      }
      if (error) {
        console.error(error);
        return <div>Error while reading the API schema</div>;
      }

      return (
        <Admin theme={theme} {...props}>
          {children || <></>}
          {data.resources
            .filter(
              resource =>
                !resource.deprecated &&
                notBlackListed(blacklist, resource.name) &&
                notExistsAsChild(children, 'name', resource.name),
            )
            .map(resource => (
              <ResourceGuesser name={resource.name} key={resource.name} />
            ))}
        </Admin>
      );
    }}
  </Query>
);

AdminGuesser.propTypes = {
  blacklist: PropTypes.array,
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
};

export default AdminGuesser;
