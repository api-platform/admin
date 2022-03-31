import React from 'react';
import { Layout } from 'react-admin';
import type { LayoutProps } from 'react-admin';
import AppBar from './AppBar';
import DefaultError from './Error';

const CustomLayout = (props: LayoutProps) => (
  <Layout appBar={AppBar} error={DefaultError} {...props} />
);

export default CustomLayout;
