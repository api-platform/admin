import React, {Fragment} from 'react';
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

const isFieldSortable = (field, resourceSchema) => {
  return (
    resourceSchema.parameters.filter(
      parameter => parameter.variable === field.name,
    ).length > 0 &&
    resourceSchema.parameters.filter(
      parameter => parameter.variable === `order[${field.name}]`,
    ).length > 0
  );
};

const renderField = (field, resourceSchemaAnalyzer, props) => {
  if (null !== field.reference) {
    if (1 === field.maxCardinality) {
      return (
        <ReferenceField reference={field.reference.name} {...props} allowEmpty>
          <ChipField
            source={resourceSchemaAnalyzer.getReferenceNameField(
              field.reference,
            )}
          />
        </ReferenceField>
      );
    }

    const referenceNameField = resourceSchemaAnalyzer.getReferenceNameField(
      field.reference,
    );
    return (
      <ReferenceArrayField reference={field.reference.name} {...props}>
        <SingleFieldList>
          <ChipField source={referenceNameField} key={referenceNameField} />
        </SingleFieldList>
      </ReferenceArrayField>
    );
  }

  const fieldType = resourceSchemaAnalyzer.getFieldType(field);

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

export const FieldGuesserComponent = ({
  fields,
  resourceSchema,
  resourceSchemaAnalyzer,
  ...props
}) => {
  const field = fields.find(f => f.name === props.source);

  if (!field) {
    console.error(
      `Field "${props.source}" not present inside API description for the resource "${props.resource}"`,
    );

    return <Fragment />;
  }

  return renderField(field, resourceSchemaAnalyzer, {
    sortable: isFieldSortable(field, resourceSchema),
    ...props,
  });
};

const FieldGuesser = props => (
  <Introspecter
    component={FieldGuesserComponent}
    includeDeprecated={true}
    {...props}
  />
);

FieldGuesser.propTypes = {
  source: PropTypes.string.isRequired,
};

export default FieldGuesser;
