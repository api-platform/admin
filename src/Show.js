import Api from '@api-platform/api-doc-parser/lib/Api';
import Resource from '@api-platform/api-doc-parser/lib/Resource';
import {Show as BaseShow, SimpleShowLayout, TextField} from 'react-admin';
import PropTypes from 'prop-types';
import React from 'react';

const hasIdentifier = fields => {
  return (
    undefined !== fields.find(({id}) => 'http://schema.org/identifier' === id)
  );
};

const resolveProps = props => {
  const {options} = props;
  const {fieldFactory: defaultFieldFactory, resource} = options;
  const {
    showFields: customFields,
    readableFields: defaultFields,
    showProps = {},
  } = resource;
  const {options: {fieldFactory: customFieldFactory} = {}} = showProps;

  return {
    ...props,
    ...showProps,
    options: {
      ...options,
      fields:
        customFields || defaultFields.filter(({deprecated}) => !deprecated),
      fieldFactory: customFieldFactory || defaultFieldFactory,
    },
  };
};

const Show = props => {
  const {
    options: {api, fieldFactory, fields, resource},
    addIdField = false === hasIdentifier(fields),
  } = resolveProps(props);

  return (
    <BaseShow {...props}>
      <SimpleShowLayout>
        {addIdField && <TextField source="id" />}
        {fields.map(field =>
          fieldFactory(field, {
            api,
            resource,
          }),
        )}
      </SimpleShowLayout>
    </BaseShow>
  );
};

Show.propTypes = {
  addIdField: PropTypes.bool,
  options: PropTypes.shape({
    api: PropTypes.instanceOf(Api).isRequired,
    fieldFactory: PropTypes.func.isRequired,
    resource: PropTypes.instanceOf(Resource).isRequired,
    showProps: PropTypes.object,
  }),
};

export default Show;
