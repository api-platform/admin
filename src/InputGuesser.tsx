import React, { useEffect } from 'react';
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
  getFieldLabelTranslationArgs,
  required,
  useCheckMinimumRequiredProps,
  useTranslate,
} from 'react-admin';
import type {
  ArrayInputProps,
  DateInputProps,
  DateTimeInputProps,
  NumberInputProps,
  ReferenceArrayInputProps,
  ReferenceInputProps,
  TextInputProps,
} from 'react-admin';
import { useForm } from 'react-final-form';
import Introspecter from './Introspecter';
import type {
  BooleanInputProps,
  InputGuesserProps,
  IntrospectedInputGuesserProps,
} from './types';

export const IntrospectedInputGuesser = ({
  fields,
  readableFields,
  writableFields,
  schema,
  schemaAnalyzer,
  validate,
  ...props
}: IntrospectedInputGuesserProps) => {
  const translate = useTranslate();
  const form = useForm();
  // Pause the validation while the Final Form field is registered to prevent a form state desynchronization bug when using async validators.
  // Since the field is not registered directly because of the introspection, Final Form is using the previous form state (without the field) when notifying after the async validation done during the registration.
  // See also https://github.com/final-form/react-final-form/issues/780.
  form.pauseValidation();
  useEffect(() => {
    form.resumeValidation();
  });

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

    // Not needed after React-Admin >= 3.10.4 (see https://github.com/marmelab/react-admin/pull/5606).
    const translatedLabel = translate(
      ...getFieldLabelTranslationArgs({
        resource: props.resource,
        source: field.name,
      }),
    );

    return (
      <ReferenceArrayInput
        key={field.name}
        label={translatedLabel}
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

  if (fieldType === 'id') {
    const prefix = `/${props.resource}/`;

    format = (value: string) =>
      value && value.indexOf(prefix) === 0
        ? value.substr(prefix.length)
        : value;

    parse = (value: string) =>
      value.indexOf(prefix) !== -1 ? prefix + value : value;
  }

  const formatEmbedded = (value: string) => JSON.stringify(value);
  const parseEmbedded = (value: string) => JSON.parse(value);

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
  useCheckMinimumRequiredProps('InputGuesser', ['resource'], props);
  const { resource, ...rest } = props;
  if (!resource) {
    return null;
  }

  return (
    <Introspecter
      component={IntrospectedInputGuesser}
      resource={resource}
      includeDeprecated
      {...rest}
    />
  );
};

InputGuesser.propTypes = {
  source: PropTypes.string.isRequired,
  alwaysOn: PropTypes.bool,
};

export default InputGuesser;
