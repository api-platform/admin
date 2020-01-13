import React from 'react';
import PropTypes from 'prop-types';
import { Create, SimpleForm } from 'react-admin';
import InputGuesser from './InputGuesser';
import Introspecter from './Introspecter';

const displayOverrideCode = (schema, fields) => {
  if (process.env.NODE_ENV === 'production') return;

  let code =
    'If you want to override at least one input, paste this content in the <CreateGuesser> component of your resource:\n\n';

  code += `const ${schema.title}Create = props => (\n`;
  code += `    <CreateGuesser {...props}>\n`;

  fields.forEach(field => {
    code += `        <InputGuesser source={"${field.name}"} />\n`;
  });
  code += `    </CreateGuesser>\n`;
  code += `);\n`;
  code += `\n`;
  code += `And don't forget update your <ResourceGuesser> component:\n`;
  code += `<ResourceGuesser name={"${schema.name}"} create={${schema.title}Create} />`;
  console.info(code);
};

export const IntrospectedCreateGuesser = ({
  fields,
  schema,
  schemaAnalyzer,
  children,
  ...props
}) => {
  let inputChildren = children;
  if (!inputChildren) {
    inputChildren = fields.map(field => (
      <InputGuesser key={field.name} source={field.name} />
    ));
    displayOverrideCode(schema, fields);
  }

  return (
    <Create {...props}>
      <SimpleForm>{inputChildren}</SimpleForm>
    </Create>
  );
};

const CreateGuesser = props => (
  <Introspecter component={IntrospectedCreateGuesser} {...props} />
);

CreateGuesser.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  resource: PropTypes.string.isRequired,
};

export default CreateGuesser;
