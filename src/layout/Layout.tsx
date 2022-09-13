import React from 'react';
import { Layout } from 'react-admin';
import type { LayoutProps } from 'react-admin';
import AppBar from './AppBar.js';
import DefaultError from './Error.js';

const CustomLayout = (props: LayoutProps) => (
  <Layout appBar={AppBar} error={DefaultError} {...props} />
);

export default CustomLayout;
