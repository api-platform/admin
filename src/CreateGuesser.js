import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
import {Create, SimpleForm, Query, Loading} from 'react-admin';
import {getResourcePropertiesNames, renderInput} from './helpers';

const CreateGuesserView = ({children, inputsNames, ...props}) => (
  <Create {...props}>
    <SimpleForm>
      {inputsNames.map(inputName => (
        <Fragment key={inputName}>
          {renderInput(children, inputName, props.resource)}
        </Fragment>
      ))}
    </SimpleForm>
  </Create>
);

CreateGuesserView.propTypes = {
  children: PropTypes.object,
  inputsNames: PropTypes.array.isRequired,
};

const CreateGuesser = props => (
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

      return <CreateGuesserView {...props} inputsNames={inputsNames} />;
    }}
  </Query>
);

export default CreateGuesser;

CreateGuesser.propTypes = {
  children: PropTypes.object,
  resource: PropTypes.string.isRequired,
  inputs: PropTypes.array,
};
