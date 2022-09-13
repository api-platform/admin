import React from 'react';
import PropTypes from 'prop-types';
import dataProviderFactory from './dataProvider.js';
import { restDataProvider } from '../dataProvider/index.js';
import /* tree-shaking no-side-effects-when-called */ schemaAnalyzer from './schemaAnalyzer.js';
import AdminGuesser from '../AdminGuesser.js';
import type { AdminGuesserProps } from '../AdminGuesser.js';
import type { MercureOptions } from '../types.js';

type AdminGuesserPartialProps = Omit<
  AdminGuesserProps,
  'dataProvider' | 'schemaAnalyzer'
> &
  Partial<Pick<AdminGuesserProps, 'dataProvider' | 'schemaAnalyzer'>>;

export interface OpenApiAdminProps extends AdminGuesserPartialProps {
  entrypoint: string;
  docEntrypoint: string;
  mercure?: MercureOptions | false;
}

const openApiSchemaAnalyzer = schemaAnalyzer();

const OpenApiAdmin = ({
  entrypoint,
  docEntrypoint,
  mercure,
  dataProvider = dataProviderFactory({
    dataProvider: restDataProvider(entrypoint),
    entrypoint,
    docEntrypoint,
    mercure: mercure ?? false,
  }),
  schemaAnalyzer: adminSchemaAnalyzer = openApiSchemaAnalyzer,
  ...props
}: OpenApiAdminProps) => (
  <AdminGuesser
    dataProvider={dataProvider}
    schemaAnalyzer={adminSchemaAnalyzer}
    {...props}
  />
);

OpenApiAdmin.propTypes = {
  entrypoint: PropTypes.string.isRequired,
};

export default OpenApiAdmin;
