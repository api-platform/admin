import React from 'react';
import PropTypes from 'prop-types';
import {
  ArrayField,
  BooleanField,
  ChipField,
  DateField,
  EmailField,
  NumberField,
  ReferenceArrayField,
  ReferenceField,
  SimpleList,
  SingleFieldList,
  TextField,
  UrlField,
  useResourceContext,
} from 'react-admin';
import type {
  ArrayFieldProps,
  BooleanFieldProps,
  DateFieldProps,
  EmailFieldProps,
  NumberFieldProps,
  ReferenceArrayFieldProps,
  ReferenceFieldProps,
  TextFieldProps,
  UrlFieldProps,
} from 'react-admin';
import type { Field, Resource } from '@api-platform/api-doc-parser';

import Introspecter from './Introspecter.js';
import type {
  FieldGuesserProps,
  FieldProps,
  IntrospectedFieldGuesserProps,
  SchemaAnalyzer,
} from './types.js';

const isFieldSortable = (field: Field, schema: Resource) =>
  !!schema.parameters &&
  schema.parameters.filter((parameter) => parameter.variable === field.name)
    .length > 0 &&
  schema.parameters.filter(
    (parameter) => parameter.variable === `order[${field.name}]`,
  ).length > 0;

const renderField = (
  field: Field,
  schemaAnalyzer: SchemaAnalyzer,
  props: FieldProps,
) => {
  if (field.reference !== null && typeof field.reference === 'object') {
    if (field.maxCardinality === 1) {
      return (
        <ReferenceField
          {...(props as ReferenceFieldProps)}
          reference={field.reference.name}>
          <ChipField
            source={schemaAnalyzer.getFieldNameFromSchema(field.reference)}
          />
        </ReferenceField>
      );
    }

    const fieldName = schemaAnalyzer.getFieldNameFromSchema(field.reference);
    return (
      <ReferenceArrayField
        {...(props as ReferenceArrayFieldProps)}
        reference={field.reference.name}>
        <SingleFieldList>
          <ChipField source={fieldName} key={fieldName} />
        </SingleFieldList>
      </ReferenceArrayField>
    );
  }

  if (field.embedded !== null && field.maxCardinality !== 1) {
    return (
      <ArrayField {...(props as ArrayFieldProps)}>
        <SimpleList
          primaryText={(record) => JSON.stringify(record)}
          linkType={false}
          // Workaround for forcing the list to display underlying data.
          total={2}
        />
      </ArrayField>
    );
  }

  const fieldType = schemaAnalyzer.getFieldType(field);

  switch (fieldType) {
    case 'email':
      return <EmailField {...(props as EmailFieldProps)} />;

    case 'url':
      return <UrlField {...(props as UrlFieldProps)} />;

    case 'integer':
    case 'integer_id':
    case 'float':
      return <NumberField {...(props as NumberFieldProps)} />;

    case 'boolean':
      return <BooleanField {...(props as BooleanFieldProps)} />;

    case 'date':
    case 'dateTime':
      return <DateField {...(props as DateFieldProps)} />;

    default:
      return <TextField {...(props as TextFieldProps)} />;
  }
};

export const IntrospectedFieldGuesser = ({
  fields,
  readableFields,
  writableFields,
  schema,
  schemaAnalyzer,
  ...props
}: IntrospectedFieldGuesserProps) => {
  const field = fields.find((f) => f.name === props.source);

  if (!field) {
    // eslint-disable-next-line no-console
    console.error(
      `Field "${props.source}" not present inside API description for the resource "${props.resource}"`,
    );

    return null;
  }

  return renderField(field, schemaAnalyzer, {
    sortable: isFieldSortable(field, schema),
    ...props,
  });
};

const FieldGuesser = (props: FieldGuesserProps) => {
  const resource = useResourceContext(props);

  return (
    <Introspecter
      component={IntrospectedFieldGuesser}
      resource={resource}
      includeDeprecated
      {...props}
    />
  );
};

FieldGuesser.propTypes = {
  source: PropTypes.string.isRequired,
  resource: PropTypes.string,
  sortable: PropTypes.bool,
  sortBy: PropTypes.string,
};

export default FieldGuesser;
