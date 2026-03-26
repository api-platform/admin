import React from 'react';
import { HydraAdmin, type HydraAdminProps } from '../../hydra';
import authProvider from './basicAuth';
import DevtoolsLayout from '../layout/DevtoolsLayout';

/**
 * # Protected `<HydraAdmin>`
 * The `<HydraAdmin>` component protected by the `authProvider` which is a basic authentication provider.
 *
 * Login with: john/123
 */
const Admin = ({ entrypoint }: JwtAuthProps) => (
  <HydraAdmin
    entrypoint={entrypoint}
    authProvider={authProvider}
    requireAuth
    layout={DevtoolsLayout}
  />
);

export default Admin;

export interface JwtAuthProps extends Pick<HydraAdminProps, 'entrypoint'> {}
