import Api from '@api-platform/api-doc-parser/lib/Api';
import Resource from '@api-platform/api-doc-parser/lib/Resource';
import {Show as BaseShow, SimpleShowLayout, TextField} from 'admin-on-rest';
import PropTypes from 'prop-types';
import React from 'react';

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
      fieldFactory: customFieldFactory || defaultFieldFactory,
      fields: customFields || defaultFields,
    },
  };
};

const Show = props => {
  const {
    addIdField,
    options: {api, fieldFactory, fields, resource},
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

Show.defaultProps = {
  addIdField: true,
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
