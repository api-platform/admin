import React from 'react';
import { Layout } from 'react-admin';
import AppBar from './AppBar';

const CustomLayout = props => <Layout appBar={AppBar} {...props} />;

export default CustomLayout;
