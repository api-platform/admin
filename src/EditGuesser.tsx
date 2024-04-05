import React from 'react';
import PropTypes from 'prop-types';
import {
  Edit,
  FormTab,
  SimpleForm,
  TabbedForm,
  useResourceContext,
} from 'react-admin';
import { useParams } from 'react-router-dom';
import type { Field, Resource } from '@api-platform/api-doc-parser';

import InputGuesser from './InputGuesser.js';
import Introspecter from './Introspecter.js';
import useMercureSubscription from './useMercureSubscription.js';
import useDisplayOverrideCode from './useDisplayOverrideCode.js';
import useOnSubmit from './useOnSubmit.js';
import type {
  EditGuesserProps,
  IntrospectedEditGuesserProps,
} from './types.js';

const getOverrideCode = (schema: Resource, fields: Field[]) => {
  let code =
    'If you want to override at least one input, paste this content in the <EditGuesser> component of your resource:\n\n';

  code += `const ${schema.title}Edit = props => (\n`;
  code += `    <EditGuesser {...props}>\n`;

  fields.forEach((field) => {
    code += `        <InputGuesser source={"${field.name}"} />\n`;
  });
  code += `    </EditGuesser>\n`;
  code += `);\n`;
  code += `\n`;
  code += `And don't forget update your <ResourceGuesser> component:\n`;
  code += `<ResourceGuesser name={"${schema.name}"} edit={${schema.title}Edit} />`;

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

  return (
    <Introspecter
      component={IntrospectedEditGuesser}
      resource={resource}
      {...props}
    />
  );
};

/* eslint-disable tree-shaking/no-side-effects-in-initialization */
EditGuesser.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  resource: PropTypes.string,
};
/* eslint-enable tree-shaking/no-side-effects-in-initialization */

export default EditGuesser;
