import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Create,
  FileInput,
  SimpleForm,
  useMutation,
  useNotify,
  useRedirect,
} from 'react-admin';
import InputGuesser from './InputGuesser';
import Introspecter from './Introspecter';

const displayOverrideCode = (schema, fields) => {
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
}) => {
  const [mutate] = useMutation();
  const notify = useNotify();
  const redirect = useRedirect();

  let inputChildren = children;
  if (!inputChildren) {
    inputChildren = writableFields.map((field) => (
      <InputGuesser key={field.name} source={field.name} />
    ));
    displayOverrideCode(schema, writableFields);
  }

  const hasFileField = inputChildren.some((child) => child.type === FileInput);

  const save = useCallback(
    async (values) => {
      try {
        const response = await mutate(
          {
            type: 'create',
            resource: resource,
            payload: {
              data: { ...values, extraInformation: { hasFileField } },
            },
          },
          { returnPromise: true },
        );
        const success = onSuccess
          ? onSuccess
          : ({ data: newRecord }) => {
              notify(successMessage || 'ra.notification.created', 'info', {
                smart_count: 1,
              });
              redirect(redirectTo, basePath, newRecord.id, newRecord);
            };
        success(response);
      } catch (error) {
        const submissionErrors = schemaAnalyzer.getSubmissionErrors(error);
        const failure = onFailure
          ? onFailure
          : (error) => {
              let message = 'ra.notification.http_error';
              if (!submissionErrors) {
                message =
                  typeof error === 'string' ? error : error.message || message;
              }
              notify(message, 'warning', {
                _:
                  typeof error === 'string'
                    ? error
                    : error && error.message
                    ? error.message
                    : undefined,
              });
            };
        failure(error);
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

const CreateGuesser = (props) => (
  <Introspecter component={IntrospectedCreateGuesser} {...props} />
);

CreateGuesser.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  resource: PropTypes.string.isRequired,
};

export default CreateGuesser;
