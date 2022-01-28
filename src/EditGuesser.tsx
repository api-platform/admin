import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Edit,
  EditProps,
  FileInput,
  HttpError,
  Record as RaRecord,
  SimpleForm,
  SimpleFormProps,
  useCheckMinimumRequiredProps,
  useMutation,
  useNotify,
  useRedirect,
} from 'react-admin';
import { Field, Resource } from '@api-platform/api-doc-parser';
import InputGuesser from './InputGuesser';
import Introspecter, { BaseIntrospecterProps } from './Introspecter';
import useMercureSubscription from './useMercureSubscription';
import { IntrospectedGuesserProps } from './types';

const displayOverrideCode = (schema: Resource, fields: Field[]) => {
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

type EditSimpleFormProps = EditProps & Omit<SimpleFormProps, 'children'>;

type IntrospectedEditGuesserProps = EditSimpleFormProps &
  IntrospectedGuesserProps;

export type EditGuesserProps = Omit<
  EditSimpleFormProps & BaseIntrospecterProps,
  'component' | 'resource'
>;

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
}: IntrospectedEditGuesserProps) => {
  useMercureSubscription(resource, id);

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
            type: 'update',
            resource: resource,
            payload: {
              id,
              data: { ...values, extraInformation: { hasFileField } },
            },
          },
          { returnPromise: true },
        );
        const success = onSuccess
          ? onSuccess
          : ({ data }: { data: RaRecord }) => {
              notify(successMessage || 'ra.notification.updated', 'info', {
                smart_count: 1,
              });
              redirect(redirectTo, basePath, data.id, data);
            };
        success(response);
        return;
      } catch (error) {
        const submissionErrors = schemaAnalyzer.getSubmissionErrors(
          error as HttpError,
        );
        const failure = onFailure
          ? onFailure
          : (error: string | Error) => {
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
        failure(error as string | Error);
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

  return (
    <Edit
      resource={resource}
      id={id}
      basePath={basePath}
      mutationMode={mutationMode}
      transform={(data) => ({ ...data, extraInformation: { hasFileField } })}
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

const EditGuesser = (props: EditGuesserProps) => {
  useCheckMinimumRequiredProps('EditGuesser', ['resource'], props);
  if (!props.resource) {
    return null;
  }

  return (
    <Introspecter
      component={IntrospectedEditGuesser}
      resource={props.resource}
      {...props}
    />
  );
};

EditGuesser.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  resource: PropTypes.string.isRequired,
};

export default EditGuesser;
