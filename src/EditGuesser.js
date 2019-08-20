import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
import {Edit, SimpleForm, Query, Loading} from 'react-admin';
import {getResourcePropertiesNames, renderInput} from './helpers';

const EditGuesserView = ({children, inputsNames, ...props}) => (
  <Edit {...props}>
    <SimpleForm>
      {inputsNames.map(inputName => (
        <Fragment key={inputName}>
          {renderInput(children, inputName, props.resource)}
        </Fragment>
      ))}
    </SimpleForm>
  </Edit>
);

EditGuesserView.propTypes = {
  children: PropTypes.object,
  inputsNames: PropTypes.array.isRequired,
};

const EditGuesser = props => (
  <Query type="INTROSPECT">
    {({data, loading, error}) => {
      if (loading) {
        return <Loading />;
      }

      if (error) {
        console.error(error);
        return <div>Error while reading the API schema</div>;
      }

      const {
        resource: resourceName,
        inputs: allowedInputNames,
        children,
      } = props;

      const resource = data.resources.find(({name}) => resourceName === name);

      if (!resource || !resource.writableFields) {
        console.error(
          `Resource ${resourceName} not present inside api description`,
        );
        return `<div>Resource ${resourceName} not present inside api description</div>`;
      }

      const inputsNames = getResourcePropertiesNames(
        resource,
        'writable',
        allowedInputNames,
        children,
      );

      return <EditGuesserView {...props} inputsNames={inputsNames} />;
    }}
  </Query>
);

export default EditGuesser;

EditGuesser.propTypes = {
  children: PropTypes.object,
  resource: PropTypes.string.isRequired,
  inputs: PropTypes.array,
};
