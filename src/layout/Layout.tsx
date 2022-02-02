import React from 'react';
import { Layout } from 'react-admin';
import type { LayoutProps } from 'react-admin';
import AppBar from './AppBar';

const CustomLayout = (props: LayoutProps) => (
  <Layout appBar={AppBar} {...props} />
);

export default CustomLayout;
