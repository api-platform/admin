import React, { Fragment } from 'react';
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
import Introspecter from './Introspecter';

export const IntrospectedInputGuesser = ({
  fields,
  readableFields,
  writableFields,
  schema,
  schemaAnalyzer,
  ...props
}) => {
  const translate = useTranslate();

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
          reference={field.reference.name}
          source={field.name}
          validate={validate}
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
        validate={validate}
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
          validate={validate}
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
