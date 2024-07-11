import React from 'react';
import dataProviderFactory from './dataProvider.js';
import { restDataProvider } from '../dataProvider/index.js';
import /* tree-shaking no-side-effects-when-called */ schemaAnalyzer from './schemaAnalyzer.js';
import AdminGuesser from '../core/AdminGuesser.js';
import type { AdminGuesserProps } from '../core/AdminGuesser.js';
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

export default OpenApiAdmin;
