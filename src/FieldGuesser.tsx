import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import {
  ArrayField,
  ArrayFieldProps,
  BooleanField,
  BooleanFieldProps,
  ChipField,
  DateField,
  DateFieldProps,
  EmailField,
  EmailFieldProps,
  NumberField,
  NumberFieldProps,
  ReferenceField,
  ReferenceFieldProps,
  ReferenceArrayField,
  ReferenceArrayFieldProps,
  SimpleList,
  SingleFieldList,
  TextField,
  TextFieldProps,
  UrlField,
  UrlFieldProps,
  useCheckMinimumRequiredProps,
} from 'react-admin';
import { Field, Resource } from '@api-platform/api-doc-parser';
import Introspecter, { BaseIntrospecterProps } from './Introspecter';
import { IntrospectedGuesserProps, SchemaAnalyzer } from './types';

type FieldProps =
  | TextFieldProps
  | DateFieldProps
  | BooleanFieldProps
  | NumberFieldProps
  | UrlFieldProps
  | EmailFieldProps
  | ArrayFieldProps
  | ReferenceArrayFieldProps
  | ReferenceFieldProps;

type IntrospectedFieldGuesserProps = FieldProps & IntrospectedGuesserProps;

export type FieldGuesserProps = Omit<
  FieldProps & BaseIntrospecterProps,
  'component' | 'resource'
> &
  Partial<Pick<BaseIntrospecterProps, 'resource'>>;

const isFieldSortable = (field: Field, schema: Resource) => {
  return (
    !!schema.parameters &&
    schema.parameters.filter((parameter) => parameter.variable === field.name)
      .length > 0 &&
    schema.parameters.filter(
      (parameter) => parameter.variable === `order[${field.name}]`,
    ).length > 0
  );
};

const renderField = (
  field: Field,
  schemaAnalyzer: SchemaAnalyzer,
  props: FieldProps,
) => {
  if (null !== field.reference && typeof field.reference === 'object') {
    if (1 === field.maxCardinality) {
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

  if (null !== field.embedded && 1 !== field.maxCardinality) {
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
    console.error(
      `Field "${props.source}" not present inside API description for the resource "${props.resource}"`,
    );

    return <Fragment />;
  }

  return renderField(field, schemaAnalyzer, {
    sortable: isFieldSortable(field, schema),
    ...props,
  });
};

const FieldGuesser = (props: FieldGuesserProps) => {
  useCheckMinimumRequiredProps('FieldGuesser', ['resource'], props);
  if (!props.resource) {
    return null;
  }

  return (
    <Introspecter
      component={IntrospectedFieldGuesser}
      resource={props.resource}
      includeDeprecated={true}
      {...props}
    />
  );
};

FieldGuesser.propTypes = {
  source: PropTypes.string.isRequired,
  addLabel: PropTypes.bool,
  resource: PropTypes.string,
  sortable: PropTypes.bool,
  sortBy: PropTypes.string,
};

export default FieldGuesser;
