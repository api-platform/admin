import React from 'react';
import PropTypes from 'prop-types';
import {
  Show,
  SimpleShowLayout,
  Tab,
  TabbedShowLayout,
  useResourceContext,
} from 'react-admin';
import { useParams } from 'react-router-dom';
import type { Field, Resource } from '@api-platform/api-doc-parser';

import FieldGuesser from './FieldGuesser.js';
import Introspecter from './Introspecter.js';
import useMercureSubscription from './useMercureSubscription.js';
import useDisplayOverrideCode from './useDisplayOverrideCode.js';
import type {
  IntrospectedShowGuesserProps,
  ShowGuesserProps,
} from './types.js';

const getOverrideCode = (schema: Resource, fields: Field[]) => {
  let code =
    'If you want to override at least one field, paste this content in the <ShowGuesser> component of your resource:\n\n';

  code += `const ${schema.title}Show = props => (\n`;
  code += `    <ShowGuesser {...props}>\n`;

  fields.forEach((field) => {
    code += `        <FieldGuesser source={"${field.name}"} />\n`;
  });
  code += `    </ShowGuesser>\n`;
  code += `);\n`;
  code += `\n`;
  code += `And don't forget update your <ResourceGuesser> component:\n`;
  code += `<ResourceGuesser name={"${schema.name}"} show={${schema.title}Show} />`;

  return code;
};

export const IntrospectedShowGuesser = ({
  fields,
  readableFields,
  writableFields,
  schema,
  schemaAnalyzer,
  children,
  ...props
}: IntrospectedShowGuesserProps) => {
  const { id: routeId } = useParams<'id'>();
  const id = decodeURIComponent(routeId ?? '');
  useMercureSubscription(props.resource, id);

  const displayOverrideCode = useDisplayOverrideCode();

  let fieldChildren = children;
  if (!fieldChildren) {
    fieldChildren = readableFields.map((field) => (
      <FieldGuesser key={field.name} source={field.name} />
    ));
    displayOverrideCode(getOverrideCode(schema, readableFields));
  }

  const hasTab =
    Array.isArray(fieldChildren) &&
    fieldChildren.some(
      (child) =>
        typeof child === 'object' && 'type' in child && child.type === Tab,
    );
  const ShowLayout = hasTab ? TabbedShowLayout : SimpleShowLayout;

  return (
    <Show {...props}>
      <ShowLayout>{fieldChildren}</ShowLayout>
    </Show>
  );
};

const ShowGuesser = (props: ShowGuesserProps) => {
  const resource = useResourceContext(props);

  return (
    <Introspecter
      component={IntrospectedShowGuesser}
      resource={resource}
      {...props}
    />
  );
};

/* eslint-disable tree-shaking/no-side-effects-in-initialization */
ShowGuesser.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  resource: PropTypes.string,
};
/* eslint-enable tree-shaking/no-side-effects-in-initialization */

export default ShowGuesser;
