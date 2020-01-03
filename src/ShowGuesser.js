import React from 'react';
import PropTypes from 'prop-types';
import {Show, SimpleShowLayout} from 'react-admin';
import FieldGuesser from './FieldGuesser';
import Introspecter from './Introspecter';

const displayOverrideCode = (resourceSchema, fields) => {
  if (process.env.NODE_ENV === 'production') return;

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

export const ShowGuesserComponent = ({
  fields,
  children,
  resourceSchema,
  ...props
}) => {
  if (!children) {
    children = fields.map(field => (
      <FieldGuesser
        key={field.name}
        source={field.name}
        addLabel={true}
        resource={props.resource}
      />
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
  <Introspecter component={ShowGuesserComponent} {...props} />
);

ShowGuesser.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  resource: PropTypes.string.isRequired,
};

export default ShowGuesser;
