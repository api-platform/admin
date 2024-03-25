import React from 'react';
import { HydraAdmin, type HydraAdminProps } from '../../hydra';

const Admin = ({ entrypoint, authProvider }: JwtAuthProps) => (
  <HydraAdmin entrypoint={entrypoint} authProvider={authProvider} requireAuth />
);

export default Admin;

export interface JwtAuthProps
  extends Pick<HydraAdminProps, 'entrypoint' | 'authProvider'> {}
