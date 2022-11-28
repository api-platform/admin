import React from 'react';
import PropTypes from 'prop-types';
import {
  ArrayField,
  SingleFieldList,
  TextField,
  useRecordContext,
} from 'react-admin';
import type { TextFieldProps } from 'react-admin';
import type { EnumFieldProps } from './types.js';

const EnumField = ({ transformEnum, source, ...props }: EnumFieldProps) => {
  const record = useRecordContext();

  if (!record || typeof source === 'undefined') {
    return null;
  }

  const value = record[source];
  const enumRecord = {
    [source]: (Array.isArray(value) ? value : [value]).map((v) => ({
      value: transformEnum ? transformEnum(v) : v,
    })),
  };

  return (
    <ArrayField source={source} record={enumRecord}>
      <SingleFieldList linkType={false}>
        <TextField {...(props as TextFieldProps)} source="value" />
      </SingleFieldList>
    </ArrayField>
  );
};

EnumField.displayName = 'EnumField';

EnumField.propTypes = {
  ...TextField.propTypes,
  transformEnum: PropTypes.func,
};

export default EnumField;
