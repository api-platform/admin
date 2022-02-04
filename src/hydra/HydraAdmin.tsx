import React from 'react';
import PropTypes from 'prop-types';
import dataProviderFactory from './dataProvider';
import /* tree-shaking no-side-effects-when-called */ schemaAnalyzer from './schemaAnalyzer';
import AdminGuesser from '../AdminGuesser';
import type { AdminGuesserProps } from '../AdminGuesser';
import type { MercureOptions } from '../types';

type AdminGuesserPartialProps = Omit<
  AdminGuesserProps,
  'dataProvider' | 'schemaAnalyzer'
> &
  Partial<Pick<AdminGuesserProps, 'dataProvider' | 'schemaAnalyzer'>>;

interface HydraAdminProps extends AdminGuesserPartialProps {
  entrypoint: string;
  mercure?: MercureOptions;
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
