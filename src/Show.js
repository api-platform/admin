import Api from '@api-platform/api-doc-parser/lib/Api';
import Resource from '@api-platform/api-doc-parser/lib/Resource';
import {Show as BaseShow, SimpleShowLayout, TextField} from 'admin-on-rest';
import PropTypes from 'prop-types';
import React from 'react';

const Show = props => {
  const {options: {api, fieldFactory, resource}} = props;

  return (
    <BaseShow {...props}>
      <SimpleShowLayout>
        <TextField source="id" />
        {resource.readableFields.map(field =>
          fieldFactory(field, {
            action: 'show',
            api,
            resource,
          }),
        )}
      </SimpleShowLayout>
    </BaseShow>
  );
};

Show.propTypes = {
  options: PropTypes.shape({
    api: PropTypes.instanceOf(Api).isRequired,
    fieldFactory: PropTypes.func.isRequired,
    resource: PropTypes.instanceOf(Resource).isRequired,
  }),
};

export default Show;
