import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Resource,
  useResourceDefinition,
  useResourceDefinitionContext,
} from 'react-admin';
import type { ResourceDefinition, ResourceProps } from 'react-admin';
import ListGuesser from './ListGuesser';
import CreateGuesser from './CreateGuesser';
import EditGuesser from './EditGuesser';
import ShowGuesser from './ShowGuesser';
import Introspecter from './Introspecter';
import type {
  IntrospectedResourceGuesserProps,
  ResourceGuesserProps,
} from './types';

export const IntrospectedResourceGuesser = ({
  resource,
  schema,
  schemaAnalyzer,
  list = ListGuesser,
  edit = EditGuesser,
  create = CreateGuesser,
  show = ShowGuesser,
  ...props
}: IntrospectedResourceGuesserProps) => {
  const { register } = useResourceDefinitionContext();
  const registeredDefinition = useResourceDefinition({ resource });

  let hasList = false;
  let hasEdit = false;
  let hasCreate = false;
  let hasShow = false;
  schema.operations?.forEach((operation) => {
    if (operation.type === 'list') {
      hasList = true;
    }
    if (operation.type === 'edit') {
      hasEdit = true;
    }
    if (operation.type === 'create') {
      hasCreate = true;
    }
    if (operation.type === 'show') {
      hasShow = true;
    }
  });

  useEffect(() => {
    if (
      registeredDefinition.hasList !== hasList ||
      registeredDefinition.hasEdit !== hasEdit ||
      registeredDefinition.hasCreate !== hasCreate ||
      registeredDefinition.hasShow !== hasShow
    ) {
      register({
        name: resource,
        icon: props.icon,
        options: props.options,
        hasList,
        hasEdit,
        hasCreate,
        hasShow,
      });
    }
  }, [
    register,
    resource,
    props.icon,
    props.options,
    hasList,
    hasEdit,
    hasCreate,
    hasShow,
    registeredDefinition,
  ]);

  return (
    <Resource
      {...props}
      name={resource}
      create={create}
      edit={edit}
      list={list}
      show={show}
    />
  );
};

const ResourceGuesser = ({ name, ...props }: ResourceGuesserProps) => (
  <Introspecter
    component={IntrospectedResourceGuesser}
    resource={name}
    {...props}
  />
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
