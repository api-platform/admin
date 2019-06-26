import React from 'react';
import {Resource, ListGuesser, EditGuesser} from 'react-admin';

const ResourceGuesser = ({list, edit, ...props}) => (
  <Resource list={list || ListGuesser} edit={edit || EditGuesser} {...props} />
);

export default ResourceGuesser;
