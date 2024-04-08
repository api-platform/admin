import React from 'react';
import { HydraAdmin, type HydraAdminProps } from '../hydra';

/**
 * # Basic `<HydraAdmin>` component
 * The `<HydraAdmin>` component without any parameter.
 */
const Basic = ({ entrypoint }: BasicProps) => (
  <HydraAdmin entrypoint={entrypoint} />
);

export default Basic;

export interface BasicProps extends Pick<HydraAdminProps, 'entrypoint'> {}
