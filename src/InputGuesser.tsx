import React from 'react';
import PropTypes from 'prop-types';
import {
  ArrayInput,
  BooleanInput,
  DateInput,
  DateTimeInput,
  NumberInput,
  ReferenceArrayInput,
  ReferenceInput,
  SelectArrayInput,
  SelectInput,
  SimpleFormIterator,
  TextInput,
  required,
  useResourceContext,
} from 'react-admin';
import type {
  ArrayInputProps,
  BooleanInputProps,
  DateInputProps,
  DateTimeInputProps,
  NumberInputProps,
  ReferenceArrayInputProps,
  ReferenceInputProps,
  TextInputProps,
} from 'react-admin';
import isPlainObject from 'lodash.isplainobject';
import Introspecter from './Introspecter';
import type { InputGuesserProps, IntrospectedInputGuesserProps } from './types';

export const IntrospectedInputGuesser = ({
  fields,
  readableFields,
  writableFields,
  schema,
  schemaAnalyzer,
  validate,
  ...props
}: IntrospectedInputGuesserProps) => {
  const field = fields.find(({ name }) => name === props.source);
  if (!field) {
    // eslint-disable-next-line no-console
    console.error(
      `Field ${props.source} not present inside API description for the resource ${props.resource}`,
    );

    return null;
  }

  const guessedValidate = !validate && field.required ? [required()] : validate;

  if (field.reference !== null && typeof field.reference === 'object') {
    if (field.maxCardinality === 1) {
      return (
        <ReferenceInput
          key={field.name}
          validate={guessedValidate}
          {...(props as ReferenceInputProps)}
          reference={field.reference.name}
          source={field.name}
          allowEmpty>
          <SelectInput
            optionText={schemaAnalyzer.getFieldNameFromSchema(field.reference)}
          />
        </ReferenceInput>
      );
    }

    return (
      <ReferenceArrayInput
        key={field.name}
        validate={guessedValidate}
        {...(props as ReferenceArrayInputProps)}
        reference={field.reference.name}
        source={field.name}
        allowEmpty>
        <SelectArrayInput
          optionText={schemaAnalyzer.getFieldNameFromSchema(field.reference)}
        />
      </ReferenceArrayInput>
    );
  }

  let { format, parse } = props;
  const fieldType = schemaAnalyzer.getFieldType(field);

  if (['integer_id', 'id'].includes(fieldType) || field.name === 'id') {
    const prefix = `/${props.resource}/`;

    format = (value: string | number) => {
      if (typeof value === 'string' && value.indexOf(prefix) === 0) {
        const id = value.substring(prefix.length);
        if (['integer_id', 'integer'].includes(fieldType)) {
          return parseInt(id, 10);
        }
        return id;
      }
      return value;
    };
  }

  const formatEmbedded = (value: string | object) =>
    typeof value === 'string' ? value : JSON.stringify(value);
  const parseEmbedded = (value: string) => {
    try {
      const parsed = JSON.parse(value);
      if (!isPlainObject(parsed)) {
        return value;
      }
      return parsed;
    } catch (e) {
      return value;
    }
  };

  if (field.embedded !== null && field.maxCardinality === 1) {
    format = formatEmbedded;
    parse = parseEmbedded;
  }

  let textInputFormat = (value: string) => value;
  let textInputParse = (value: string) => value;

  switch (fieldType) {
    case 'array':
      if (field.embedded !== null && field.maxCardinality !== 1) {
        textInputFormat = formatEmbedded;
        textInputParse = parseEmbedded;
      }

      return (
        <ArrayInput
          key={field.name}
          validate={guessedValidate}
          {...(props as ArrayInputProps)}
          source={field.name}>
          <SimpleFormIterator>
            <TextInput
              source=""
              format={textInputFormat}
              parse={textInputParse}
            />
          </SimpleFormIterator>
        </ArrayInput>
      );

    case 'integer':
    case 'integer_id':
      return (
        <NumberInput
          key={field.name}
          validate={guessedValidate}
          {...(props as NumberInputProps)}
          format={format}
          parse={parse}
          source={field.name}
        />
      );

    case 'float':
      return (
        <NumberInput
          key={field.name}
          step="0.1"
          validate={guessedValidate}
          {...(props as NumberInputProps)}
          format={format}
          parse={parse}
          source={field.name}
        />
      );

    case 'boolean':
      return (
        <BooleanInput
          key={field.name}
          validate={guessedValidate}
          {...(props as BooleanInputProps)}
          format={format}
          parse={parse}
          source={field.name}
        />
      );

    case 'date':
      return (
        <DateInput
          key={field.name}
          validate={guessedValidate}
          {...(props as DateInputProps)}
          format={format}
          parse={parse}
          source={field.name}
        />
      );

    case 'dateTime':
      return (
        <DateTimeInput
          key={field.name}
          validate={guessedValidate}
          {...(props as DateTimeInputProps)}
          format={format}
          parse={parse}
          source={field.name}
        />
      );

    default:
      return (
        <TextInput
          key={field.name}
          validate={guessedValidate}
          {...(props as TextInputProps)}
          format={format}
          parse={parse}
          source={field.name}
        />
      );
  }
};

const InputGuesser = (props: InputGuesserProps) => {
  const resource = useResourceContext(props);

  return (
    <Introspecter
      component={IntrospectedInputGuesser}
      resource={resource}
      includeDeprecated
      {...props}
    />
  );
};

InputGuesser.propTypes = {
  source: PropTypes.string.isRequired,
  alwaysOn: PropTypes.bool,
};

export default InputGuesser;
