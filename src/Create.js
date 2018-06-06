import Api from '@api-platform/api-doc-parser/lib/Api';
import Resource from '@api-platform/api-doc-parser/lib/Resource';
import {Create as BaseCreate, SimpleForm} from 'react-admin';
import PropTypes from 'prop-types';
import React from 'react';

const resolveProps = props => {
  const {options} = props;
  const {inputFactory: defaultInputFactory, resource} = options;
  const {
    createFields: customFields,
    createProps = {},
    writableFields: defaultFields,
  } = resource;
  const {options: {inputFactory: customInputFactory} = {}} = createProps;

  return {
    ...props,
    ...createProps,
    options: {
      ...options,
      fields:
        customFields || defaultFields.filter(({deprecated}) => !deprecated),
      inputFactory: customInputFactory || defaultInputFactory,
    },
  };
};

const Create = props => {
  const {
    options: {api, fields, inputFactory, resource},
  } = resolveProps(props);

  return (
    <BaseCreate {...props}>
      <SimpleForm>
        {fields.map(field =>
          inputFactory(field, {
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
