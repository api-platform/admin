import React from 'react';
import PropTypes from 'prop-types';

import dataProviderFactory from './dataProvider';
import schemaAnalyzer from './schemaAnalyzer';
import AdminGuesser from '../AdminGuesser';

const hydraSchemaAnalyzer = schemaAnalyzer();

const HydraAdmin = ({
  entrypoint,
  dataProvider = dataProviderFactory(entrypoint),
  schemaAnalyzer = hydraSchemaAnalyzer,
  ...props
}) => (
  <AdminGuesser
    dataProvider={dataProvider}
    schemaAnalyzer={schemaAnalyzer}
    {...props}
  />
);

HydraAdmin.propTypes = {
  entrypoint: PropTypes.string.isRequired,
};

export default HydraAdmin;
