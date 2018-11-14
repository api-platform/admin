import {
  DateInput,
  EmailInput,
  NullableBooleanInput,
  NumberInput,
  TextInput,
} from 'react-admin';
import React from 'react';

function guessType(parameter, fields) {
  if (parameter.variable.match(/.*\[exists\]/i) !== null) {
    return 'nullableBoolean';
  }

  if (
    parameter.variable.match(/.*\[after\]/i) !== null ||
    parameter.variable.match(/.*\[before\]/i) !== null ||
    parameter.variable.match(/.*\[strictly_after\]/i) !== null ||
    parameter.variable.match(/.*\[strictly_after\]/i) !== null
  ) {
    return 'date';
  }

  if (parameter.variable.match(/.*\[between\]/i) !== null) {
    return 'between';
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

      switch (field.range) {
        case 'http://www.w3.org/2001/XMLSchema#integer':
        case 'http://www.w3.org/2001/XMLSchema#float':
          return 'number';

        case 'http://www.w3.org/2001/XMLSchema#boolean':
          return 'nullableBoolean';

        default:
      }

      return 'text';
    });

  return type.length > 0 ? type[0] : 'text';
}

export default (parameter, fields, options) => {
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
