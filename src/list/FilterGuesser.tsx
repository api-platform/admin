import React, { useEffect, useState } from 'react';
import { Filter, useResourceContext } from 'react-admin';
import InputGuesser from '../input/InputGuesser.js';
import Introspecter from '../introspection/Introspecter.js';
import type {
  FilterGuesserProps,
  FilterParameter,
  IntrospectedFiterGuesserProps,
} from '../types.js';

/**
 * Adds filters based on the #ApiFilters attribute
 *
 * @see https://api-platform.com/docs/core/filters/
 */
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
  if (!resource) {
    throw new Error('FilterGuesser must be used with a resource');
  }

  return (
    <Introspecter
      component={IntrospectedFilterGuesser}
      resource={resource}
      {...props}
    />
  );
};

export default FilterGuesser;
