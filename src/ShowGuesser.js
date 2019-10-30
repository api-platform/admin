import React from 'react';
import PropTypes from 'prop-types';
import {Show, SimpleShowLayout} from 'react-admin';
import FieldGuesser from './FieldGuesser';
import IntrospectQuery from './IntrospectQuery';

const displayOverrideCode = (resourceSchema, fields) => {
  let code =
    'If you want to override at least one field, paste this content in the <ShowGuesser> component of your resource:\n\n';

  code += `const ${resourceSchema.title}Show = props => (\n`;
  code += `    <ShowGuesser {...props}>\n`;

  fields.forEach(field => {
    code += `        <FieldGuesser source={"${field.name}"} addLabel={true} />\n`;
  });
  code += `    </ShowGuesser>\n`;
  code += `);\n`;
  code += `\n`;
  code += `And don't forget update your <ResourceGuesser> component:\n`;
  code += `<ResourceGuesser name={"${resourceSchema.name}"} show={${resourceSchema.title}Show} />`;
  console.info(code);
};

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
    displayOverrideCode(resourceSchema, fields);
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
