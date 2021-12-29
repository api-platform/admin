import React, { useContext, useEffect, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useDataProvider, useLogoutIfAccessDenied } from 'react-admin';
import { useSelector } from 'react-redux';
import SchemaAnalyzerContext from './SchemaAnalyzerContext';
import { ApiPlatformAdminDataProvider } from './types';

interface Resource {
  name: string;
  fields: any[];
  readableFields: any[];
  writableFields: any[];
}

interface ResourcesIntrospecterProps {
  component: React.ComponentType<any>;
  schemaAnalyzer: any;
  includeDeprecated: boolean;
  resource: string;
  resources: Resource[];
  loading: boolean;
  error: any;
}

type IntrospecterProps = Pick<
  ResourcesIntrospecterProps,
  'component' | 'includeDeprecated' | 'resource'
>;

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
    if ('production' === process.env.NODE_ENV) {
      console.error(error);
    }

    throw new Error('API schema is not readable');
  }

  if (resources == null) {
    return null;
  }

  const schema = resources.find((r) => r.name === resource);

  if (
    !schema ||
    !schema.fields ||
    !schema.readableFields ||
    !schema.writableFields
  ) {
    if ('production' === process.env.NODE_ENV) {
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
  const schemaAnalyzer = useContext<any>(SchemaAnalyzerContext);
  const schemaAnalyzerProxy = useMemo(
    () =>
      new Proxy(schemaAnalyzer, {
        get: (target, key) => {
          if (typeof target[key] !== 'function') {
            return target[key];
          }

          return (...args) => {
            // eslint-disable-next-line prefer-spread
            const result = target[key].apply(target, args);

            if (result && typeof result.then === 'function') {
              return result.catch((e) => {
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
      }),
    [schemaAnalyzer, logoutIfAccessDenied],
  );
  const { resources } = useSelector<any, any>((state) =>
    state.introspect['introspect'] ? state.introspect['introspect'].data : {},
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dataProvider: ApiPlatformAdminDataProvider = useDataProvider();

  useEffect(() => {
    if (resources) {
      setLoading(false);
      return;
    }

    dataProvider
      .introspect(resource, {}, { action: 'INTROSPECT' })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
  }, [dataProvider, resource, resources]);

  return (
    <ResourcesIntrospecter
      component={component}
      schemaAnalyzer={schemaAnalyzerProxy}
      includeDeprecated={includeDeprecated}
      resource={resource}
      resources={resources}
      loading={loading}
      error={error}
      {...rest}
    />
  );
};

Introspecter.propTypes = {
  component: PropTypes.elementType.isRequired,
  includeDeprecated: PropTypes.bool,
  resource: PropTypes.string.isRequired,
};

export default Introspecter;
