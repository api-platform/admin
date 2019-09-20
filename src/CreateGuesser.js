import React from 'react';
import PropTypes from 'prop-types';
import {Create, SimpleForm} from 'react-admin';
import InputGuesser from './InputGuesser';
import IntrospectQuery from './IntrospectQuery';

export const CreateGuesserComponent = ({
  fields,
  resourceSchema,
  children,
  ...props
}) => {
  if (!children) {
    children = fields.map(field => (
      <InputGuesser key={field.name} source={field.name} />
    ));
  }

  return (
    <Create {...props}>
      <SimpleForm>{children}</SimpleForm>
    </Create>
  );
};

const CreateGuesser = props => (
  <IntrospectQuery component={CreateGuesserComponent} {...props} />
);

CreateGuesser.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  resource: PropTypes.string.isRequired,
};

export default CreateGuesser;
