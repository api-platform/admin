import {Filter} from 'react-admin';
import React from 'react';

const resolveProps = props => {
  const {options} = props;
  const {parameterFactory, fields, parameters} = options;
  return {
    ...props,
    parameterFactory: parameterFactory,
    fields: fields,
    parameters: parameters,
  };
};

const ListFilter = props => {
  const {parameters, fields, parameterFactory} = resolveProps(props);

  const parameterAlwaysOn = parameters.length < 8;

  return (
    <Filter {...props}>
      {parameters.length > 0 &&
        parameters.map(parameter =>
          parameterFactory(parameter, fields, {
            alwaysOn: parameterAlwaysOn,
          }),
        )}
    </Filter>
  );
};

export default ListFilter;
