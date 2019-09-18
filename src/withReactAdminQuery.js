import React from 'react';
import {Query, Loading} from 'react-admin';
import {existsAsChild} from './docsUtils';

const withReactAdminQuery = ({component: Component, ...props}) => (
  <Query type="INTROSPECT" resource={props.ressource}>
    {({data, loading, error}) => {
      if (loading) {
        return <Loading />;
      }

      if (error) {
        console.error(error);
        return <div>Error while reading the API schema</div>;
      }

      if (data == null) {
        return null;
      }

      const resourceSchema = data.resources.find(
        r => r.name === props.resource,
      );

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

      const fields = resourceSchema.fields
        .filter(({deprecated}) => !deprecated)
        .filter(existsAsChild(props.children));

      return (
        <Component
          data={data}
          resource={props.ressource}
          resourceSchema={resourceSchema}
          fields={fields}
          {...props}
        />
      );
    }}
  </Query>
);

export default withReactAdminQuery;
