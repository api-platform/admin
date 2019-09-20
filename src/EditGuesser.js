import React from 'react';
import PropTypes from 'prop-types';
import {Edit, SimpleForm} from 'react-admin';
import InputGuesser from './InputGuesser';
import IntrospectQuery from './IntrospectQuery';

// useful for testing (we don't need Query)
export const EditGuesserComponent = ({
  children,
  fields,
  resourceSchema,
  ...props
}) => {
  if (!children) {
    children = fields.map(field => (
      <InputGuesser key={field.name} source={field.name} />
    ));
  }

  return (
    // FIXME: enabling the undoable feature breaks API Platform Admin...
    // see https://github.com/api-platform/admin/pull/217
    <Edit {...props} undoable={false}>
      <SimpleForm>{children}</SimpleForm>
    </Edit>
  );
};

const EditGuesser = props => (
  <IntrospectQuery component={EditGuesserComponent} {...props} />
);

EditGuesser.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  resource: PropTypes.string.isRequired,
};

export default EditGuesser;
