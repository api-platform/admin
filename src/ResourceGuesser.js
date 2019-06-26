import React from 'react';
import {Resource} from 'react-admin';
import ListGuesser from './ListGuesser';
import CreateGuesser from './CreateGuesser';
import EditGuesser from './EditGuesser';

const ResourceGuesser = ({list, edit, create, ...props}) => (
  <Resource
    list={list || ListGuesser}
    create={create || CreateGuesser}
    edit={edit || EditGuesser}
    {...props}
  />
);

export default ResourceGuesser;
