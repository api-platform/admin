import React, { useContext, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useLogoutIfAccessDenied } from 'react-admin';
import SchemaAnalyzerContext from './SchemaAnalyzerContext';
import useIntrospect from './useIntrospect';
import type {
  IntrospecterProps,
  ResourcesIntrospecterProps,
  SchemaAnalyzer,
} from './types';

const ResourcesIntrospecter = ({
  component: Component,
  schemaAnalyzer,
  includeDeprecated,
  resource,
  resources,
  loading,
  error,
  ...rest
}: ResourcesIntrospecterProps) => {
  if (loading) {
    return null;
  }

  if (error) {
    if (process.env.NODE_ENV === 'production') {
      // eslint-disable-next-line no-console
      console.error(error);
    }

    throw new Error('API schema is not readable');
  }

  const schema = resources.find((r) => r.name === resource);

  if (
    !schema ||
    !schema.fields ||
    !schema.readableFields ||
    !schema.writableFields
  ) {
    if (process.env.NODE_ENV === 'production') {
      // eslint-disable-next-line no-console
      console.error(`Resource ${resource} not present inside API description`);
    }

    throw new Error(`Resource ${resource} not present inside API description`);
  }

  const fields = includeDeprecated
    ? schema.fields
    : schema.fields.filter(({ deprecated }) => !deprecated);
  const readableFields = includeDeprecated
    ? schema.readableFields
    : schema.readableFields.filter(({ deprecated }) => !deprecated);
  const writableFields = includeDeprecated
    ? schema.writableFields
    : schema.writableFields.filter(({ deprecated }) => !deprecated);

  return (
    <Component
      schemaAnalyzer={schemaAnalyzer}
      resource={resource}
      schema={schema}
      fields={fields}
      readableFields={readableFields}
      writableFields={writableFields}
      {...rest}
    />
  );
};

const Introspecter = ({
  component,
  includeDeprecated = false,
  resource,
  ...rest
}: IntrospecterProps) => {
  const logoutIfAccessDenied = useLogoutIfAccessDenied();
  const schemaAnalyzer = useContext<SchemaAnalyzer | null>(
    SchemaAnalyzerContext,
  );
  const schemaAnalyzerProxy = useMemo(() => {
    if (!schemaAnalyzer) {
      return null;
    }
    return new Proxy(schemaAnalyzer, {
      get: (target, key: keyof SchemaAnalyzer) => {
        if (typeof target[key] !== 'function') {
          return target[key];
        }

        return (...args: never[]) => {
          // eslint-disable-next-line prefer-spread,@typescript-eslint/ban-types
          const result = (target[key] as Function).apply(target, args);

          if (result && typeof result.then === 'function') {
            return result.catch((e: Error) => {
              logoutIfAccessDenied(e).then((loggedOut) => {
                if (loggedOut) {
                  return;
                }

                throw e;
              });
            });
          }

          return result;
        };
      },
    });
  }, [schemaAnalyzer, logoutIfAccessDenied]);
  const { refetch, data, isLoading, isIdle, error } = useIntrospect();
  const resources = data ? data.data.resources : null;

  useEffect(() => {
    if (!error && !resources) {
      refetch();
    }
  }, [refetch, error, resources]);

  if (!schemaAnalyzerProxy) {
    return null;
  }

  return (
    <ResourcesIntrospecter
      component={component}
      schemaAnalyzer={schemaAnalyzerProxy}
      includeDeprecated={includeDeprecated}
      resource={resource}
      resources={resources ?? []}
      loading={isLoading || isIdle}
      error={error}
      {...rest}
    />
  );
};

Introspecter.propTypes = {
  component: PropTypes.elementType.isRequired,
  includeDeprecated: PropTypes.bool,
  resource: PropTypes.string,
};

export default Introspecter;
