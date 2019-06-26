import React, {Children} from 'react';
import PropTypes from 'prop-types';
import {
  Create,
  SimpleForm,
  Query,
  Loading,
} from 'react-admin';
import inputFactory from './inputFactory';
import {getResource} from './docsUtils';

const getInputs = (
  {writableFields: inputs},
  allowedInputNames = inputs.map(defaultInput => defaultInput.name),
) => inputs.filter(({name}) => allowedInputNames.includes(name));

const CreateGuesser = ({...props}) => {
  const children = Children.toArray(props.children);
  const {resource: resourceName, fields: allowedInputNames} = props;

  return (
    <Query type="INTROSPECT">
      {({data: api, loading, error}) => {
        if (loading) {
          return <Loading />;
        }

        if (error) {
          console.log(error);

          return <div>ERROR</div>;
        }

        const resource = getResource(api.resources, resourceName);

        return (
          <Create {...props}>
            <SimpleForm>
              {getInputs(resource, allowedInputNames).map(input => {
                const child = children.find(
                  ({props: {source}}) => source === input.name,
                );
                if (undefined === child) {
                  return inputFactory(input, {resource});
                }

                return child;
              })}
            </SimpleForm>
          </Create>
        );
      }}
    </Query>
  );
};

export default CreateGuesser;

CreateGuesser.propTypes = {
  children: PropTypes.object,
  resource: PropTypes.string.isRequired,
  inputs: PropTypes.array,
};
