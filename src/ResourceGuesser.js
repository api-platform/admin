import React from 'react';
import {Resource} from 'react-admin';
import ListGuesser from './ListGuesser';
import CreateGuesser from './CreateGuesser';
import EditGuesser from './EditGuesser';
import ShowGuesser from './ShowGuesser';

const ResourceGuesser = ({list, edit, create, show, ...props}) => (
  <Resource
    list={list || ListGuesser}
    create={create || CreateGuesser}
    edit={edit || EditGuesser}
    show={show || ShowGuesser}
    {...props}
  />
);

export default ResourceGuesser;
