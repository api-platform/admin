import React from 'react';
import PropTypes from 'prop-types';

import dataProviderFactory from './dataProvider';
import schemaAnalyzer from './schemaAnalyzer';
import AdminGuesser, { AdminGuesserProps } from '../AdminGuesser';

interface HydraAdminProps extends AdminGuesserProps {
  entrypoint: string;
  mercure: any;
  dataProvider: any;
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
