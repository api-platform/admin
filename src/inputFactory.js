import {
  BooleanInput,
  DateInput,
  NumberInput,
  ReferenceInput,
  SelectInput,
  TextInput,
} from 'admin-on-rest';
import React from 'react';

export default (field, options) => {
  if (field.input) {
    return (
      <field.input key={field.name} options={options} source={field.name} />
    );
  }

  if (null !== field.reference) {
    return (
      <ReferenceInput
        key={field.name}
        label={field.name}
        reference={field.reference.name}
        source={field.name}>
        <SelectInput optionText="id" />
      </ReferenceInput>
    );
  }

  switch (field.range) {
    case 'http://www.w3.org/2001/XMLSchema#integer':
      return <NumberInput key={field.name} source={field.name} />;

    case 'http://www.w3.org/2001/XMLSchema#decimal':
      return <NumberInput key={field.name} source={field.name} step="0.1" />;

    case 'http://www.w3.org/2001/XMLSchema#boolean':
      return <BooleanInput key={field.name} source={field.name} />;

    case 'http://www.w3.org/2001/XMLSchema#date':
    case 'http://www.w3.org/2001/XMLSchema#dateTime':
      return <DateInput key={field.name} source={field.name} />;

    default:
      return <TextInput key={field.name} source={field.name} />;
  }
};
