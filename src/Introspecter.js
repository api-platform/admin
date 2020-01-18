import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useQueryWithStore } from 'react-admin';
import SchemaAnalyzerContext from './SchemaAnalyzerContext';

const ResourcesIntrospecter = ({
  component: Component,
  schemaAnalyzer,
  includeDeprecated,
  resource,
  resources,
  loading,
  error,
  ...rest
}) => {
  if (loading) {
    return null;
  }

  if (error) {
    if ('production' === process.env.NODE_ENV) {
      console.error(error);
    }

    throw new Error('API schema is not readable');
  }

  if (resources == null) {
    return null;
  }

  const schema = resources.find(r => r.name === resource);

  if (
    !schema ||
    !schema.fields ||
    !schema.readableFields ||
    !schema.writableFields
  ) {
    if ('production' === process.env.NODE_ENV) {
      console.error(`Resource ${resource} not present inside API description`);
    }

    throw new Error(`Resource ${resource} not present inside API description`);
  }

  const fields = includeDeprecated
    ? schema.fields
    : schema.fields.filter(({ deprecated }) => !deprecated);
  const readableFields = includeDeprecated
    ? schema.readableFields
    : schema.readableFields.filter(({ deprecated }) => !deprecated);
  const writableFields = includeDeprecated
    ? schema.writableFields
    : schema.writableFields.filter(({ deprecated }) => !deprecated);

  return (
    <Component
      schemaAnalyzer={schemaAnalyzer}
      resource={resource}
      schema={schema}
      fields={fields}
      readableFields={readableFields}
      writableFields={writableFields}
      {...rest}
    />
  );
};

const Introspecter = ({
  component,
  includeDeprecated = false,
  resource,
  ...rest
}) => {
  const schemaAnalyzer = useContext(SchemaAnalyzerContext);
  const [resources, setResources] = useState();

  const { data, loading, error } = useQueryWithStore(
    {
      type: 'introspect',
    },
    { action: 'INTROSPECT' },
    state =>
      state.introspect['introspect']
        ? state.introspect['introspect'].data
        : undefined,
  );

  useEffect(() => {
    if (data) {
      setResources(data.resources);
    }
  }, [data]);

  return (
    <ResourcesIntrospecter
      component={component}
      schemaAnalyzer={schemaAnalyzer}
      includeDeprecated={includeDeprecated}
      resource={resource}
      resources={resources}
      loading={loading}
      error={error}
      {...rest}
    />
  );
};

Introspecter.propTypes = {
  component: PropTypes.elementType.isRequired,
  resource: PropTypes.string.isRequired,
  includeDeprecated: PropTypes.bool,
};

export default Introspecter;
