import React from 'react';
import {
  Edit,
  FormTab,
  SimpleForm,
  TabbedForm,
  useResourceContext,
} from 'react-admin';
import { useParams } from 'react-router-dom';
import type { Field, Resource } from '@api-platform/api-doc-parser';

import InputGuesser from '../input/InputGuesser.js';
import Introspecter from '../introspection/Introspecter.js';
import useMercureSubscription from '../mercure/useMercureSubscription.js';
import useDisplayOverrideCode from '../useDisplayOverrideCode.js';
import useOnSubmit from '../useOnSubmit.js';
import type {
  EditGuesserProps,
  IntrospectedEditGuesserProps,
} from '../types.js';

const getOverrideCode = (schema: Resource, fields: Field[]) => {
  let code = `If you want to override at least one input, create a ${schema.title}Edit component with this content:\n`;
  code += `\n`;
  code += `import { EditGuesser, InputGuesser } from "@api-platform/admin";\n`;
  code += `\n`;
  code += `export const ${schema.title}Edit = () => (\n`;
  code += `    <EditGuesser>\n`;
  fields.forEach((field) => {
    code += `        <InputGuesser source="${field.name}" />\n`;
  });
  code += `    </EditGuesser>\n`;
  code += `);\n`;
  code += `\n`;
  code += `Then, update your main admin component:\n`;
  code += `\n`;
  code += `import { HydraAdmin, ResourceGuesser } from "@api-platform/admin";\n`;
  code += `import { ${schema.title}Edit } from './${schema.title}Edit';\n`;
  code += `\n`;
  code += `const App = () => (\n`;
  code += `    <HydraAdmin entrypoint={...}>\n`;
  code += `        <ResourceGuesser name="${schema.name}" edit={${schema.title}Edit} />\n`;
  code += `        {/* ... */}\n`;
  code += `    </HydraAdmin>\n`;
  code += `);\n`;

  return code;
};

export const IntrospectedEditGuesser = ({
  fields,
  readableFields,
  writableFields,
  schema,
  schemaAnalyzer,
  resource,
  mutationMode = 'pessimistic',
  mutationOptions,
  redirect: redirectTo = 'list',
  mode,
  defaultValues,
  validate,
  transform,
  toolbar,
  warnWhenUnsavedChanges,
  formComponent,
  viewComponent,
  sanitizeEmptyValues = true,
  children,
  ...props
}: IntrospectedEditGuesserProps) => {
  const { id: routeId } = useParams<'id'>();
  const id = decodeURIComponent(routeId ?? '');
  const save = useOnSubmit({
    resource,
    schemaAnalyzer,
    fields,
    mutationOptions,
    transform,
    redirectTo,
    children: [],
  });
  useMercureSubscription(resource, id);

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
    <Edit
      resource={resource}
      id={id}
      mutationMode={mutationMode}
      redirect={redirectTo}
      component={viewComponent}
      {...props}>
      <FormType
        onSubmit={mutationMode !== 'pessimistic' ? undefined : save}
        mode={mode}
        defaultValues={defaultValues}
        validate={validate}
        toolbar={toolbar}
        warnWhenUnsavedChanges={warnWhenUnsavedChanges}
        sanitizeEmptyValues={sanitizeEmptyValues}
        component={formComponent}>
        {inputChildren}
      </FormType>
    </Edit>
  );
};

const EditGuesser = (props: EditGuesserProps) => {
  const resource = useResourceContext(props);
  if (!resource) {
    throw new Error('EditGuesser must be used with a resource');
  }

  return (
    <Introspecter
      component={IntrospectedEditGuesser}
      resource={resource}
      {...props}
    />
  );
};

export default EditGuesser;
