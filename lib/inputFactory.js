import _extends from 'babel-runtime/helpers/extends';
import React from 'react';
import { DateInput, TextInput, NumberInput, BooleanInput, ReferenceInput, SelectInput } from 'admin-on-rest';

export default (function (input) {
  // To customize the input
  if (input.inputComponent) {
    return input.inputComponent;
  }

  var props = _extends({}, input.inputProps);
  if (!props.validate) props.validate = function (value) {
    return value ? undefined : 'Required';
  };

  if (null !== input.reference) {
    return React.createElement(
      ReferenceInput,
      _extends({
        source: input.name,
        label: input.name,
        reference: input.reference.name,
        key: input.name,
        allowEmpty: true
      }, props),
      React.createElement(SelectInput, { optionText: 'id' })
    );
  }

  var InputType = void 0;
  switch (input.range) {
    case 'http://www.w3.org/2001/XMLSchema#integer':
      InputType = NumberInput;
      break;

    case 'http://www.w3.org/2001/XMLSchema#decimal':
      InputType = NumberInput;
      props.step = '0.1';
      break;

    case 'http://www.w3.org/2001/XMLSchema#boolean':
      if ((!input.inputProps || !input.inputProps.validate) && input.required) props.validate = undefined;
      InputType = BooleanInput;
      break;

    case 'http://www.w3.org/2001/XMLSchema#date':
    case 'http://www.w3.org/2001/XMLSchema#dateTime':
      InputType = DateInput;
      break;

    default:
      InputType = TextInput;
      break;
  }

  return React.createElement(InputType, _extends({ source: input.name, key: input.name }, props));
});