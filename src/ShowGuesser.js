import React from 'react';
import PropTypes from 'prop-types';
import {Show, SimpleShowLayout} from 'react-admin';
import FieldGuesser from './FieldGuesser';
import WithReactAdminQuery from './withReactAdminQuery';

// useful for testing (we don't need Query)
export const ShowGuesserComponent = props => {
  const {children, fields} = props;

  return (
    <Show {...props}>
      <SimpleShowLayout>
        {children}
        {fields.map(field => (
          <FieldGuesser key={field.name} source={field.name} addLabel={true} />
        ))}
      </SimpleShowLayout>
    </Show>
  );
};

const ShowGuesser = props => (
  <WithReactAdminQuery component={ShowGuesserComponent} {...props} />
);

export default ShowGuesser;

ShowGuesser.propTypes = {
  children: PropTypes.object,
  resource: PropTypes.string.isRequired,
  fields: PropTypes.array,
};
