import Api from '@api-platform/api-doc-parser/lib/Api';
import Resource from '@api-platform/api-doc-parser/lib/Resource';
import {
  Datagrid,
  EditButton,
  List as BaseList,
  ShowButton,
  TextField,
} from 'admin-on-rest';
import PropTypes from 'prop-types';
import React from 'react';

const List = props => {
  const {hasEdit, hasShow, options: {api, fieldFactory, resource}} = props;

  return (
    <BaseList {...props}>
      <Datagrid>
        <TextField source="id" />
        {resource.readableFields.map(field =>
          fieldFactory(field, {
            action: 'list',
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
  options: PropTypes.shape({
    api: PropTypes.instanceOf(Api).isRequired,
    fieldFactory: PropTypes.func.isRequired,
    resource: PropTypes.instanceOf(Resource).isRequired,
  }),
  perPage: PropTypes.number,
  hasEdit: PropTypes.bool.isRequired,
  hasShow: PropTypes.bool.isRequired,
};

export default List;
