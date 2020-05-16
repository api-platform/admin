import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import {
  BooleanField,
  ChipField,
  DateField,
  EmailField,
  NumberField,
  ReferenceField,
  ReferenceArrayField,
  SingleFieldList,
  TextField,
  UrlField,
} from 'react-admin';
import Introspecter from './Introspecter';

const isFieldSortable = (field, schema) => {
  return (
    schema.parameters.filter((parameter) => parameter.variable === field.name)
      .length > 0 &&
    schema.parameters.filter(
      (parameter) => parameter.variable === `order[${field.name}]`,
    ).length > 0
  );
};

const renderReferenceArrayField = (referenceField, schemaAnalyzer, props) => {
  const fieldName = schemaAnalyzer.getFieldNameFromSchema(referenceField);

  return (
    <ReferenceArrayField reference={referenceField.name} {...props}>
      <SingleFieldList>
        <ChipField source={fieldName} key={fieldName} />
      </SingleFieldList>
    </ReferenceArrayField>
  );
};

const renderField = (field, schemaAnalyzer, props) => {
  if (null !== field.reference) {
    if (1 === field.maxCardinality) {
      return (
        <ReferenceField reference={field.reference.name} {...props} allowEmpty>
          <ChipField
            source={schemaAnalyzer.getFieldNameFromSchema(field.reference)}
          />
        </ReferenceField>
      );
    }

    return renderReferenceArrayField(field.reference, schemaAnalyzer, props);
  }

  if (null !== field.embedded && 1 !== field.maxCardinality) {
    return renderReferenceArrayField(field.embedded, schemaAnalyzer, props);
  }

  const fieldType = schemaAnalyzer.getFieldType(field);

  switch (fieldType) {
    case 'email':
      return <EmailField {...props} />;

    case 'url':
      return <UrlField {...props} />;

    case 'integer':
    case 'float':
      return <NumberField {...props} />;

    case 'boolean':
      return <BooleanField {...props} />;

    case 'date':
    case 'dateTime':
      return <DateField {...props} />;

    default:
      return <TextField {...props} />;
  }
};

export const IntrospectedFieldGuesser = ({
  fields,
  readableFields,
  writableFields,
  schema,
  schemaAnalyzer,
  ...props
}) => {
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

const FieldGuesser = (props) => (
  <Introspecter
    component={IntrospectedFieldGuesser}
    includeDeprecated={true}
    {...props}
  />
);

FieldGuesser.propTypes = {
  source: PropTypes.string.isRequired,
};

export default FieldGuesser;
