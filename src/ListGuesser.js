import React, {Children} from 'react';
import PropTypes from 'prop-types';
import {Datagrid, List, Query, EditButton, ShowButton} from 'react-admin';
import fieldFactory from './fieldFactory';
import {getResource} from './docsUtils';

const getFields = (
  {fields},
  allowedFieldNames = fields.map(defaultField => defaultField.name),
) => fields.filter(({name}) => allowedFieldNames.includes(name));

const ListGuesser = props => {
  const children = Children.toArray(props.children);
  const {
    resource: resourceName,
    fields: allowedFieldNames,
    hasEdit,
    hasShow,
  } = props;

  return (
    <Query type="INTROSPECT">
      {({data: api, loading, error}) => {
        if (loading) {
          return <div>LOADING</div>;
        }

        if (error) {
          console.log(error);

          return <div>ERROR</div>;
        }

        const resource = getResource(api.resources, resourceName);

        return (
          <List {...props}>
            <Datagrid>
              {getFields(resource, allowedFieldNames).map(field => {
                const child = children.find(
                  ({props: {source}}) => source === field.name,
                );
                if (undefined === child) {
                  return fieldFactory(field, {resource});
                }

                return child;
              })}
              {hasShow && <ShowButton />}
              {hasEdit && <EditButton />}
            </Datagrid>
          </List>
        );
      }}
    </Query>
  );
};

export default ListGuesser;

ListGuesser.propTypes = {
  children: PropTypes.object,
  resource: PropTypes.string.isRequired,
  fields: PropTypes.array,
};
