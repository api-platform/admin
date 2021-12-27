import React, { useEffect, useState } from 'react';
import { Filter } from 'react-admin';
import InputGuesser from './InputGuesser';
import Introspecter from './Introspecter';

type FilterParameter = {
  name: string;
  isRequired: boolean;
};

interface IntrospectedFilterGuesserProps {
  schema: any;
  schemaAnalyzer: any;
}

export const IntrospectedFilterGuesser = ({
  schema,
  schemaAnalyzer,
  ...rest
}: IntrospectedFilterGuesserProps) => {
  const [filtersParameters, setFiltersParameters] = useState<FilterParameter[]>(
    []
  );

  useEffect(() => {
    if (schema) {
      schemaAnalyzer
        .getFiltersParametersFromSchema(schema)
        .then((parameters) => setFiltersParameters(parameters));
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

const FilterGuesser = (props) => (
  <Introspecter component={IntrospectedFilterGuesser} {...props} />
);

export default FilterGuesser;
