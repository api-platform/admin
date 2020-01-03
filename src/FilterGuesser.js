import React, {useEffect, useState} from 'react';
import {Filter} from 'react-admin';
import InputGuesser from './InputGuesser';
import Introspecter from './Introspecter';
import {getFiltersParametersFromResourceSchema} from './docsUtils';

export const FilterGuesserComponent = ({
  resourceSchema,
  fields,
  hasShow,
  hasEdit,
  ...rest
}) => {
  const [filtersParameters, setFiltersParameters] = useState([]);

  useEffect(() => {
    if (resourceSchema) {
      const resolvedFiltersParameters = getFiltersParametersFromResourceSchema(
        resourceSchema,
      );

      setFiltersParameters(resolvedFiltersParameters);

      if (!resolvedFiltersParameters.length) {
        resourceSchema
          .getParameters()
          .then(() =>
            setFiltersParameters(
              getFiltersParametersFromResourceSchema(resourceSchema),
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
  <Introspecter component={FilterGuesserComponent} {...props} />
);

export default FilterGuesser;
