import React from 'react';
import PropTypes from 'prop-types';
import {Query, Show, Loading, SimpleShowLayout} from 'react-admin';
import {getResourcePropertiesNames, renderField} from './helpers';

const ShowGuesserView = ({children, fieldsNames, ...props}) => (
  <Show {...props}>
    <SimpleShowLayout>
      {fieldsNames.map(fieldName =>
        renderField(children, fieldName, props.resource, {
          ...props,
          key: props,
        }),
      )}
    </SimpleShowLayout>
  </Show>
);

ShowGuesserView.propTypes = {
  children: PropTypes.object,
  fieldsNames: PropTypes.array.isRequired,
};

const ShowGuesser = props => (
  <Query type="INTROSPECT" resource={props.resource}>
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
        fields: allowedFieldNames,
        children,
      } = props;

      const resource = data.resources.find(({name}) => resourceName === name);

      if (!resource || !resource.readableFields) {
        console.error(
          `Resource ${resourceName} not present inside api description`,
        );
        return `<div>Resource ${resourceName} not present inside api description</div>`;
      }

      const fieldsNames = getResourcePropertiesNames(
        resource,
        'readable',
        allowedFieldNames,
        children,
      );

      return <ShowGuesserView {...props} fieldsNames={fieldsNames} />;
    }}
  </Query>
);

export default ShowGuesser;

ShowGuesser.propTypes = {
  children: PropTypes.object,
  resource: PropTypes.string.isRequired,
  fields: PropTypes.array,
};
