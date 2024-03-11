import React from 'react';
import { HydraAdmin, type HydraAdminProps } from '../hydra';

const Basic = ({ entrypoint }: BasicProps) => (
  <HydraAdmin entrypoint={entrypoint} />
);

export default Basic;

export interface BasicProps extends Pick<HydraAdminProps, 'entrypoint'> {}
