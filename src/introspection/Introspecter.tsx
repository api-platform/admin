import React, { useContext, useEffect, useMemo } from 'react';
import { useLogoutIfAccessDenied } from 'react-admin';

import SchemaAnalyzerContext from './SchemaAnalyzerContext.js';
import useIntrospect from './useIntrospect.js';
import type { IntrospecterProps, SchemaAnalyzer } from '../types.js';
import ResourcesIntrospecter from './ResourcesIntrospecter.js';

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

  const { refetch, data, isPending, error } = useIntrospect();
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
      {...rest}
      component={component}
      schemaAnalyzer={schemaAnalyzerProxy}
      includeDeprecated={includeDeprecated}
      resource={resource}
      resources={resources ?? []}
      loading={isPending}
      error={error}
    />
  );
};

export default Introspecter;
