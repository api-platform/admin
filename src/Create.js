import Api from '@api-platform/api-doc-parser/lib/Api';
import Resource from '@api-platform/api-doc-parser/lib/Resource';
import {Create as BaseCreate, SimpleForm} from 'admin-on-rest';
import PropTypes from 'prop-types';
import React from 'react';

const Create = props => {
  const {options: {api, inputFactory, resource}} = props;

  return (
    <BaseCreate {...props}>
      <SimpleForm>
        {resource.writableFields.map(field =>
          inputFactory(field, {
            action: 'create',
            api,
            resource,
          }),
        )}
      </SimpleForm>
    </BaseCreate>
  );
};

Create.propTypes = {
  options: PropTypes.shape({
    api: PropTypes.instanceOf(Api).isRequired,
    inputFactory: PropTypes.func.isRequired,
    resource: PropTypes.instanceOf(Resource).isRequired,
  }),
};

export default Create;
