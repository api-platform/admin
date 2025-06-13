import React from 'react';
import { HydraAdmin, type HydraAdminProps } from '../hydra';
import DevtoolsLayout from './layout/DevtoolsLayout';

/**
 * # Basic `<HydraAdmin>` component
 * The `<HydraAdmin>` component without any parameter.
 */
const Basic = ({ entrypoint }: BasicProps) => (
  <HydraAdmin entrypoint={entrypoint} layout={DevtoolsLayout} />
);

export default Basic;

export interface BasicProps extends Pick<HydraAdminProps, 'entrypoint'> {}
