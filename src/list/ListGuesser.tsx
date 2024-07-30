import React, { useEffect, useState } from 'react';
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

import FieldGuesser from '../field/FieldGuesser.js';
import FilterGuesser from './FilterGuesser.js';
import Introspecter from '../introspection/Introspecter.js';
import useMercureSubscription from '../mercure/useMercureSubscription.js';
import useDisplayOverrideCode from '../useDisplayOverrideCode.js';
import type {
  ApiPlatformAdminRecord,
  IntrospectedListGuesserProps,
  ListGuesserProps,
} from '../types.js';

const getOverrideCode = (schema: Resource, fields: Field[]) => {
  let code = `If you want to override at least one field, create a ${schema.title}List component with this content:\n`;
  code += `\n`;
  code += `import { ListGuesser, FieldGuesser } from "@api-platform/admin";\n`;
  code += `\n`;
  code += `export const ${schema.title}List = () => (\n`;
  code += `    <ListGuesser>\n`;
  fields.forEach((field) => {
    code += `        <FieldGuesser source="${field.name}" />\n`;
  });
  code += `    </ListGuesser>\n`;
  code += `);\n`;
  code += `\n`;
  code += `Then, update your main admin component:\n`;
  code += `\n`;
  code += `import { HydraAdmin, ResourceGuesser } from "@api-platform/admin";\n`;
  code += `import { ${schema.title}List } from './${schema.title}List';\n`;
  code += `\n`;
  code += `const App = () => (\n`;
  code += `    <HydraAdmin entrypoint={...}>\n`;
  code += `        <ResourceGuesser name="${schema.name}" list={${schema.title}List} />\n`;
  code += `        {/* ... */}\n`;
  code += `    </HydraAdmin>\n`;
  code += `);\n`;

  return code;
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
  expandSingle,
  optimized,
  size,
  children,
  ...props
}: IntrospectedListGuesserProps) => {
  const { hasShow, hasEdit } = useResourceDefinition(props);
  const [orderParameters, setOrderParameters] = useState<string[]>([]);

  useEffect(() => {
    if (schema) {
      schemaAnalyzer.getOrderParametersFromSchema(schema).then((parameters) => {
        setOrderParameters(parameters);
      });
    }
  }, [schema, schemaAnalyzer]);

  const displayOverrideCode = useDisplayOverrideCode();

  let fieldChildren = children;
  if (!fieldChildren) {
    fieldChildren = readableFields.map((field) => {
      const orderField = orderParameters.find(
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

    displayOverrideCode(getOverrideCode(schema, readableFields));
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
        expandSingle={expandSingle}
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
  if (!resource) {
    throw new Error('ListGuesser must be used with a resource');
  }

  return (
    <Introspecter
      component={IntrospectedListGuesser}
      resource={resource}
      filters={filters}
      {...props}
    />
  );
};

export default ListGuesser;
