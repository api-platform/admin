import React, {
  ComponentType,
  useContext,
  useEffect,
  useState,
  useMemo,
} from 'react';
import PropTypes from 'prop-types';
import { useDataProvider, useLogoutIfAccessDenied } from 'react-admin';
import { useSelector } from 'react-redux';
import { Resource } from '@api-platform/api-doc-parser';
import SchemaAnalyzerContext from './SchemaAnalyzerContext';
import {
  ApiPlatformAdminDataProvider,
  ApiPlatformAdminState,
  IntrospectedGuesserProps,
  SchemaAnalyzer,
} from './types';
import { CreateGuesserProps } from './CreateGuesser';
import { EditGuesserProps } from './EditGuesser';
import { FieldGuesserProps } from './FieldGuesser';
import { FilterGuesserProps } from './FilterGuesser';
import { InputGuesserProps } from './InputGuesser';
import { ListGuesserProps } from './ListGuesser';
import { ShowGuesserProps } from './ShowGuesser';

interface ResourcesIntrospecterProps {
  component: ComponentType<IntrospectedGuesserProps>;
  schemaAnalyzer: SchemaAnalyzer;
  includeDeprecated: boolean;
  resource: string;
  resources: Resource[];
  loading: boolean;
  error: Error | null;
}

export type BaseIntrospecterProps = Pick<
  ResourcesIntrospecterProps,
  'component' | 'resource'
> &
  Partial<Pick<ResourcesIntrospecterProps, 'includeDeprecated'>>;

type IntrospecterProps = (
  | CreateGuesserProps
  | EditGuesserProps
  | FieldGuesserProps
  | FilterGuesserProps
  | InputGuesserProps
  | ListGuesserProps
  | ShowGuesserProps
) &
  BaseIntrospecterProps;

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
  const { resources } = useSelector((state: ApiPlatformAdminState) =>
    state.introspect['introspect']
      ? state.introspect['introspect'].data
      : { resources: null },
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const dataProvider = useDataProvider<ApiPlatformAdminDataProvider>();

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

  if (!schemaAnalyzerProxy) {
    return null;
  }

  return (
    <ResourcesIntrospecter
      component={component}
      schemaAnalyzer={schemaAnalyzerProxy}
      includeDeprecated={includeDeprecated}
      resource={resource}
      resources={resources || []}
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
