import React from 'react';
import {
  Create,
  FormTab,
  SimpleForm,
  TabbedForm,
  useResourceContext,
} from 'react-admin';
import type { Field, Resource } from '@api-platform/api-doc-parser';

import InputGuesser from '../input/InputGuesser.js';
import Introspecter from '../introspection/Introspecter.js';
import useDisplayOverrideCode from '../useDisplayOverrideCode.js';
import useOnSubmit from '../useOnSubmit.js';
import type {
  CreateGuesserProps,
  IntrospectedCreateGuesserProps,
} from '../types.js';

const getOverrideCode = (schema: Resource, fields: Field[]) => {
  let code = `If you want to override at least one input, create a ${schema.title}Create component with this content:\n`;
  code += `\n`;
  code += `import { CreateGuesser, InputGuesser } from "@api-platform/admin";\n`;
  code += `\n`;
  code += `export const ${schema.title}Create = () => (\n`;
  code += `    <CreateGuesser>\n`;
  fields.forEach((field) => {
    code += `        <InputGuesser source="${field.name}" />\n`;
  });
  code += `    </CreateGuesser>\n`;
  code += `);\n`;
  code += `\n`;
  code += `Then, update your main admin component:\n`;
  code += `\n`;
  code += `import { HydraAdmin, ResourceGuesser } from "@api-platform/admin";\n`;
  code += `import { ${schema.title}Create } from './${schema.title}Create';\n`;
  code += `\n`;
  code += `const App = () => (\n`;
  code += `    <HydraAdmin entrypoint={...}>\n`;
  code += `        <ResourceGuesser name="${schema.name}" create={${schema.title}Create} />\n`;
  code += `        {/* ... */}\n`;
  code += `    </HydraAdmin>\n`;
  code += `);\n`;

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
    children: [],
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
    throw new Error('CreateGuesser must be used with a resource');
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
