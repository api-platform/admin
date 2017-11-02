import Api from '@api-platform/api-doc-parser/lib/Api';
import Resource from '@api-platform/api-doc-parser/lib/Resource';
import {DisabledInput, Edit as BaseEdit, SimpleForm} from 'admin-on-rest';
import PropTypes from 'prop-types';
import React from 'react';

const Edit = props => {
  const {options: {api, inputFactory, resource}} = props;

  return (
    <BaseEdit {...props}>
      <SimpleForm>
        <DisabledInput source="id" />
        {resource.writableFields.map(field =>
          inputFactory(field, {
            action: 'edit',
            api,
            resource,
          }),
        )}
      </SimpleForm>
    </BaseEdit>
  );
};

Edit.propTypes = {
  options: PropTypes.shape({
    api: PropTypes.instanceOf(Api).isRequired,
    inputFactory: PropTypes.func.isRequired,
    resource: PropTypes.instanceOf(Resource).isRequired,
  }),
};

export default Edit;
