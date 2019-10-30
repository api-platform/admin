import React from 'react';
import PropTypes from 'prop-types';
import {Create, SimpleForm} from 'react-admin';
import InputGuesser from './InputGuesser';
import IntrospectQuery from './IntrospectQuery';

const displayOverrideCode = (resourceSchema, fields) => {
  let code =
    'If you want to override at least one input, paste this content in the <CreateGuesser> component of your resource:\n\n';

  code += `const ${resourceSchema.title}Create = props => (\n`;
  code += `    <CreateGuesser {...props}>\n`;

  fields.forEach(field => {
    code += `        <InputGuesser source={"${field.name}"} />\n`;
  });
  code += `    </CreateGuesser>\n`;
  code += `);\n`;
  code += `\n`;
  code += `And don't forget update your <ResourceGuesser> component:\n`;
  code += `<ResourceGuesser name={"${resourceSchema.name}"} create={${resourceSchema.title}Create} />`;
  console.info(code);
};

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
    displayOverrideCode(resourceSchema, fields);
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
