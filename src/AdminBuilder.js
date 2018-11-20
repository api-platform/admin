import Api from '@api-platform/api-doc-parser/lib/Api';
import {Admin} from 'react-admin';
import PropTypes from 'prop-types';
import React from 'react';
import fieldFactory from './fieldFactory';
import inputFactory from './inputFactory';
import parameterFactory from './parameterFactory';
import resourceFactory from './resourceFactory';

const AdminBuilder = props => {
  const {
    api,
    fieldFactory,
    inputFactory,
    resourceFactory,
    parameterFactory,
    title = api.title,
    resources = api.resources.filter(({deprecated}) => !deprecated),
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
};

AdminBuilder.propTypes = {
  api: PropTypes.instanceOf(Api).isRequired,
  fieldFactory: PropTypes.func,
  inputFactory: PropTypes.func,
  parameterFactory: PropTypes.func,
  resourceFactory: PropTypes.func,
  dataProvider: PropTypes.func.isRequired,
  resource: PropTypes.array,
};

export default AdminBuilder;
