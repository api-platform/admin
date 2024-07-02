import React from 'react';
import {
  Create,
  FormTab,
  SimpleForm,
  TabbedForm,
  useResourceContext,
} from 'react-admin';
import type { Field, Resource } from '@api-platform/api-doc-parser';

import InputGuesser from './InputGuesser.js';
import Introspecter from './Introspecter.js';
import useDisplayOverrideCode from './useDisplayOverrideCode.js';
import useOnSubmit from './useOnSubmit.js';
import type {
  CreateGuesserProps,
  IntrospectedCreateGuesserProps,
} from './types.js';

const getOverrideCode = (schema: Resource, fields: Field[]) => {
  let code =
    'If you want to override at least one input, paste this content in the <CreateGuesser> component of your resource:\n\n';

  code += `const ${schema.title}Create = props => (\n`;
  code += `    <CreateGuesser {...props}>\n`;

  fields.forEach((field) => {
    code += `        <InputGuesser source={"${field.name}"} />\n`;
  });
  code += `    </CreateGuesser>\n`;
  code += `);\n`;
  code += `\n`;
  code += `And don't forget update your <ResourceGuesser> component:\n`;
  code += `<ResourceGuesser name={"${schema.name}"} create={${schema.title}Create} />`;

  return code;
};

export const IntrospectedCreateGuesser = ({
  fields,
  readableFields,
  writableFields,
  schema,
  schemaAnalyzer,
  resource,
  mutationOptions,
  redirect: redirectTo = 'list',
  mode,
  defaultValues,
  transform,
  validate,
  toolbar,
  warnWhenUnsavedChanges,
  sanitizeEmptyValues = true,
  formComponent,
  viewComponent,
  children,
  ...props
}: IntrospectedCreateGuesserProps) => {
  const save = useOnSubmit({
    resource,
    schemaAnalyzer,
    fields,
    mutationOptions,
    transform,
    redirectTo,
  });

  const displayOverrideCode = useDisplayOverrideCode();

  let inputChildren = React.Children.toArray(children);
  if (inputChildren.length === 0) {
    inputChildren = writableFields.map((field) => (
      <InputGuesser key={field.name} source={field.name} />
    ));
    displayOverrideCode(getOverrideCode(schema, writableFields));
  }

  const hasFormTab = inputChildren.some(
    (child) =>
      typeof child === 'object' && 'type' in child && child.type === FormTab,
  );
  const FormType = hasFormTab ? TabbedForm : SimpleForm;

  return (
    <Create resource={resource} component={viewComponent} {...props}>
      <FormType
        onSubmit={save}
        mode={mode}
        defaultValues={defaultValues}
        validate={validate}
        toolbar={toolbar}
        warnWhenUnsavedChanges={warnWhenUnsavedChanges}
        sanitizeEmptyValues={sanitizeEmptyValues}
        component={formComponent}>
        {inputChildren}
      </FormType>
    </Create>
  );
};

const CreateGuesser = (props: CreateGuesserProps) => {
  const resource = useResourceContext(props);
  if (!resource) {
    throw new Error('guesser must be used with a resource');
  }

  return (
    <Introspecter
      component={IntrospectedCreateGuesser}
      resource={resource}
      {...props}
    />
  );
};

export default CreateGuesser;
