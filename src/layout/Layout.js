import AppBar from './AppBar';
import {Layout} from 'react-admin';
import React from 'react';

const CustomLayout = props => <Layout appBar={AppBar} {...props} />;

export default CustomLayout;
