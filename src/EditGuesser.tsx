import React, { useCallback } from 'react';
import type { PropsWithChildren, ReactNode } from 'react';
import PropTypes from 'prop-types';
import {
  Edit,
  FileInput,
  FormTab,
  SimpleForm,
  TabbedForm,
  useNotify,
  useRedirect,
  useResourceContext,
  useUpdate,
} from 'react-admin';
import type { HttpError, RaRecord } from 'react-admin';
import { useParams } from 'react-router-dom';
import type { Field, Resource } from '@api-platform/api-doc-parser';

import InputGuesser from './InputGuesser.js';
import Introspecter from './Introspecter.js';
import getIdentifierValue from './getIdentifierValue.js';
import useMercureSubscription from './useMercureSubscription.js';
import useDisplayOverrideCode from './useDisplayOverrideCode.js';
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
  sanitizeEmptyValues = true,
  children,
  ...props
}: IntrospectedEditGuesserProps) => {
  const { id: routeId } = useParams<'id'>();
  const id = decodeURIComponent(routeId ?? '');
  useMercureSubscription(resource, id);

  const [update] = useUpdate();
  const notify = useNotify();
  const redirect = useRedirect();

  const displayOverrideCode = useDisplayOverrideCode();

  let inputChildren = React.Children.toArray(children);
  if (inputChildren.length === 0) {
    inputChildren = writableFields.map((field) => (
      <InputGuesser key={field.name} source={field.name} />
    ));
    displayOverrideCode(getOverrideCode(schema, writableFields));
  }
  const hasFileFieldElement = (elements: Array<ReactNode>): boolean =>
    elements.some(
      (child) =>
        React.isValidElement(child) &&
        (child.type === FileInput ||
          hasFileFieldElement(
            React.Children.toArray((child.props as PropsWithChildren).children),
          )),
    );
  const hasFileField = hasFileFieldElement(inputChildren);

  const save = useCallback(
    async (values: Partial<RaRecord>) => {
      if (id === undefined) {
        return undefined;
      }
      let data = values;
      if (transform) {
        data = transform(values);
      }
      // Identifiers need to be formatted in case they have not been modified in the form.
      Object.entries(values).forEach(([key, value]) => {
        const identifierValue = getIdentifierValue(
          schemaAnalyzer,
          resource,
          fields,
          key,
          value,
        );
        if (identifierValue !== value) {
          data[key] = identifierValue;
        }
      });
      try {
        const response = await update(
          resource,
          {
            id,
            data: { ...data, extraInformation: { hasFileField } },
          },
          { returnPromise: true },
        );
        const success =
          mutationOptions?.onSuccess ??
          ((updatedRecord: RaRecord) => {
            notify('ra.notification.updated', {
              type: 'info',
              messageArgs: { smart_count: 1 },
            });
            redirect(redirectTo, resource, updatedRecord.id, updatedRecord);
          });
        success(response, { id, data: response, previousData: values }, {});
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
        failure(
          mutateError as string | Error,
          { id, data: values, previousData: values },
          {},
        );
        if (submissionErrors) {
          return submissionErrors;
        }
        return {};
      }
    },
    [
      fields,
      hasFileField,
      id,
      mutationOptions,
      notify,
      redirect,
      redirectTo,
      resource,
      schemaAnalyzer,
      transform,
      update,
    ],
  );

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
      transform={(data) => ({ ...data, extraInformation: { hasFileField } })}
      {...props}>
      <FormType
        onSubmit={mutationMode !== 'pessimistic' ? undefined : save}
        mode={mode}
        defaultValues={defaultValues}
        validate={validate}
        redirect={redirectTo}
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
