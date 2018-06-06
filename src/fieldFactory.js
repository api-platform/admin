import {
  BooleanField,
  ChipField,
  DateField,
  EmailField,
  NumberField,
  ReferenceField,
  ReferenceArrayField,
  SingleFieldList,
  TextField,
  UrlField,
} from 'react-admin';
import React from 'react';
import getReferenceNameField from './getReferenceNameField';

export default (field, options) => {
  const props = {...field.fieldProps};
  if (field.field) {
    return (
      <field.field
        key={field.name}
        options={options}
        source={field.name}
        {...props}
      />
    );
  }

  if (null !== field.reference) {
    if (1 === field.maxCardinality) {
      return (
        <ReferenceField
          source={field.name}
          reference={field.reference.name}
          key={field.name}
          {...props}
          allowEmpty>
          <ChipField source={getReferenceNameField(field.reference)} />
        </ReferenceField>
      );
    }

    const referenceNameField = getReferenceNameField(field.reference);
    return (
      <ReferenceArrayField
        source={field.name}
        reference={field.reference.name}
        key={field.name}
        {...props}>
        <SingleFieldList>
          <ChipField source={referenceNameField} key={referenceNameField} />
        </SingleFieldList>
      </ReferenceArrayField>
    );
  }

  switch (field.id) {
    case 'http://schema.org/email':
      return <EmailField key={field.name} source={field.name} {...props} />;

    case 'http://schema.org/url':
      return <UrlField key={field.name} source={field.name} {...props} />;

    default:
    // Do nothing
  }

  switch (field.range) {
    case 'http://www.w3.org/2001/XMLSchema#integer':
    case 'http://www.w3.org/2001/XMLSchema#float':
      return <NumberField key={field.name} source={field.name} {...props} />;

    case 'http://www.w3.org/2001/XMLSchema#date':
    case 'http://www.w3.org/2001/XMLSchema#dateTime':
      return <DateField key={field.name} source={field.name} {...props} />;

    case 'http://www.w3.org/2001/XMLSchema#boolean':
      return <BooleanField key={field.name} source={field.name} {...props} />;

    default:
      return <TextField key={field.name} source={field.name} {...props} />;
  }
};
