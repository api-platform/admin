import React from 'react';
import {Resource, ListGuesser} from 'react-admin';
import EditGuesser from './EditGuesser';

const ResourceGuesser = ({list, edit, ...props}) => (
  <Resource list={list || ListGuesser} edit={edit || EditGuesser} {...props} />
);

export default ResourceGuesser;
