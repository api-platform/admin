import React from 'react';
import {
  ArrayInput,
  BooleanInput,
  DateInput,
  NumberInput,
  ReferenceArrayInput,
  ReferenceInput,
  required,
  SelectArrayInput,
  SelectInput,
  SimpleFormIterator,
  TextInput,
  Query,
} from 'react-admin';

import getReferenceNameField from './getReferenceNameField';

const InputGuesser = props => (
  <Query type="INTROSPECT" resource={props.ressource}>
    {({data, loading, error}) => {
      if (loading) {
        return <div>LOADING</div>;
      }

      if (error) {
        console.error(error);

        return <div>ERROR</div>;
      }

      const resourceSchema = data.resources.find(
        r => r.name === props.resource,
      );

      if (
        !resourceSchema ||
        !resourceSchema.fields ||
        !resourceSchema.fields.length
      ) {
        throw new Error(
          `Resource ${props.resource} not present inside api description`,
        );
      }

      const field = resourceSchema.fields.find(
        ({name}) => name === props.source,
      );
      if (!field) {
        throw new Error(
          `Field ${props.source} not present inside the api description for the resource ${props.resource}`,
        );
      }

      const validate =
        !props.validate && field.required ? [required()] : props.validate;

      if (null !== field.reference) {
        if (1 === field.maxCardinality) {
          return (
            <ReferenceInput
              key={field.name}
              label={field.name}
              reference={field.reference.name}
              source={field.name}
              validate={validate}
              {...field.inputProps}
              {...props}
              allowEmpty>
              <SelectInput
                optionText={getReferenceNameField(field.reference)}
              />
            </ReferenceInput>
          );
        }

        return (
          <ReferenceArrayInput
            key={field.name}
            label={field.name}
            reference={field.reference.name}
            source={field.name}
            validate={validate}
            {...field.inputProps}
            {...props}
            allowEmpty>
            <SelectArrayInput
              optionText={getReferenceNameField(field.reference)}
            />
          </ReferenceArrayInput>
        );
      }

      if ('http://schema.org/identifier' === field.id) {
        const prefix = `/${props.resource}/`;

        props.format = value => {
          return 0 === value.indexOf(prefix)
            ? value.substr(prefix.length)
            : value;
        };

        props.parse = value => {
          return -1 !== value.indexOf(prefix) ? prefix + value : value;
        };
      }

      switch (field.range) {
        case 'http://www.w3.org/2001/XMLSchema#array':
          return (
            <ArrayInput
              key={field.name}
              source={field.name}
              validate={validate}
              {...field.inputProps}
              {...props}>
              <SimpleFormIterator>
                <TextInput />
              </SimpleFormIterator>
            </ArrayInput>
          );

        case 'http://www.w3.org/2001/XMLSchema#integer':
          return (
            <NumberInput
              key={field.name}
              source={field.name}
              validate={validate}
              {...field.inputProps}
              {...props}
            />
          );

        case 'http://www.w3.org/2001/XMLSchema#decimal':
          return (
            <NumberInput
              key={field.name}
              source={field.name}
              step="0.1"
              validate={validate}
              {...field.inputProps}
              {...props}
            />
          );

        case 'http://www.w3.org/2001/XMLSchema#boolean':
          return (
            <BooleanInput
              key={field.name}
              source={field.name}
              validate={validate}
              {...field.inputProps}
              {...props}
            />
          );

        case 'http://www.w3.org/2001/XMLSchema#date':
        case 'http://www.w3.org/2001/XMLSchema#dateTime':
          return (
            <DateInput
              key={field.name}
              source={field.name}
              validate={validate}
              {...field.inputProps}
              {...props}
            />
          );

        default:
          return (
            <TextInput
              key={field.name}
              source={field.name}
              validate={validate}
              {...field.inputProps}
              {...props}
            />
          );
      }
    }}
  </Query>
);

export default InputGuesser;
