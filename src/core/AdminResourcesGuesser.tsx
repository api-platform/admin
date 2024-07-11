import React from 'react';
import { AdminUI, Loading } from 'react-admin';
import type { ComponentType } from 'react';
import type { AdminProps } from 'react-admin';
import type { Resource } from '@api-platform/api-doc-parser';

import ResourceGuesser from './ResourceGuesser.js';

import getRoutesAndResourcesFromNodes, {
  isSingleChildFunction,
} from '../introspection/getRoutesAndResourcesFromNodes.js';
import useDisplayOverrideCode from '../useDisplayOverrideCode.js';
import type { ApiPlatformAdminDataProvider, SchemaAnalyzer } from '../types.js';

export interface AdminGuesserProps extends AdminProps {
  admin?: ComponentType<AdminProps>;
  dataProvider: ApiPlatformAdminDataProvider;
  schemaAnalyzer: SchemaAnalyzer;
  includeDeprecated?: boolean;
}

interface AdminResourcesGuesserProps extends Omit<AdminProps, 'loading'> {
  admin?: ComponentType<AdminProps>;
  includeDeprecated: boolean;
  loading: boolean;
  loadingPage?: ComponentType;
  resources: Resource[];
}

const getOverrideCode = (resources: Resource[]) => {
  let code =
    'If you want to override at least one resource, paste this content in the <AdminGuesser> component of your app:\n\n';

  resources.forEach((r) => {
    code += `<ResourceGuesser name="${r.name}" />\n`;
  });

  return code;
};

/**
 * AdminResourcesGuesser automatically renders an `<AdminUI>` component
 * for resources exposed by a web API documented with Hydra, OpenAPI
 * or any other format supported by `@api-platform/api-doc-parser`.
 *
 * If child components are passed (usually `<ResourceGuesser>` or `<Resource>`
 * components, but it can be any other React component), they are rendered in
 * the given order.
 * If no children are passed, a `<ResourceGuesser>` component is created for
 * each resource type exposed by the API, in the order they are specified in
 * the API documentation.
 */
export const AdminResourcesGuesser = ({
  // Admin props
  loadingPage: LoadingPage = Loading,
  admin: AdminEl = AdminUI,
  // Props
  children,
  includeDeprecated,
  resources,
  loading,
  ...rest
}: AdminResourcesGuesserProps) => {
  const displayOverrideCode = useDisplayOverrideCode();

  if (loading) {
    return <LoadingPage />;
  }

  let adminChildren = children;
  const { resources: resourceChildren, customRoutes } =
    getRoutesAndResourcesFromNodes(children);
  if (
    !isSingleChildFunction(adminChildren) &&
    resourceChildren.length === 0 &&
    resources
  ) {
    const guessedResources = includeDeprecated
      ? resources
      : resources.filter((r) => !r.deprecated);
    adminChildren = [
      ...customRoutes,
      ...guessedResources.map((r) => (
        <ResourceGuesser name={r.name} key={r.name} />
      )),
    ];
    displayOverrideCode(getOverrideCode(guessedResources));
  }

  return (
    <AdminEl loading={LoadingPage} {...rest}>
      {adminChildren}
    </AdminEl>
  );
};
