import React, { Fragment, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  ArrayInput,
  BooleanInput,
  DateInput,
  DateTimeInput,
  getFieldLabelTranslationArgs,
  NumberInput,
  ReferenceArrayInput,
  ReferenceInput,
  required,
  SelectArrayInput,
  SelectInput,
  SimpleFormIterator,
  TextInput,
  useTranslate,
} from 'react-admin';
import { useForm } from 'react-final-form';
import Introspecter from './Introspecter';

export const IntrospectedInputGuesser = ({
  fields,
  readableFields,
  writableFields,
  schema,
  schemaAnalyzer,
  validate,
  ...props
}) => {
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
    console.error(
      `Field ${props.source} not present inside API description for the resource ${props.resource}`,
    );

    return <Fragment />;
  }

  const guessedValidate = !validate && field.required ? [required()] : validate;

  if (null !== field.reference) {
    if (1 === field.maxCardinality) {
      return (
        <ReferenceInput
          key={field.name}
          reference={field.reference.name}
          source={field.name}
          validate={guessedValidate}
          {...props}
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
        reference={field.reference.name}
        source={field.name}
        validate={guessedValidate}
        {...props}
        allowEmpty>
        <SelectArrayInput
          optionText={schemaAnalyzer.getFieldNameFromSchema(field.reference)}
        />
      </ReferenceArrayInput>
    );
  }

  const fieldType = schemaAnalyzer.getFieldType(field);

  if (fieldType === 'id') {
    const prefix = `/${props.resource}/`;

    props.format = (value) => {
      return value && 0 === value.indexOf(prefix)
        ? value.substr(prefix.length)
        : value;
    };

    props.parse = (value) => {
      return -1 !== value.indexOf(prefix) ? prefix + value : value;
    };
  }

  const formatEmbedded = (value) => JSON.stringify(value);
  const parseEmbedded = (value) => JSON.parse(value);

  if (null !== field.embedded && 1 === field.maxCardinality) {
    props.format = formatEmbedded;
    props.parse = parseEmbedded;
  }

  switch (fieldType) {
    case 'array':
      let textInputFormat = (value) => value;
      let textInputParse = (value) => value;
      if (null !== field.embedded && 1 !== field.maxCardinality) {
        textInputFormat = formatEmbedded;
        textInputParse = parseEmbedded;
      }

      return (
        <ArrayInput
          key={field.name}
          source={field.name}
          validate={guessedValidate}
          {...props}>
          <SimpleFormIterator>
            <TextInput format={textInputFormat} parse={textInputParse} />
          </SimpleFormIterator>
        </ArrayInput>
      );

    case 'integer':
      return (
        <NumberInput
          key={field.name}
          source={field.name}
          validate={guessedValidate}
          {...props}
        />
      );

    case 'float':
      return (
        <NumberInput
          key={field.name}
          source={field.name}
          step="0.1"
          validate={guessedValidate}
          {...props}
        />
      );

    case 'boolean':
      return (
        <BooleanInput
          key={field.name}
          source={field.name}
          validate={guessedValidate}
          {...props}
        />
      );

    case 'date':
      return (
        <DateInput
          key={field.name}
          source={field.name}
          validate={guessedValidate}
          {...props}
        />
      );

    case 'dateTime':
      return (
        <DateTimeInput
          key={field.name}
          source={field.name}
          validate={guessedValidate}
          {...props}
        />
      );

    default:
      return (
        <TextInput
          key={field.name}
          source={field.name}
          validate={guessedValidate}
          {...props}
        />
      );
  }
};

const InputGuesser = (props) => (
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
