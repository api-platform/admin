import React from 'react';
import PropTypes from 'prop-types';
import { Resource } from 'react-admin';
import type { ResourceProps } from 'react-admin';
import ListGuesser from './ListGuesser';
import CreateGuesser from './CreateGuesser';
import EditGuesser from './EditGuesser';
import ShowGuesser from './ShowGuesser';

const ResourceGuesser = ({
  list,
  edit,
  create,
  show,
  ...props
}: ResourceProps) => (
  <Resource
    {...props}
    create={undefined === create ? CreateGuesser : create}
    edit={undefined === edit ? EditGuesser : edit}
    list={undefined === list ? ListGuesser : list}
    show={undefined === show ? ShowGuesser : show}
  />
);

ResourceGuesser.propTypes = {
  name: PropTypes.string.isRequired,
};

export default ResourceGuesser;
