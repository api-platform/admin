import React from 'react';
import PropTypes from 'prop-types';

import dataProviderFactory from './dataProvider';
import schemaAnalyzer from './schemaAnalyzer';
import AdminGuesser from '../AdminGuesser';

const hydraSchemaAnalyzer = schemaAnalyzer();

const HydraAdmin = ({
  entrypoint,
  mercure,
  dataProvider = dataProviderFactory({
    entrypoint,
    mercure,
  }),
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
