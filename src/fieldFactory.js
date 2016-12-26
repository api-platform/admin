import React from 'react';
import {ReferenceField, TextField, EmailField, DateField, NumberField, BooleanField} from 'admin-on-rest/lib/mui';

const getFieldFromId = (id) => {
  if ('http://schema.org/email' === id) {
    return EmailField;
  }

  return null;
};

const getFieldFromRange = (range) => {
  switch (range) {
    case 'http://www.w3.org/2001/XMLSchema#integer':
    case 'http://www.w3.org/2001/XMLSchema#float':
      return NumberField;

    case 'http://www.w3.org/2001/XMLSchema#date':
    case 'http://www.w3.org/2001/XMLSchema#dateTime':
      return DateField;

    case 'http://www.w3.org/2001/XMLSchema#boolean':
      return BooleanField;

    default:
      return TextField;
  }
};

export default (field) => {
  // To customize the field
  if (field.fieldComponent) {
    return field.fieldComponent;
  }

  if (null !== field.reference) {
    return <ReferenceField source={field.name}
                           reference={field.reference.name} key={field.name}>
      <TextField source="id"/>
    </ReferenceField>
  }

  let FieldType;
  FieldType = getFieldFromId(field.id);
  if (null === FieldType) {
    FieldType = getFieldFromRange(field.range);
  }

  return <FieldType  source={field.name} key={field.name}/>;
}
