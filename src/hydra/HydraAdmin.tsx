import React from 'react';
import PropTypes from 'prop-types';

import dataProviderFactory from './dataProvider';
import schemaAnalyzer from './schemaAnalyzer';
import AdminGuesser, { AdminGuesserProps } from '../AdminGuesser';
import { ApiPlatformAdminDataProvider, MercureOptions } from '../types';

interface HydraAdminProps extends Omit<AdminGuesserProps, 'dataProvider'> {
  entrypoint: string;
  mercure?: MercureOptions;
  dataProvider?: ApiPlatformAdminDataProvider;
}

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
}: HydraAdminProps) => (
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
