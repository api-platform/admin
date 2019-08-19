import {
  DateInput,
  NullableBooleanInput,
  NumberInput,
  TextInput,
} from 'react-admin';
import React from 'react';

function guessType(parameter, apiPlatform) {
  let type = guessTypeForApiPlatform(parameter, apiPlatform);

  return type !== undefined ? type : guessTypeFromRange(parameter.range);
}

function guessTypeForApiPlatform(parameter, apiPlatform = true) {
  if (apiPlatform) {
    // List filters are discarded because there is no built-in filter component in react-admin that can handle this case.
    if (parameter.variable.match(/.*\[\]/i)) return null;
    // Order filters are discaded because it is only used to know if a column should be sortable or not.
    if (parameter.variable.match(/^order\[.+\]$/)) return null;
    if (parameter.variable.match(/.*\[between\]/i) !== null) return 'between';
  }
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

export default (parameter, options) => {
  let type = guessType(parameter, options.apiPlatform);

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
