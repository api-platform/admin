import React, { Fragment, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  ArrayInput,
  ArrayInputProps,
  BooleanInput,
  DateInput,
  DateInputProps,
  DateTimeInput,
  DateTimeInputProps,
  getFieldLabelTranslationArgs,
  InputProps as RaInputProps,
  NumberInput,
  NumberInputProps,
  ReferenceArrayInput,
  ReferenceArrayInputProps,
  ReferenceInput,
  ReferenceInputProps,
  required,
  SelectArrayInput,
  SelectInput,
  SimpleFormIterator,
  TextInput,
  TextInputProps,
  useCheckMinimumRequiredProps,
  useTranslate,
} from 'react-admin';
import { useForm } from 'react-final-form';
import { SwitchProps } from '@material-ui/core/Switch';
import { FormGroupProps } from '@material-ui/core/FormGroup';
import Introspecter, { BaseIntrospecterProps } from './Introspecter';
import { IntrospectedGuesserProps } from './types';

// @TODO Remove after react-admin 3.19.8 is released.
type BooleanInputProps = RaInputProps<SwitchProps> &
  Omit<FormGroupProps, 'defaultValue' | 'onChange' | 'onBlur' | 'onFocus'>;

type InputProps =
  | TextInputProps
  | DateTimeInputProps
  | DateInputProps
  | BooleanInputProps
  | NumberInputProps
  | ArrayInputProps
  | ReferenceArrayInputProps
  | ReferenceInputProps;

type IntrospectedInputGuesserProps = Partial<InputProps> &
  IntrospectedGuesserProps;

export type InputGuesserProps = Omit<
  InputProps & BaseIntrospecterProps,
  'component' | 'resource'
> &
  Partial<Pick<BaseIntrospecterProps, 'resource'>>;

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
    console.error(
      `Field ${props.source} not present inside API description for the resource ${props.resource}`,
    );

    return <Fragment />;
  }

  const guessedValidate = !validate && field.required ? [required()] : validate;

  if (null !== field.reference && typeof field.reference === 'object') {
    if (1 === field.maxCardinality) {
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

  const fieldType = schemaAnalyzer.getFieldType(field);

  if (fieldType === 'id') {
    const prefix = `/${props.resource}/`;

    props.format = (value: string) => {
      return value && 0 === value.indexOf(prefix)
        ? value.substr(prefix.length)
        : value;
    };

    props.parse = (value: string) => {
      return -1 !== value.indexOf(prefix) ? prefix + value : value;
    };
  }

  const formatEmbedded = (value: string) => JSON.stringify(value);
  const parseEmbedded = (value: string) => JSON.parse(value);

  if (null !== field.embedded && 1 === field.maxCardinality) {
    props.format = formatEmbedded;
    props.parse = parseEmbedded;
  }

  switch (fieldType) {
    case 'array':
      let textInputFormat = (value: string) => value;
      let textInputParse = (value: string) => value;
      if (null !== field.embedded && 1 !== field.maxCardinality) {
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
          source={field.name}
        />
      );

    case 'boolean':
      return (
        <BooleanInput
          key={field.name}
          validate={guessedValidate}
          {...(props as BooleanInputProps)}
          source={field.name}
        />
      );

    case 'date':
      return (
        <DateInput
          key={field.name}
          validate={guessedValidate}
          {...(props as DateInputProps)}
          source={field.name}
        />
      );

    case 'dateTime':
      return (
        <DateTimeInput
          key={field.name}
          validate={guessedValidate}
          {...(props as DateTimeInputProps)}
          source={field.name}
        />
      );

    default:
      return (
        <TextInput
          key={field.name}
          validate={guessedValidate}
          {...(props as TextInputProps)}
          source={field.name}
        />
      );
  }
};

const InputGuesser = (props: InputGuesserProps) => {
  useCheckMinimumRequiredProps('InputGuesser', ['resource'], props);
  if (!props.resource) {
    return null;
  }

  return (
    <Introspecter
      component={IntrospectedInputGuesser}
      resource={props.resource}
      includeDeprecated={true}
      {...props}
    />
  );
};

InputGuesser.propTypes = {
  source: PropTypes.string.isRequired,
  alwaysOn: PropTypes.bool,
};

export default InputGuesser;
