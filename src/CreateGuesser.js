import React, {Children} from 'react';
import PropTypes from 'prop-types';
import {Create, SimpleForm} from 'react-admin';
import InputGuesser from './InputGuesser';
import WithReactAdminQuery from './withReactAdminQuery';

const CreateGuesserComponent = ({...props}) => {
  const {fields, resourceSchema, ...filteredProps} = props;
  const children = Children.toArray(props.children);

  fields.map(field =>
    children.push(<InputGuesser key={field.name} source={field.name} />),
  );

  return (
    <Create {...filteredProps}>
      <SimpleForm>{children}</SimpleForm>
    </Create>
  );
};

const CreateGuesser = props => (
  <WithReactAdminQuery component={CreateGuesserComponent} {...props} />
);

export default CreateGuesser;

CreateGuesser.propTypes = {
  children: PropTypes.object,
  resource: PropTypes.string.isRequired,
  inputs: PropTypes.array,
};
