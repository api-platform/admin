import React from 'react';
import {Resource} from 'react-admin';
import ListGuesser from './ListGuesser';
import CreateGuesser from './CreateGuesser';
import EditGuesser from './EditGuesser';
import ShowGuesser from './ShowGuesser';

const ResourceGuesser = ({list, edit, create, show, ...props}) => (
  <Resource
    {...props}
    create={create || CreateGuesser}
    edit={edit || EditGuesser}
    list={list || ListGuesser}
    show={show || ShowGuesser}
  />
);

export default ResourceGuesser;
