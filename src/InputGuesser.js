import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import {
  ArrayInput,
  BooleanInput,
  DateInput,
  DateTimeInput,
  NumberInput,
  ReferenceArrayInput,
  ReferenceInput,
  required,
  SelectArrayInput,
  SelectInput,
  SimpleFormIterator,
  TextInput,
} from 'react-admin';
import Introspecter from './Introspecter';

export const IntrospectedInputGuesser = ({
  fields,
  schema,
  schemaAnalyzer,
  ...props
}) => {
  const field = fields.find(({ name }) => name === props.source);
  if (!field) {
    console.error(
      `Field ${props.source} not present inside API description for the resource ${props.resource}`,
    );

    return <Fragment />;
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
          {...props}
          allowEmpty>
          <SelectInput
            optionText={schemaAnalyzer.getReferenceNameField(field.reference)}
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
        {...props}
        allowEmpty>
        <SelectArrayInput
          optionText={schemaAnalyzer.getReferenceNameField(field.reference)}
        />
      </ReferenceArrayInput>
    );
  }

  const fieldType = schemaAnalyzer.getFieldType(field);

  if (fieldType === 'id') {
    const prefix = `/${props.resource}/`;

    props.format = value => {
      return value && 0 === value.indexOf(prefix)
        ? value.substr(prefix.length)
        : value;
    };

    props.parse = value => {
      return -1 !== value.indexOf(prefix) ? prefix + value : value;
    };
  }

  switch (fieldType) {
    case 'array':
      return (
        <ArrayInput
          key={field.name}
          source={field.name}
          validate={validate}
          {...props}>
          <SimpleFormIterator>
            <TextInput />
          </SimpleFormIterator>
        </ArrayInput>
      );

    case 'integer':
      return (
        <NumberInput
          key={field.name}
          source={field.name}
          validate={validate}
          {...props}
        />
      );

    case 'float':
      return (
        <NumberInput
          key={field.name}
          source={field.name}
          step="0.1"
          validate={validate}
          {...props}
        />
      );

    case 'boolean':
      return (
        <BooleanInput
          key={field.name}
          source={field.name}
          validate={validate}
          {...props}
        />
      );

    case 'date':
      return (
        <DateInput
          key={field.name}
          source={field.name}
          validate={validate}
          {...props}
        />
      );

    case 'dateTime':
      return (
        <DateTimeInput
          key={field.name}
          source={field.name}
          validate={validate}
          {...props}
        />
      );

    default:
      return (
        <TextInput
          key={field.name}
          source={field.name}
          validate={validate}
          {...props}
        />
      );
  }
};

const InputGuesser = props => (
  <Introspecter
    component={IntrospectedInputGuesser}
    includeDeprecated={true}
    {...props}
  />
);

InputGuesser.propTypes = {
  source: PropTypes.string.isRequired,
};

export default InputGuesser;
