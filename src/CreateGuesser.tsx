import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Create,
  FileInput,
  SimpleForm,
  useCreate,
  useNotify,
  useRedirect,
  useResourceContext,
} from 'react-admin';
import type { HttpError, RaRecord } from 'react-admin';
import type { Field, Resource } from '@api-platform/api-doc-parser';

import InputGuesser from './InputGuesser.js';
import Introspecter from './Introspecter.js';
import useDisplayOverrideCode from './useDisplayOverrideCode.js';
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
  sanitizeEmptyValues,
  simpleFormComponent,
  children,
  ...props
}: IntrospectedCreateGuesserProps) => {
  const [create] = useCreate();
  const notify = useNotify();
  const redirect = useRedirect();

  const displayOverrideCode = useDisplayOverrideCode();

  let inputChildren = React.Children.toArray(children);
  if (inputChildren.length === 0) {
    inputChildren = writableFields.map((field) => (
      <InputGuesser
        key={field.name}
        source={field.name}
        sanitizeEmptyValue={sanitizeEmptyValues}
      />
    ));
    displayOverrideCode(getOverrideCode(schema, writableFields));
  }

  const hasFileField = inputChildren.some(
    (child) =>
      typeof child === 'object' && 'type' in child && child.type === FileInput,
  );

  const save = useCallback(
    async (values: Partial<RaRecord>) => {
      let data = values;
      if (transform) {
        data = transform(values);
      }
      try {
        const response = await create(
          resource,
          {
            data: { ...data, extraInformation: { hasFileField } },
          },
          { returnPromise: true },
        );
        const success =
          mutationOptions?.onSuccess ??
          ((newRecord: RaRecord) => {
            notify('ra.notification.created', {
              type: 'info',
              messageArgs: { smart_count: 1 },
            });
            redirect(redirectTo, resource, newRecord.id, newRecord);
          });
        success(response, { data: response }, {});
        return undefined;
      } catch (mutateError) {
        const submissionErrors = schemaAnalyzer.getSubmissionErrors(
          mutateError as HttpError,
        );
        const failure =
          mutationOptions?.onError ??
          ((error: string | Error) => {
            let message = 'ra.notification.http_error';
            if (!submissionErrors) {
              message =
                typeof error === 'string' ? error : error.message || message;
            }
            let errorMessage;
            if (typeof error === 'string') {
              errorMessage = error;
            } else if (error?.message) {
              errorMessage = error.message;
            }
            notify(message, {
              type: 'warning',
              messageArgs: { _: errorMessage },
            });
          });
        failure(mutateError as string | Error, { data: values }, {});
        if (submissionErrors) {
          return submissionErrors;
        }
        return {};
      }
    },
    [
      create,
      hasFileField,
      resource,
      mutationOptions,
      notify,
      redirect,
      redirectTo,
      schemaAnalyzer,
      transform,
    ],
  );

  return (
    <Create resource={resource} {...props}>
      <SimpleForm
        onSubmit={save}
        mode={mode}
        defaultValues={defaultValues}
        validate={validate}
        toolbar={toolbar}
        warnWhenUnsavedChanges={warnWhenUnsavedChanges}
        component={simpleFormComponent}>
        {inputChildren}
      </SimpleForm>
    </Create>
  );
};

const CreateGuesser = (props: CreateGuesserProps) => {
  const resource = useResourceContext(props);

  return (
    <Introspecter
      component={IntrospectedCreateGuesser}
      resource={resource}
      {...props}
    />
  );
};

/* eslint-disable tree-shaking/no-side-effects-in-initialization */
CreateGuesser.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  resource: PropTypes.string,
};
/* eslint-enable tree-shaking/no-side-effects-in-initialization */

export default CreateGuesser;
