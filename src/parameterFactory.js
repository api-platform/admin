import {
  DateInput,
  EmailInput,
  NullableBooleanInput,
  NumberInput,
  TextInput,
} from 'react-admin';
import React from 'react';

function guessType(parameter, fields) {
  if (parameter.variable.match(/.*\[between\]/i) !== null) {
    return 'between';
  }

  const type = guessTypeFromRange(parameter.range);
  if (type) {
    return type;
  }

  return guessTypeFromResource(parameter, fields);
}

function guessTypeFromResource(parameter, fields) {
  const type = fields
    .filter(field => {
      return field['name'] === parameter.variable;
    })
    .map(field => {
      switch (field.id) {
        case 'http://schema.org/email':
          return 'email';
        default:
      }

      const type = guessTypeFromRange(field.range);
      return type ? type : 'text';
    });

  return type.length > 0 ? type[0] : 'text';
}

function guessTypeFromRange(range) {
  switch (range) {
    case 'http://www.w3.org/2001/XMLSchema#integer':
    case 'http://www.w3.org/2001/XMLSchema#float':
      return 'number';
    case 'http://www.w3.org/2001/XMLSchema#boolean':
      return 'nullableBoolean';
    case 'http://www.w3.org/2001/XMLSchema#dateTime':
      return 'date';
    default:
      return;
  }
}

export default (parameter, fields, options) => {
  if (
    // List filters are discarded because there is no built-in filter component in react-admin that can handle this case.
    parameter.variable.match(/.*\[\]/i) ||
    // Order filters are discaded because it is only used to know if a column should be sortable or not.
    parameter.variable.match(/^order\[.+\]$/)
  ) {
    return null;
  }

  let type = guessType(parameter, fields);

  switch (type) {
    case 'date':
      return (
        <DateInput
          key={parameter.variable}
          source={parameter.variable}
          {...options}
        />
      );

    case 'nullableBoolean':
      return (
        <NullableBooleanInput
          key={parameter.variable}
          source={parameter.variable}
          {...options}
        />
      );

    // TODO : create a dedicated Input
    case 'between':
      return null;

    case 'email':
      return (
        <EmailInput
          key={parameter.variable}
          source={parameter.variable}
          {...options}
        />
      );

    case 'number':
      return (
        <NumberInput
          key={parameter.variable}
          source={parameter.variable}
          {...options}
        />
      );

    case 'text':
      return (
        <TextInput
          key={parameter.variable}
          source={parameter.variable}
          {...options}
        />
      );

    default:
  }
};
