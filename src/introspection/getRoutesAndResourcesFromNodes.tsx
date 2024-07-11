import React, { Children, Fragment } from 'react';
import type { ReactElement } from 'react';
import type {
  AdminChildren,
  CustomRoutesProps,
  RenderResourcesFunction,
  ResourceProps,
} from 'react-admin';

type RaComponent = {
  raName?: string;
};

// From https://github.com/marmelab/react-admin/blob/next/packages/ra-core/src/core/useConfigureAdminRouterFromChildren.tsx

export const getSingleChildFunction = (
  children: AdminChildren,
): RenderResourcesFunction | null => {
  const childrenArray = Array.isArray(children) ? children : [children];

  const functionChildren = childrenArray.filter(
    (child) => typeof child === 'function',
  );

  if (functionChildren.length > 1) {
    throw new Error('You can only provide one function child to AdminRouter');
  }

  if (functionChildren.length === 0) {
    return null;
  }

  return functionChildren[0] as RenderResourcesFunction;
};

export const isSingleChildFunction = (
  children: AdminChildren,
): children is RenderResourcesFunction => !!getSingleChildFunction(children);

/**
 * Inspect the children and return an object with the following keys:
 * - customRoutes: an array of the custom routes
 * - resources: an array of resources elements
 */
const getRoutesAndResourcesFromNodes = (children: AdminChildren) => {
  const customRoutes: ReactElement<CustomRoutesProps>[] = [];
  const resources: ReactElement<ResourceProps>[] = [];

  if (isSingleChildFunction(children)) {
    return {
      customRoutes,
      resources,
    };
  }

  // @ts-expect-error for some reason, typescript doesn't narrow down the type after calling the isSingleChildFunction type guard
  Children.forEach(children, (element) => {
    if (!React.isValidElement(element)) {
      // Ignore non-elements. This allows people to more easily inline
      // conditionals in their route config.
      return;
    }
    if (element.type === Fragment) {
      const customRoutesFromFragment = getRoutesAndResourcesFromNodes(
        element.props.children,
      );
      customRoutes.push(...customRoutesFromFragment.customRoutes);
      resources.push(...customRoutesFromFragment.resources);
    }

    if ((element.type as RaComponent).raName === 'CustomRoutes') {
      const customRoutesElement = element as ReactElement<CustomRoutesProps>;

      customRoutes.push(customRoutesElement);
    } else if ((element.type as RaComponent).raName === 'Resource') {
      resources.push(element as ReactElement<ResourceProps>);
    }
  });

  return {
    customRoutes,
    resources,
  };
};

export default getRoutesAndResourcesFromNodes;
