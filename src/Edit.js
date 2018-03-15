import Api from '@api-platform/api-doc-parser/lib/Api';
import Resource from '@api-platform/api-doc-parser/lib/Resource';
import {DisabledInput, Edit as BaseEdit, SimpleForm} from 'admin-on-rest';
import PropTypes from 'prop-types';
import React from 'react';

const resolveProps = props => {
  const {options} = props;
  const {inputFactory: defaultInputFactory, resource} = options;
  const {
    editFields: customFields,
    editProps = {},
    writableFields: defaultFields,
  } = resource;
  const {options: {inputFactory: customInputFactory} = {}} = editProps;

  return {
    ...props,
    ...editProps,
    options: {
      ...options,
      fields: customFields || defaultFields,
      inputFactory: customInputFactory || defaultInputFactory,
    },
  };
};

const Edit = props => {
  const {options: {api, fields, inputFactory, resource}} = resolveProps(props);

  return (
    <BaseEdit {...props}>
      <SimpleForm>
        <DisabledInput source="id" />
        {fields.map(field =>
          inputFactory(field, {
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
