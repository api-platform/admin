import React from "react";
import {
  Admin,
  Resource,
  Loading,
  TranslationProvider,
  Query,
  ListGuesser,
  EditGuesser
} from "react-admin";
import PropTypes from 'prop-types';
import Api from '@api-platform/api-doc-parser/lib/Api';
import { createMuiTheme } from "@material-ui/core/styles";

const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#38a9b4",
      contrastText: "#fff"
    },
    secondary: {
      main: "#288690"
    }
  }
});

const AdminBuilder = props => (
  <Query type="INTROSPECT">
    {({ data, loading, error }) => {
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
          {data.resources.map(resource => (
            <Resource
              name={resource.name}
              key={resource.name}
              list={ListGuesser}
              edit={EditGuesser}
            />
          ))}
        </Admin>
      );
    }}
  </Query>
);

export default AdminBuilder;

AdminBuilder.propTypes = {
  api: PropTypes.instanceOf(Api).isRequired,
  fieldFactory: PropTypes.func,
  inputFactory: PropTypes.func,
  parameterFactory: PropTypes.func,
  resourceFactory: PropTypes.func,
  dataProvider: PropTypes.func.isRequired,
  resources: PropTypes.array,
};
