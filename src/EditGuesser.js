import React from 'react';
import PropTypes from 'prop-types';
import { Edit, SimpleForm } from 'react-admin';
import InputGuesser from './InputGuesser';
import Introspecter from './Introspecter';

const displayOverrideCode = (schema, fields) => {
  if (process.env.NODE_ENV === 'production') return;

  let code =
    'If you want to override at least one input, paste this content in the <EditGuesser> component of your resource:\n\n';

  code += `const ${schema.title}Edit = props => (\n`;
  code += `    <EditGuesser {...props}>\n`;

  fields.forEach(field => {
    code += `        <InputGuesser source={"${field.name}"} />\n`;
  });
  code += `    </EditGuesser>\n`;
  code += `);\n`;
  code += `\n`;
  code += `And don't forget update your <ResourceGuesser> component:\n`;
  code += `<ResourceGuesser name={"${schema.name}"} edit={${schema.title}Edit} />`;
  console.info(code);
};

export const IntrospectedEditGuesser = ({
  fields,
  readableFields,
  writableFields,
  schema,
  schemaAnalyzer,
  children,
  ...props
}) => {
  let inputChildren = children;
  if (!inputChildren) {
    inputChildren = writableFields.map(field => (
      <InputGuesser key={field.name} source={field.name} />
    ));
    displayOverrideCode(schema, writableFields);
  }

  return (
    <Edit {...props}>
      <SimpleForm>{inputChildren}</SimpleForm>
    </Edit>
  );
};

const EditGuesser = props => (
  <Introspecter component={IntrospectedEditGuesser} {...props} />
);

EditGuesser.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  resource: PropTypes.string.isRequired,
};

export default EditGuesser;
