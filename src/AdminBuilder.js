import Api from '@api-platform/api-doc-parser/lib/Api';
import {Admin} from 'admin-on-rest';
import PropTypes from 'prop-types';
import React from 'react';
import fieldFactory from './fieldFactory';
import inputFactory from './inputFactory';
import resourceFactory from './resourceFactory';

const AdminBuilder = props => {
  const {
    api,
    fieldFactory,
    inputFactory,
    resourceFactory,
    title = api.title,
  } = props;

  return (
    <Admin {...props} title={title}>
      {api.resources.map(resource =>
        resourceFactory(resource, api, fieldFactory, inputFactory),
      )}
    </Admin>
  );
};

AdminBuilder.defaultProps = {
  fieldFactory,
  inputFactory,
  resourceFactory,
};

AdminBuilder.propTypes = {
  api: PropTypes.instanceOf(Api).isRequired,
  fieldFactory: PropTypes.func,
  inputFactory: PropTypes.func,
  resourceFactory: PropTypes.func,
  restClient: PropTypes.func.isRequired,
};

export default AdminBuilder;
