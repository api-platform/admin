import React, {useContext, useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {Loading, useDataProvider} from 'react-admin';
import ResourceSchemaAnalyzerContext from './ResourceSchemaAnalyzerContext';

const IntrospecterComponent = ({
  component: Component,
  resourceSchemaAnalyzer,
  includeDeprecated,

  resource,
  resources,
  fetching,
  error,

  ...rest
}) => {
  if (fetching) {
    return <Loading />;
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

  const resourceSchema = resources.find(r => r.name === resource);

  if (!resourceSchema || !resourceSchema.fields) {
    if ('production' === process.env.NODE_ENV) {
      console.error(`Resource ${resource} not present inside API description`);
    }

    throw new Error(`Resource ${resource} not present inside API description`);
  }

  const fields = includeDeprecated
    ? resourceSchema.fields
    : resourceSchema.fields.filter(({deprecated}) => !deprecated);

  return (
    <Component
      resourceSchemaAnalyzer={resourceSchemaAnalyzer}
      resource={resource}
      resourceSchema={resourceSchema}
      fields={fields}
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
  const dataProvider = useDataProvider();
  const resourceSchemaAnalyzer = useContext(ResourceSchemaAnalyzerContext);
  const [resources, setResources] = useState();
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState();

  useEffect(() => {
    dataProvider
      .introspect()
      .then(({data}) => {
        setResources(data.resources);
        setFetching(false);
      })
      .catch(error => {
        setError(error);
        setFetching(false);
      });
  }, []);

  return (
    <IntrospecterComponent
      component={component}
      resourceSchemaAnalyzer={resourceSchemaAnalyzer}
      includeDeprecated={includeDeprecated}
      resource={resource}
      resources={resources}
      fetching={fetching}
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
