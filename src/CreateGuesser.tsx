import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Create,
  FileInput,
  SimpleForm,
  useCheckMinimumRequiredProps,
  useMutation,
  useNotify,
  useRedirect,
} from 'react-admin';
import type { HttpError, Record as RaRecord } from 'react-admin';
import type { Field, Resource } from '@api-platform/api-doc-parser';

import InputGuesser from './InputGuesser';
import Introspecter from './Introspecter';
import type {
  CreateGuesserProps,
  IntrospectedCreateGuesserProps,
} from './types';

const displayOverrideCode = (schema: Resource, fields: Field[]) => {
  if (process.env.NODE_ENV === 'production') return;

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
  // eslint-disable-next-line no-console
  console.info(code);
};

export const IntrospectedCreateGuesser = ({
  fields,
  readableFields,
  writableFields,
  schema,
  schemaAnalyzer,
  resource,
  basePath,
  onSuccess,
  successMessage,
  onFailure,
  redirect: redirectTo = 'list',
  initialValues,
  validate,
  toolbar,
  margin,
  variant,
  submitOnEnter,
  warnWhenUnsavedChanges,
  sanitizeEmptyValues,
  simpleFormComponent,
  children,
  ...props
}: IntrospectedCreateGuesserProps) => {
  const [mutate] = useMutation();
  const notify = useNotify();
  const redirect = useRedirect();

  let inputChildren = React.Children.toArray(children);
  if (inputChildren.length === 0) {
    inputChildren = writableFields.map((field) => (
      <InputGuesser key={field.name} source={field.name} />
    ));
    displayOverrideCode(schema, writableFields);
  }

  const hasFileField = inputChildren.some(
    (child) =>
      typeof child === 'object' && 'type' in child && child.type === FileInput,
  );

  const save = useCallback(
    async (values) => {
      try {
        const response = await mutate(
          {
            type: 'create',
            resource,
            payload: {
              data: { ...values, extraInformation: { hasFileField } },
            },
          },
          { returnPromise: true },
        );
        const success =
          onSuccess ??
          (({ data: newRecord }: { data: RaRecord }) => {
            notify(successMessage || 'ra.notification.created', 'info', {
              smart_count: 1,
            });
            redirect(redirectTo, basePath, newRecord.id, newRecord);
          });
        success(response);
        return undefined;
      } catch (mutateError) {
        const submissionErrors = schemaAnalyzer.getSubmissionErrors(
          mutateError as HttpError,
        );
        const failure =
          onFailure ??
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
            notify(message, 'warning', {
              _: errorMessage,
            });
          });
        failure(mutateError as string | Error);
        if (submissionErrors) {
          return submissionErrors;
        }
        return {};
      }
    },
    [
      mutate,
      hasFileField,
      resource,
      onSuccess,
      successMessage,
      onFailure,
      notify,
      redirect,
      redirectTo,
      basePath,
      schemaAnalyzer,
    ],
  );

  return (
    <Create resource={resource} basePath={basePath} {...props}>
      <SimpleForm
        save={save}
        initialValues={initialValues}
        validate={validate}
        toolbar={toolbar}
        margin={margin}
        variant={variant}
        submitOnEnter={submitOnEnter}
        warnWhenUnsavedChanges={warnWhenUnsavedChanges}
        sanitizeEmptyValues={sanitizeEmptyValues}
        component={simpleFormComponent}>
        {inputChildren}
      </SimpleForm>
    </Create>
  );
};

const CreateGuesser = (props: CreateGuesserProps) => {
  useCheckMinimumRequiredProps('CreateGuesser', ['resource'], props);
  const { resource, ...rest } = props;
  if (!resource) {
    return null;
  }

  return (
    <Introspecter
      component={IntrospectedCreateGuesser}
      resource={resource}
      {...rest}
    />
  );
};

CreateGuesser.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  resource: PropTypes.string.isRequired,
};

export default CreateGuesser;
