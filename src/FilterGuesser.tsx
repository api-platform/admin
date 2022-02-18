import React, { useEffect, useState } from 'react';
import { Filter, useResourceContext } from 'react-admin';
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
  const resource = useResourceContext(props);

  return (
    <Introspecter
      component={IntrospectedFilterGuesser}
      resource={resource}
      {...props}
    />
  );
};

export default FilterGuesser;
