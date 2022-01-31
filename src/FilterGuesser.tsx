import React, { useEffect, useState } from 'react';
import { Filter, useCheckMinimumRequiredProps } from 'react-admin';
import InputGuesser from './InputGuesser';
import Introspecter from './Introspecter';
import type {
  FilterGuesserProps,
  FilterParameter,
  IntrospectedFiterGuesserProps,
} from './types';

export const IntrospectedFilterGuesser = ({
  fields,
  readableFields,
  writableFields,
  schema,
  schemaAnalyzer,
  hasShow,
  hasEdit,
  ...rest
}: IntrospectedFiterGuesserProps) => {
  const [filtersParameters, setFiltersParameters] = useState<FilterParameter[]>(
    [],
  );

  useEffect(() => {
    if (schema) {
      schemaAnalyzer
        .getFiltersParametersFromSchema(schema)
        .then((parameters) => {
          setFiltersParameters(parameters);
        });
    }
  }, [schema, schemaAnalyzer]);

  if (!filtersParameters.length) {
    return null;
  }

  return (
    <Filter {...rest}>
      {filtersParameters.map((filter) => (
        <InputGuesser
          key={filter.name}
          source={filter.name}
          alwaysOn={filter.isRequired}
        />
      ))}
    </Filter>
  );
};

const FilterGuesser = (props: FilterGuesserProps) => {
  useCheckMinimumRequiredProps('FilterGuesser', ['resource'], props);
  const { resource, ...rest } = props;
  if (!resource) {
    return null;
  }

  return (
    <Introspecter
      component={IntrospectedFilterGuesser}
      resource={resource}
      {...rest}
    />
  );
};

export default FilterGuesser;
