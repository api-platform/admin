import Api from '@api-platform/api-doc-parser/lib/Api';
import {Admin} from 'react-admin';
import PropTypes from 'prop-types';
import React from 'react';
import {createMuiTheme} from '@material-ui/core/styles';
import fieldFactory from './fieldFactory';
import inputFactory from './inputFactory';
import {Layout} from './layout';
import parameterFactory from './parameterFactory';
import resourceFactory from './resourceFactory';

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

const AdminBuilder = props => {
  const {
    api,
    fieldFactory,
    inputFactory,
    resourceFactory,
    parameterFactory,
    title = api.title,
    resources = api.resources.filter(({deprecated}) => !deprecated),
    listFieldFilter,
  } = props;

  return (
    <Admin {...props} title={title}>
      {resources.map(resource =>
        resourceFactory(
          resource,
          api,
          fieldFactory,
          inputFactory,
          parameterFactory,
          listFieldFilter,
        ),
      )}
    </Admin>
  );
};

AdminBuilder.defaultProps = {
  fieldFactory,
  inputFactory,
  resourceFactory,
  parameterFactory,
  theme,
  appLayout: Layout,
};

AdminBuilder.propTypes = {
  api: PropTypes.instanceOf(Api).isRequired,
  fieldFactory: PropTypes.func,
  inputFactory: PropTypes.func,
  parameterFactory: PropTypes.func,
  resourceFactory: PropTypes.func,
  dataProvider: PropTypes.func.isRequired,
  resources: PropTypes.array,
};

export default AdminBuilder;
