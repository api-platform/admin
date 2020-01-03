import React from 'react';
import PropTypes from 'prop-types';
import {Edit, SimpleForm} from 'react-admin';
import InputGuesser from './InputGuesser';
import Introspecter from './Introspecter';

const displayOverrideCode = (resourceSchema, fields) => {
  if (process.env.NODE_ENV === 'production') return;

  let code =
    'If you want to override at least one input, paste this content in the <EditGuesser> component of your resource:\n\n';

  code += `const ${resourceSchema.title}Edit = props => (\n`;
  code += `    <EditGuesser {...props}>\n`;

  fields.forEach(field => {
    code += `        <InputGuesser source={"${field.name}"} />\n`;
  });
  code += `    </EditGuesser>\n`;
  code += `);\n`;
  code += `\n`;
  code += `And don't forget update your <ResourceGuesser> component:\n`;
  code += `<ResourceGuesser name={"${resourceSchema.name}"} edit={${resourceSchema.title}Edit} />`;
  console.info(code);
};

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
    displayOverrideCode(resourceSchema, fields);
  }

  return (
    <Edit {...props}>
      <SimpleForm>{children}</SimpleForm>
    </Edit>
  );
};

const EditGuesser = props => (
  <Introspecter component={EditGuesserComponent} {...props} />
);

EditGuesser.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  resource: PropTypes.string.isRequired,
};

export default EditGuesser;
