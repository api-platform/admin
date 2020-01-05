import React from 'react';
import PropTypes from 'prop-types';

import dataProviderFactory from './dataProvider';
import resourceSchemaAnalyzerFactory from './resourceSchemaAnalyzer';
import AdminGuesser from '../AdminGuesser';

const HydraAdmin = ({
  entrypoint,
  dataProvider = dataProviderFactory(entrypoint),
  resourceSchemaAnalyzer = resourceSchemaAnalyzerFactory(),
  ...props
}) => (
  <AdminGuesser
    dataProvider={dataProvider}
    resourceSchemaAnalyzer={resourceSchemaAnalyzer}
    {...props}
  />
);

HydraAdmin.propTypes = {
  entrypoint: PropTypes.string.isRequired,
};

export default HydraAdmin;
