import React from 'react';
import {
  DateInput,
  TextInput,
  NumberInput,
  BooleanInput,
  ReferenceInput,
  SelectInput,
} from 'admin-on-rest';

export default input => {
  // To customize the input
  if (input.inputComponent) {
    return input.inputComponent;
  }

  let props = {...input.inputProps};
  if (!props.validate)
    props.validate = value => (value ? undefined : 'Required');

  if (null !== input.reference) {
    return (
      <ReferenceInput
        source={input.name}
        label={input.name}
        reference={input.reference.name}
        key={input.name}
        allowEmpty
        {...props}>
        <SelectInput optionText="id" />
      </ReferenceInput>
    );
  }

  let InputType;
  switch (input.range) {
    case 'http://www.w3.org/2001/XMLSchema#integer':
      InputType = NumberInput;
      break;

    case 'http://www.w3.org/2001/XMLSchema#decimal':
      InputType = NumberInput;
      props.step = '0.1';
      break;

    case 'http://www.w3.org/2001/XMLSchema#boolean':
      if ((!input.inputProps || !input.inputProps.validate) && input.required)
        props.validate = undefined;
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

  return <InputType source={input.name} key={input.name} {...props} />;
};
