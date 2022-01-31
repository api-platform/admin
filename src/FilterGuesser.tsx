import React, { useEffect, useState } from 'react';
import {
  Filter,
  FilterProps as RaFilterProps,
  useCheckMinimumRequiredProps,
} from 'react-admin';
import InputGuesser from './InputGuesser';
import Introspecter, { BaseIntrospecterProps } from './Introspecter';
import { FilterParameter, IntrospectedGuesserProps } from './types';

type FilterProps = Omit<RaFilterProps, 'children'> & {
  hasShow?: boolean;
  hasEdit?: boolean;
};

type IntrospectedFiterGuesserProps = FilterProps & IntrospectedGuesserProps;

export type FilterGuesserProps = Omit<
  FilterProps & BaseIntrospecterProps,
  'component' | 'resource'
> &
  Partial<Pick<BaseIntrospecterProps, 'resource'>>;

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

const FilterGuesser = (props: FilterGuesserProps) => {
  useCheckMinimumRequiredProps('FilterGuesser', ['resource'], props);
  if (!props.resource) {
    return null;
  }

  return (
    <Introspecter
      component={IntrospectedFilterGuesser}
      resource={props.resource}
      {...props}
    />
  );
};

export default FilterGuesser;
