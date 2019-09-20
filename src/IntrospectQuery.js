import React from 'react';
import PropTypes from 'prop-types';
import {Query, Loading, TranslationProvider} from 'react-admin';

const IntrospectQuery = ({
  component: Component,
  includeDeprecated,
  ...props
}) => (
  <Query type="INTROSPECT" resource={props.ressource}>
    {({data, loading, error}) => {
      if (loading) {
        return (
          <TranslationProvider>
            <Loading />
          </TranslationProvider>
        );
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

      const fields = includeDeprecated
        ? resourceSchema.fields
        : resourceSchema.fields.filter(({deprecated}) => !deprecated);

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

IntrospectQuery.defaultProps = {
  includeDeprecated: false,
};

IntrospectQuery.propTypes = {
  component: PropTypes.elementType,
  resource: PropTypes.string,
  includeDeprecated: PropTypes.bool,
};

export default IntrospectQuery;
