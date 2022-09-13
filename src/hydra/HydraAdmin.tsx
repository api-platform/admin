import React from 'react';
import PropTypes from 'prop-types';
import dataProviderFactory from './dataProvider.js';
import /* tree-shaking no-side-effects-when-called */ schemaAnalyzer from './schemaAnalyzer.js';
import AdminGuesser from '../AdminGuesser.js';
import type { AdminGuesserProps } from '../AdminGuesser.js';
import type { MercureOptions } from '../types.js';

type AdminGuesserPartialProps = Omit<
  AdminGuesserProps,
  'dataProvider' | 'schemaAnalyzer'
> &
  Partial<Pick<AdminGuesserProps, 'dataProvider' | 'schemaAnalyzer'>>;

export interface HydraAdminProps extends AdminGuesserPartialProps {
  entrypoint: string;
  mercure?: MercureOptions | boolean;
}

const hydraSchemaAnalyzer = schemaAnalyzer();

const HydraAdmin = ({
  entrypoint,
  mercure,
  dataProvider = dataProviderFactory({
    entrypoint,
    mercure: mercure ?? true,
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
