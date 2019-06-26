import React from 'react';
import PropTypes from 'prop-types';
import {Admin, Loading, TranslationProvider, Query} from 'react-admin';
import {createMuiTheme} from '@material-ui/core/styles';
import ResourceGuesser from './ResourceGuesser';

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

const AdminBuilder = ({children, blacklist, ...props}) => {
  const defined = new Set(
    React.Children.map(children, child => child.props.name),
  );
  const blacklisted = new Set(blacklist);

  return (
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
            {children}
            {data.resources
              .filter(
                resource =>
                  !blacklisted.has(resource.name) &&
                  !defined.has(resource.name),
              )
              .map(resource => (
                <ResourceGuesser name={resource.name} key={resource.name} />
              ))}
          </Admin>
        );
      }}
    </Query>
  );
};

export default AdminBuilder;

AdminBuilder.propTypes = {
  fieldFactory: PropTypes.func,
  inputFactory: PropTypes.func,
  parameterFactory: PropTypes.func,
  resourceFactory: PropTypes.func,
  dataProvider: PropTypes.func.isRequired,
  resources: PropTypes.array,
  blacklist: PropTypes.array,
  children: PropTypes.element,
};
