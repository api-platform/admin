import React from 'react';
import PropTypes from 'prop-types';
import {
  Show,
  ShowProps,
  SimpleFormProps,
  SimpleShowLayout,
  useCheckMinimumRequiredProps,
} from 'react-admin';
import { Field, Resource } from '@api-platform/api-doc-parser';
import FieldGuesser from './FieldGuesser';
import Introspecter, { BaseIntrospecterProps } from './Introspecter';
import useMercureSubscription from './useMercureSubscription';
import { IntrospectedGuesserProps } from './types';

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
  console.info(code);
};

type ShowSimpleFormProps = ShowProps & Omit<SimpleFormProps, 'children'>;

type IntrospectedShowGuesserProps = ShowSimpleFormProps &
  IntrospectedGuesserProps;

export type ShowGuesserProps = Omit<
  ShowSimpleFormProps & BaseIntrospecterProps,
  'component' | 'resource'
>;

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
      <FieldGuesser key={field.name} source={field.name} addLabel={true} />
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
  if (!props.resource) {
    return null;
  }

  return (
    <Introspecter
      component={IntrospectedShowGuesser}
      resource={props.resource}
      {...props}
    />
  );
};

ShowGuesser.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  resource: PropTypes.string.isRequired,
};

export default ShowGuesser;
