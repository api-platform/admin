import React from 'react';
import {DateInput, TextInput, NumberInput, BooleanInput, ReferenceInput, SelectInput} from 'admin-on-rest';

export default (input) => {
  // To customize the input
  if (input.inputComponent) {
    return input.inputComponent;
  }

  let validate;
  if (input.validate) validate = input.validate;
  else if (input.required) validate = value => value ? undefined : 'Required';

  if (null !== input.reference) {
    return <ReferenceInput source={input.name} label={input.name}
                           reference={input.reference.name} validate={validate} key={input.name} allowEmpty>
      <SelectInput optionText="id"/>
    </ReferenceInput>
  }

  let InputType;
  let props = {};

  switch (input.range) {
    case 'http://www.w3.org/2001/XMLSchema#integer':
      InputType = NumberInput;
      break;

    case 'http://www.w3.org/2001/XMLSchema#decimal':
      InputType = NumberInput;
      props.step = '0.1';
      break;

    case 'http://www.w3.org/2001/XMLSchema#boolean':
      if (!input.validate && input.required) validate = undefined;
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

  return <InputType source={input.name} validate={validate} key={input.name} {...props}/>;
}
