import React, { useEffect, useState } from 'react';
import { Filter } from 'react-admin';
import InputGuesser from './InputGuesser';
import Introspecter from './Introspecter';

export const IntrospectedFilterGuesser = ({
  fields,
  readableFields,
  writableFields,
  schema,
  schemaAnalyzer,
  hasShow,
  hasEdit,
  ...rest
}) => {
  const [filtersParameters, setFiltersParameters] = useState([]);

  useEffect(() => {
    if (schema) {
      const resolvedFiltersParameters = schemaAnalyzer.getFiltersParametersFromSchema(
        schema,
      );

      setFiltersParameters(resolvedFiltersParameters);

      if (!resolvedFiltersParameters.length) {
        schema
          .getParameters()
          .then(() =>
            setFiltersParameters(
              schemaAnalyzer.getFiltersParametersFromSchema(schema),
            ),
          );
      }
    }
  }, []);

  if (!filtersParameters.length) {
    return null;
  }

  return (
    <Filter {...rest}>
      {filtersParameters.map(filter => (
        <InputGuesser
          key={filter.name}
          source={filter.name}
          alwaysOn={filter.isRequired}
        />
      ))}
    </Filter>
  );
};

const FilterGuesser = props => (
  <Introspecter component={IntrospectedFilterGuesser} {...props} />
);

export default FilterGuesser;
