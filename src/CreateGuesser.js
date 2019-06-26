import React, {Children} from 'react';
import PropTypes from 'prop-types';
import {Create, SimpleForm, Query, Loading} from 'react-admin';
import {getResource} from './docsUtils';
import InputGuesser from './InputGuesser';
import existsAsChild from './existsAsChild';

const CreateGuesser = ({...props}) => {
  const children = Children.toArray(props.children);
  const {resource: resourceName} = props;

  return (
    <Query type="INTROSPECT">
      {({data: api, loading, error}) => {
        if (loading) {
          return <Loading />;
        }

        if (error) {
          console.error(error);
          return <div>Error while reading the API schema</div>;
        }

        const resource = getResource(api.resources, resourceName);

        if (!resource || !resource.writableFields) {
          console.error(
            `Resource ${resourceName} not present inside api description`,
          );
          return (
            <div>
              Resource ${resourceName} not present inside api description
            </div>
          );
        }

        const fields = resource.fields.filter(existsAsChild(children));

        return (
          <Create {...props}>
            <SimpleForm>
              {children}
              {fields.map(field => (
                <InputGuesser key={field.name} source={field.name} />
              ))}
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
