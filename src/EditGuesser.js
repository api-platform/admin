import React from 'react';
import {Query, Edit} from 'ra-core';
import {SimpleForm} from 'ra-ui-materialui';
import InputGuesser from './InputGuesser';

const existsAsChild = children => {
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
        return <div>LOADING</div>;
      }

      if (error) {
        console.error(error);
        return <div>ERROR</div>;
      }
      const resourceSchema = data.resources.find(r => r.name === resource);

      if (
        !resourceSchema ||
        !resourceSchema.fields ||
        !resourceSchema.fields.length
      ) {
        throw new Error('Resource not present inside api description');
      }

      const fields = resourceSchema.fields.filter(existsAsChild(children));

      return (
        <Edit {...props}>
          <SimpleForm>
            {children}
            {inferredElements}
          </SimpleForm>
        </Edit>
      );
    }}
  </Query>
);

export default EditGuesser;
