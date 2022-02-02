import React from 'react';
import PropTypes from 'prop-types';
import dataProviderFactory from './dataProvider';
import schemaAnalyzer from './schemaAnalyzer';
import AdminGuesser from '../AdminGuesser';
import type { AdminGuesserProps } from '../AdminGuesser';
import type { ApiPlatformAdminDataProvider, MercureOptions } from '../types';

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
  schemaAnalyzer: adminSchemaAnalyzer = hydraSchemaAnalyzer,
  ...props
}: HydraAdminProps) => (
  <AdminGuesser
    dataProvider={dataProvider}
    schemaAnalyzer={adminSchemaAnalyzer}
    {...props}
  />
);

HydraAdmin.propTypes = {
  entrypoint: PropTypes.string.isRequired,
};

export default HydraAdmin;
