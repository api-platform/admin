import React from 'react';
import PropTypes from 'prop-types';
import { Resource } from 'react-admin';
import type { ResourceDefinition, ResourceProps } from 'react-admin';
import ListGuesser from './ListGuesser';
import CreateGuesser from './CreateGuesser';
import EditGuesser from './EditGuesser';
import ShowGuesser from './ShowGuesser';

const ResourceGuesser = ({
  list = ListGuesser,
  edit = EditGuesser,
  create = CreateGuesser,
  show = ShowGuesser,
  ...props
}: ResourceProps) => (
  <Resource {...props} create={create} edit={edit} list={list} show={show} />
);

ResourceGuesser.raName = 'Resource';

ResourceGuesser.registerResource = (
  props: ResourceProps,
): ResourceDefinition => ({
  name: props.name,
  icon: props.icon,
  options: props.options,
  hasList: true,
  hasEdit: true,
  hasCreate: true,
  hasShow: true,
});

ResourceGuesser.propTypes = {
  name: PropTypes.string.isRequired,
};

export default ResourceGuesser;
