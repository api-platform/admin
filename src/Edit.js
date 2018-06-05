import Api from '@api-platform/api-doc-parser/lib/Api';
import Resource from '@api-platform/api-doc-parser/lib/Resource';
import {DisabledInput, Edit as BaseEdit, SimpleForm} from 'react-admin';
import PropTypes from 'prop-types';
import React from 'react';

const hasIdentifier = fields => {
  return (
    undefined !== fields.find(({id}) => 'http://schema.org/identifier' === id)
  );
};

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
      fields:
        customFields || defaultFields.filter(({deprecated}) => !deprecated),
      inputFactory: customInputFactory || defaultInputFactory,
    },
  };
};

const Edit = props => {
  const {
    options: {api, fields, inputFactory, resource},
    addIdInput = false === hasIdentifier(fields),
  } = resolveProps(props);

  return (
    <BaseEdit {...props}>
      <SimpleForm>
        {addIdInput && <DisabledInput source="id" />}
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
  addIdInput: PropTypes.bool,
  options: PropTypes.shape({
    api: PropTypes.instanceOf(Api).isRequired,
    inputFactory: PropTypes.func.isRequired,
    resource: PropTypes.instanceOf(Resource).isRequired,
  }),
};

export default Edit;
