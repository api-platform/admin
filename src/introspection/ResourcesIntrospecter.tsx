import React from 'react';
import type { ResourcesIntrospecterProps } from '../types.js';

const ResourcesIntrospecter = ({
  component: Component,
  schemaAnalyzer,
  includeDeprecated,
  resource,
  resources,
  loading,
  error,
  ...rest
}: ResourcesIntrospecterProps) => {
  if (loading) {
    return null;
  }

  if (error) {
    if (process.env.NODE_ENV === 'production') {
      // eslint-disable-next-line no-console
      console.error(error);
    }

    throw new Error('API schema is not readable');
  }

  const schema = resources.find((r) => r.name === resource);

  if (!schema?.fields || !schema?.readableFields || !schema?.writableFields) {
    if (process.env.NODE_ENV === 'production') {
      // eslint-disable-next-line no-console
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

export default ResourcesIntrospecter;
