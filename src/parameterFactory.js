import {
  DateInput,
  NullableBooleanInput,
  NumberInput,
  TextInput,
} from 'react-admin';
import React from 'react';

function guessType(parameter, fields) {
  if (parameter.variable.match(/.*\[between\]/i) !== null) {
    return 'between';
  }

  return guessTypeFromRange(parameter.range);
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
      return 'text';
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
