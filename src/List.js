import Api from '@api-platform/api-doc-parser/lib/Api';
import Resource from '@api-platform/api-doc-parser/lib/Resource';
import {
  Datagrid,
  EditButton,
  List as BaseList,
  ShowButton,
  TextField,
} from 'react-admin';
import PropTypes from 'prop-types';
import React from 'react';

const hasIdentifier = fields => {
  return (
    undefined !== fields.find(({id}) => 'http://schema.org/identifier' === id)
  );
};

const resolveProps = props => {
  const {options} = props;
  const {fieldFactory: defaultFieldFactory, resource} = options;
  const {
    listFields: customFields,
    listProps = {},
    readableFields: defaultFields,
  } = resource;
  const {options: {fieldFactory: customFieldFactory} = {}} = listProps;

  return {
    ...props,
    ...listProps,
    options: {
      ...options,
      fields:
        customFields || defaultFields.filter(({deprecated}) => !deprecated),
      fieldFactory: customFieldFactory || defaultFieldFactory,
    },
  };
};

const List = props => {
  const {
    hasEdit,
    hasShow,
    options: {api, fieldFactory, fields, resource},
    addIdField = false === hasIdentifier(fields),
  } = resolveProps(props);

  return (
    <BaseList {...props}>
      <Datagrid>
        {addIdField && <TextField source="id" />}
        {fields.map(field =>
          fieldFactory(field, {
            api,
            resource,
          }),
        )}
        {hasShow && <ShowButton />}
        {hasEdit && <EditButton />}
      </Datagrid>
    </BaseList>
  );
};

List.defaultProps = {
  perPage: 30, // Default value in API Platform
};

List.propTypes = {
  addIdField: PropTypes.bool,
  options: PropTypes.shape({
    api: PropTypes.instanceOf(Api).isRequired,
    fieldFactory: PropTypes.func.isRequired,
    listProps: PropTypes.object,
    resource: PropTypes.instanceOf(Resource).isRequired,
  }),
  perPage: PropTypes.number,
  hasEdit: PropTypes.bool.isRequired,
  hasShow: PropTypes.bool.isRequired,
};

export default List;
