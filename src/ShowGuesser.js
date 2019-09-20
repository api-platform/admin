import React from 'react';
import PropTypes from 'prop-types';
import {Show, SimpleShowLayout} from 'react-admin';
import FieldGuesser from './FieldGuesser';
import IntrospectQuery from './IntrospectQuery';

// useful for testing (we don't need Query)
export const ShowGuesserComponent = ({
  fields,
  children,
  resourceSchema,
  ...props
}) => {
  if (!children) {
    children = fields.map(field => (
      <FieldGuesser key={field.name} source={field.name} addLabel={true} />
    ));
  }

  return (
    <Show {...props}>
      <SimpleShowLayout>{children}</SimpleShowLayout>
    </Show>
  );
};

const ShowGuesser = props => (
  <IntrospectQuery component={ShowGuesserComponent} {...props} />
);

ShowGuesser.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  resource: PropTypes.string.isRequired,
};

export default ShowGuesser;
