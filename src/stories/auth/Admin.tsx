import React from 'react';
import { HydraAdmin, type HydraAdminProps } from '../../hydra';
import authProvider from './basicAuth';

const Admin = ({ entrypoint }: JwtAuthProps) => (
  <HydraAdmin entrypoint={entrypoint} authProvider={authProvider} requireAuth />
);

export default Admin;

export interface JwtAuthProps extends Pick<HydraAdminProps, 'entrypoint'> {}
