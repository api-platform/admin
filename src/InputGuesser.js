import React, {cloneElement} from 'react';
import {Query} from 'react-admin';
import inputFactory from './inputFactory';

const InputGuesser = props => (
  <Query type="INTROSPECT" resource={props.ressource}>
    {({data, loading, error}) => {
      if (loading) {
        return <div>LOADING</div>;
      }

      if (error) {
        console.error(error);

        return <div>ERROR</div>;
      }

      const resourceSchema = data.resources.find(
        r => r.name === props.resource,
      );

      if (
        !resourceSchema ||
        !resourceSchema.fields ||
        !resourceSchema.fields.length
      ) {
        throw new Error(
          `Resource ${props.resource} not present inside api description`,
        );
      }

      const fieldDefinition = resourceSchema.fields.find(
        ({name}) => name === props.source,
      );
      if (!fieldDefinition) {
        throw new Error(
          `Field ${props.source} not present inside the api description for the resource ${props.resource}`,
        );
      }

      const inferredElement = inputFactory(fieldDefinition, {
        resource: this.props.resource,
      });

      return cloneElement(inferredElement, props);
    }}
  </Query>
);

export default InputGuesser;
