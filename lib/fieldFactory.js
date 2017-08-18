import _extends from 'babel-runtime/helpers/extends';
import React from 'react';
import { ReferenceField, TextField, EmailField, DateField, NumberField, BooleanField } from 'admin-on-rest';

var getFieldFromId = function getFieldFromId(id) {
  if ('http://schema.org/email' === id) {
    return EmailField;
  }

  return null;
};

var getFieldFromRange = function getFieldFromRange(range) {
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

export default (function (field) {
  // To customize the field
  if (field.fieldComponent) {
    return field.fieldComponent;
  }

  if (null !== field.reference) {
    return React.createElement(
      ReferenceField,
      _extends({
        source: field.name,
        reference: field.reference.name,
        key: field.name
      }, field.fieldProps),
      React.createElement(TextField, { source: 'id' })
    );
  }

  var FieldType = void 0;

  FieldType = getFieldFromId(field.id);
  if (null === FieldType) FieldType = getFieldFromRange(field.range);

  return React.createElement(FieldType, _extends({ source: field.name, key: field.name }, field.fieldProps));
});