import React from 'react';
import {Query, Edit, Loading, SimpleForm} from 'react-admin';

import InputGuesser from './InputGuesser';

export const existsAsChild = children => {
  const childrenNames = new Set(
    React.Children.map(children, child => child.props.name),
  );

  return ({name}) => !childrenNames.has(name);
};

const EditGuesser = props => (
  <Query type="INTROSPECT" resource={props.ressource}>
    {({data, loading, error}) => {
      const {resource, children} = props;
      if (loading) {
        return <Loading />;
      }

      if (error) {
        console.error(error);
        return <div>Error while reading the API schema</div>;
      }
      const resourceSchema = data.resources.find(r => r.name === resource);

      if (!resourceSchema || !resourceSchema.fields) {
        console.error(
          `Resource ${props.resource} not present inside api description`,
        );
        return (
          <div>
            Resource ${props.resource} not present inside api description
          </div>
        );
      }

      const fields = resourceSchema.fields.filter(existsAsChild(children));

      return (
        <Edit {...props}>
          <SimpleForm>
            {children}
            {fields.map(field => (
              <InputGuesser key={field.name} source={field.name} />
            ))}
          </SimpleForm>
        </Edit>
      );
    }}
  </Query>
);

export default EditGuesser;
