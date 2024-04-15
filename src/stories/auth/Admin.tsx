import React from 'react';
import { HydraAdmin, type HydraAdminProps } from '../../hydra';
import authProvider from './basicAuth';

/**
 * # Protected `<HydraAdmin>`
 * The `<HydraAdmin>` component protected by the `authProvider` which is a basic authentication provider.
 *
 * Login with: john/123
 */
const Admin = ({ entrypoint }: JwtAuthProps) => (
  <HydraAdmin entrypoint={entrypoint} authProvider={authProvider} requireAuth />
);

export default Admin;

export interface JwtAuthProps extends Pick<HydraAdminProps, 'entrypoint'> {}
