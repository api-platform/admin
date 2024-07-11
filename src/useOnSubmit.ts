import { useCallback } from 'react';
import { useCreate, useNotify, useRedirect, useUpdate } from 'react-admin';
import type { HttpError, RaRecord } from 'react-admin';
import { useParams } from 'react-router-dom';
import lodashIsPlainObject from 'lodash.isplainobject';

import getIdentifierValue from './getIdentifierValue.js';
import type { SubmissionErrors, UseOnSubmitProps } from './types.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const findFile = (values: any[]): Blob | undefined =>
  values.find((value) =>
    Array.isArray(value)
      ? findFile(value)
      : lodashIsPlainObject(value) &&
        Object.values(value).find((val) => val instanceof File),
  );

const useOnSubmit = ({
  resource,
  schemaAnalyzer,
  fields,
  mutationOptions,
  transform,
  redirectTo = 'list',
}: UseOnSubmitProps): ((
  values: Partial<RaRecord>,
) => Promise<SubmissionErrors | undefined>) => {
  const { id: routeId } = useParams<'id'>();
  const id = decodeURIComponent(routeId ?? '');
  const [create] = useCreate();
  const [update] = useUpdate();
  const notify = useNotify();
  const redirect = useRedirect();

  return useCallback(
    async (values: Partial<RaRecord>) => {
      const isCreate = id === '';
      const data = transform ? transform(values) : values;

      // Identifiers need to be formatted in case they have not been modified in the form.
      if (!isCreate) {
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
      }
      try {
        const response = await (isCreate ? create : update)(
          resource,
          {
            ...(isCreate ? {} : { id }),
            data,
            meta: { hasFileField: !!findFile(Object.values(values)) },
          },
          { returnPromise: true },
        );
        const success =
          mutationOptions?.onSuccess ??
          ((record: RaRecord) => {
            notify(
              isCreate ? 'ra.notification.created' : 'ra.notification.updated',
              {
                type: 'info',
                messageArgs: { smart_count: 1 },
              },
            );
            redirect(redirectTo, resource, record.id, record);
          });
        success(
          response,
          {
            data: response,
            ...(isCreate ? {} : { id, previousData: values }),
          },
          {},
        );

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
          mutateError as Error,
          {
            data: values,
            ...(isCreate ? {} : { id, previousData: values }),
          },
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
      id,
      mutationOptions,
      notify,
      redirect,
      redirectTo,
      resource,
      schemaAnalyzer,
      transform,
      create,
      update,
    ],
  );
};

export default useOnSubmit;
