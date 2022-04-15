import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Datagrid,
  DatagridBody,
  EditButton,
  List,
  ShowButton,
  useResourceContext,
  useResourceDefinition,
} from 'react-admin';
import type { DatagridBodyProps } from 'react-admin';
import type { Field, Resource } from '@api-platform/api-doc-parser';

import FieldGuesser from './FieldGuesser';
import FilterGuesser from './FilterGuesser';
import Introspecter from './Introspecter';
import useMercureSubscription from './useMercureSubscription';
import type {
  ApiPlatformAdminRecord,
  IntrospectedListGuesserProps,
  ListGuesserProps,
} from './types';

const displayOverrideCode = (schema: Resource, fields: Field[]) => {
  if (process.env.NODE_ENV === 'production') return;

  let code =
    'If you want to override at least one field, paste this content in the <ListGuesser> component of your resource:\n\n';

  code += `const ${schema.title}List = props => (\n`;
  code += `    <ListGuesser {...props}>\n`;

  fields.forEach((field) => {
    code += `        <FieldGuesser source={"${field.name}"} />\n`;
  });
  code += `    </ListGuesser>\n`;
  code += `);\n`;
  code += `\n`;
  code += `And don't forget update your <ResourceGuesser> component:\n`;
  code += `<ResourceGuesser name={"${schema.name}"} list={${schema.title}List} />`;
  // eslint-disable-next-line no-console
  console.info(code);
};

export const DatagridBodyWithMercure = (props: DatagridBodyProps) => {
  const { data } = props;
  const resource = useResourceContext(props);
  useMercureSubscription(
    resource,
    data?.map((record: ApiPlatformAdminRecord) => record.id),
  );

  return <DatagridBody {...props} />;
};

export const IntrospectedListGuesser = ({
  fields,
  readableFields,
  writableFields,
  schema,
  schemaAnalyzer,
  datagridSx,
  bulkActionButtons,
  rowClick,
  rowStyle,
  isRowSelectable,
  isRowExpandable,
  body = DatagridBodyWithMercure,
  header,
  empty,
  hover,
  expand,
  optimized,
  size,
  children,
  ...props
}: IntrospectedListGuesserProps) => {
  const { hasShow, hasEdit } = useResourceDefinition(props);
  const [orderParameters, setOrderParameters] = useState<
    string[] | undefined
  >();

  useEffect(() => {
    if (schema) {
      schemaAnalyzer.getOrderParametersFromSchema(schema).then((parameters) => {
        setOrderParameters(parameters);
      });
    }
  }, [schema, schemaAnalyzer]);

  let fieldChildren = children;
  if (!fieldChildren) {
    fieldChildren = readableFields.map((field) => {
      const orderField = (orderParameters ?? []).find(
        (orderParameter) => orderParameter.split('.')[0] === field.name,
      );

      return (
        <FieldGuesser
          key={field.name + (orderField ? `-${orderField}` : '')}
          source={field.name}
          sortable={!!orderField}
          sortBy={orderField}
          resource={props.resource}
        />
      );
    });
    if (orderParameters !== undefined) {
      displayOverrideCode(schema, readableFields);
    }
  }

  return (
    <List {...props}>
      <Datagrid
        bulkActionButtons={bulkActionButtons}
        rowClick={rowClick}
        rowStyle={rowStyle}
        isRowSelectable={isRowSelectable}
        isRowExpandable={isRowExpandable}
        body={body}
        header={header}
        empty={empty}
        hover={hover}
        expand={expand}
        optimized={optimized}
        size={size}
        sx={datagridSx}>
        {fieldChildren}
        {hasShow && <ShowButton />}
        {hasEdit && <EditButton />}
      </Datagrid>
    </List>
  );
};

const ListGuesser = ({
  filters = <FilterGuesser />,
  ...props
}: ListGuesserProps) => {
  const resource = useResourceContext(props);

  return (
    <Introspecter
      component={IntrospectedListGuesser}
      resource={resource}
      filters={filters}
      {...props}
    />
  );
};

/* eslint-disable tree-shaking/no-side-effects-in-initialization */
ListGuesser.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  resource: PropTypes.string,
  filters: PropTypes.element,
  hasShow: PropTypes.bool,
  hasEdit: PropTypes.bool,
  rowClick: PropTypes.string,
};
/* eslint-enable tree-shaking/no-side-effects-in-initialization */

export default ListGuesser;
