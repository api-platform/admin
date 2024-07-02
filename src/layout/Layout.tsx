import type { FunctionComponent } from 'react';
import React from 'react';
import { Layout } from 'react-admin';
import type { LayoutProps } from 'react-admin';

import AppBar from './AppBar.js';
import Error from './Error.js';

const CustomLayout = (props: LayoutProps) => (
  <Layout appBar={AppBar} error={Error as FunctionComponent} {...props} />
);

export default CustomLayout;
