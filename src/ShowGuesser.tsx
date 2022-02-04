import React from 'react';
import PropTypes from 'prop-types';
import {
  Show,
  SimpleShowLayout,
  useCheckMinimumRequiredProps,
} from 'react-admin';
import type { Field, Resource } from '@api-platform/api-doc-parser';
import FieldGuesser from './FieldGuesser';
import Introspecter from './Introspecter';
import useMercureSubscription from './useMercureSubscription';
import type { IntrospectedShowGuesserProps, ShowGuesserProps } from './types';

const displayOverrideCode = (schema: Resource, fields: Field[]) => {
  if (process.env.NODE_ENV === 'production') return;

  let code =
    'If you want to override at least one field, paste this content in the <ShowGuesser> component of your resource:\n\n';

  code += `const ${schema.title}Show = props => (\n`;
  code += `    <ShowGuesser {...props}>\n`;

  fields.forEach((field) => {
    code += `        <FieldGuesser source={"${field.name}"} addLabel={true} />\n`;
  });
  code += `    </ShowGuesser>\n`;
  code += `);\n`;
  code += `\n`;
  code += `And don't forget update your <ResourceGuesser> component:\n`;
  code += `<ResourceGuesser name={"${schema.name}"} show={${schema.title}Show} />`;
  // eslint-disable-next-line no-console
  console.info(code);
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
  let fieldChildren = children;
  if (!fieldChildren) {
    fieldChildren = readableFields.map((field) => (
      <FieldGuesser key={field.name} source={field.name} addLabel />
    ));
    displayOverrideCode(schema, readableFields);
  }

  useMercureSubscription(props.resource, props.id);

  return (
    <Show {...props}>
      <SimpleShowLayout>{fieldChildren}</SimpleShowLayout>
    </Show>
  );
};

const ShowGuesser = (props: ShowGuesserProps) => {
  useCheckMinimumRequiredProps('ShowGuesser', ['resource'], props);
  const { resource, ...rest } = props;
  if (!resource) {
    return null;
  }

  return (
    <Introspecter
      component={IntrospectedShowGuesser}
      resource={resource}
      {...rest}
    />
  );
};

/* eslint-disable tree-shaking/no-side-effects-in-initialization */
ShowGuesser.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  resource: PropTypes.string.isRequired,
};
/* eslint-enable tree-shaking/no-side-effects-in-initialization */

export default ShowGuesser;
