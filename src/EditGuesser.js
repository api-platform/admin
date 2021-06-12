import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Edit,
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
  console.info(code);
};

export const IntrospectedEditGuesser = ({
  fields,
  readableFields,
  writableFields,
  schema,
  schemaAnalyzer,
  resource,
  id,
  basePath,
  // @deprecated use mutationMode: undoable instead
  undoable = false,
  mutationMode = undoable ? 'undoable' : 'pessimistic',
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
  const save = useCallback(
    async (values) => {
      try {
        const response = await mutate(
          {
            type: 'update',
            resource: resource,
            payload: { id, data: values },
          },
          { returnPromise: true },
        );
        const success = onSuccess
          ? onSuccess
          : ({ data }) => {
              notify(successMessage || 'ra.notification.updated', 'info', {
                smart_count: 1,
              });
              redirect(redirectTo, basePath, data.id, data);
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
      resource,
      id,
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

  let inputChildren = children;
  if (!inputChildren) {
    inputChildren = writableFields.map((field) => (
      <InputGuesser key={field.name} source={field.name} />
    ));
    displayOverrideCode(schema, writableFields);
  }

  return (
    <Edit
      resource={resource}
      id={id}
      basePath={basePath}
      mutationMode={mutationMode}
      {...props}>
      <SimpleForm
        save={mutationMode !== 'pessimistic' ? undefined : save}
        initialValues={initialValues}
        validate={validate}
        redirect={redirectTo}
        toolbar={toolbar}
        margin={margin}
        variant={variant}
        submitOnEnter={submitOnEnter}
        warnWhenUnsavedChanges={warnWhenUnsavedChanges}
        sanitizeEmptyValues={sanitizeEmptyValues}
        component={simpleFormComponent}>
        {inputChildren}
      </SimpleForm>
    </Edit>
  );
};

const EditGuesser = (props) => (
  <Introspecter component={IntrospectedEditGuesser} {...props} />
);

EditGuesser.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  resource: PropTypes.string.isRequired,
};

export default EditGuesser;
