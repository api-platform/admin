import React, { Children, Fragment } from 'react';
import type { ReactElement, ReactNode } from 'react';
import type {
  CustomRoutesProps,
  RenderResourcesFunction,
  ResourceProps,
} from 'react-admin';

type RaComponent = {
  raName?: string;
};

// From https://github.com/marmelab/react-admin/blob/next/packages/ra-core/src/core/useConfigureAdminRouterFromChildren.tsx

export const getSingleChildFunction = (
  children: ReactNode | RenderResourcesFunction,
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

/**
 * Inspect the children and return an object with the following keys:
 * - customRoutes: an array of the custom routes
 * - resources: an array of resources elements
 */
const getRoutesAndResourcesFromNodes = (children: ReactNode) => {
  const customRoutes: ReactElement<CustomRoutesProps>[] = [];
  const resources: ReactElement<ResourceProps>[] = [];
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
