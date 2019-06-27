import React from 'react';
import {Query, Show, Loading, SimpleShowLayout} from 'react-admin';
import FieldGuesser from './FieldGuesser';

export const existsAsChild = children => {
  const childrenNames = new Set(
    React.Children.map(children, child => child.props.name),
  );

  return ({name}) => !childrenNames.has(name);
};

const ShowGuesser = props => (
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
        <Show {...props}>
          <SimpleShowLayout>
            {children}
            {fields.map(field => (
              <FieldGuesser
                key={field.name}
                source={field.name}
                addLabel={true}
              />
            ))}
          </SimpleShowLayout>
        </Show>
      );
    }}
  </Query>
);

export default ShowGuesser;
