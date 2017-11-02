import Api from '@api-platform/api-doc-parser/lib/Api';
import {Admin, Delete, Resource} from 'admin-on-rest';
import PropTypes from 'prop-types';
import React from 'react';
import Create from './Create';
import Edit from './Edit';
import fieldFactory from './fieldFactory';
import inputFactory from './inputFactory';
import List from './List';
import Show from './Show';

const AdminBuilder = props => {
  const {api, fieldFactory, inputFactory, title = api.title} = props;

  return (
    <Admin {...props} title={title}>
      {api.resources.map(resource => {
        const {
          create = Create,
          edit = Edit,
          list = List,
          name,
          props,
          remove = Delete,
          show = Show,
        } = resource;
        return (
          <Resource
            {...props}
            create={create}
            edit={edit}
            key={name}
            list={list}
            name={name}
            options={{
              api,
              fieldFactory,
              inputFactory,
              resource,
            }}
            remove={remove}
            show={show}
          />
        );
      })}
    </Admin>
  );
};

AdminBuilder.defaultProps = {
  fieldFactory,
  inputFactory,
};

AdminBuilder.propTypes = {
  api: PropTypes.instanceOf(Api).isRequired,
  fieldFactory: PropTypes.func,
  inputFactory: PropTypes.func,
  restClient: PropTypes.func.isRequired,
};

export default AdminBuilder;
