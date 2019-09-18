import React from 'react';
import PropTypes from 'prop-types';
import {Edit, SimpleForm} from 'react-admin';
import InputGuesser from './InputGuesser';
import WithReactAdminQuery from './withReactAdminQuery';

// useful for testing (we don't need Query)
const EditGuesserComponent = props => {
  const {children, fields, resourceSchema, ...filteredProps} = props;

  return (
    <Edit {...filteredProps} undoable={false}>
      <SimpleForm>
        {children}
        {fields.map(field => (
          <InputGuesser key={field.name} source={field.name} />
        ))}
      </SimpleForm>
    </Edit>
  );
};

const EditGuesser = props => (
  <WithReactAdminQuery component={EditGuesserComponent} {...props} />
);

export default EditGuesser;

EditGuesser.propTypes = {
  children: PropTypes.object,
  resource: PropTypes.string.isRequired,
  inputs: PropTypes.array,
};
