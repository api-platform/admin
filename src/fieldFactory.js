import {
  BooleanField,
  DateField,
  EmailField,
  NumberField,
  ReferenceField,
  TextField,
} from 'admin-on-rest';
import React from 'react';

export default (field, options) => {
  if (field.field) {
    return (
      <field.field key={field.name} options={options} source={field.name} />
    );
  }

  if (null !== field.reference) {
    return (
      <ReferenceField
        key={field.name}
        reference={field.reference.name}
        source={field.name}>
        <TextField source="id" />
      </ReferenceField>
    );
  }

  if ('http://schema.org/email' === field.id) {
    return <EmailField key={field.name} source={field.name} />;
  }

  switch (field.range) {
    case 'http://www.w3.org/2001/XMLSchema#integer':
    case 'http://www.w3.org/2001/XMLSchema#float':
      return <NumberField key={field.name} source={field.name} />;

    case 'http://www.w3.org/2001/XMLSchema#date':
    case 'http://www.w3.org/2001/XMLSchema#dateTime':
      return <DateField key={field.name} source={field.name} />;

    case 'http://www.w3.org/2001/XMLSchema#boolean':
      return <BooleanField key={field.name} source={field.name} />;

    default:
      return <TextField key={field.name} source={field.name} />;
  }
};
