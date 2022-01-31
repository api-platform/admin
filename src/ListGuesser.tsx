import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Datagrid,
  List,
  EditButton,
  ShowButton,
  DatagridBody,
  DatagridBodyProps,
  DatagridProps,
  ListProps,
  useCheckMinimumRequiredProps,
} from 'react-admin';
import { Field, Resource } from '@api-platform/api-doc-parser';
import FieldGuesser from './FieldGuesser';
import FilterGuesser from './FilterGuesser';
import Introspecter, { BaseIntrospecterProps } from './Introspecter';
import Pagination from './list/Pagination';
import useMercureSubscription from './useMercureSubscription';
import { IntrospectedGuesserProps } from './types';

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
  console.info(code);
};

type ListDatagridProps = ListProps & DatagridProps;

type IntrospectedListGuesserProps = ListDatagridProps &
  IntrospectedGuesserProps;

export type ListGuesserProps = Omit<
  ListDatagridProps & BaseIntrospecterProps,
  'component' | 'resource'
> &
  Partial<Pick<BaseIntrospecterProps, 'resource'>>;

export const DatagridBodyWithMercure = (props: DatagridBodyProps) => {
  useMercureSubscription(props.resource, props.ids);

  return <DatagridBody {...props} />;
};

export const IntrospectedListGuesser = ({
  fields,
  readableFields,
  writableFields,
  schema,
  schemaAnalyzer,
  rowClick,
  rowStyle,
  isRowSelectable,
  body = DatagridBodyWithMercure,
  expand,
  optimized,
  children,
  ...props
}: IntrospectedListGuesserProps) => {
  const [orderParameters, setOrderParameters] = useState<string[]>([]);

  useEffect(() => {
    if (schema) {
      schemaAnalyzer
        .getOrderParametersFromSchema(schema)
        .then((parameters) => setOrderParameters(parameters));
    }
  }, [schema, schemaAnalyzer]);

  let fieldChildren = children;
  if (!fieldChildren) {
    fieldChildren = readableFields.map((field) => {
      const orderField = orderParameters.find(
        (orderParameter) => orderParameter.split('.')[0] === field.name,
      );

      return (
        <FieldGuesser
          key={field.name}
          source={field.name}
          sortable={!!orderField}
          sortBy={orderField}
          resource={props.resource}
        />
      );
    });
    displayOverrideCode(schema, readableFields);
  }

  return (
    <List pagination={<Pagination />} {...props}>
      <Datagrid
        rowClick={rowClick}
        rowStyle={rowStyle}
        isRowSelectable={isRowSelectable}
        body={body}
        expand={expand}
        optimized={optimized}>
        {fieldChildren}
        {props.hasShow && <ShowButton />}
        {props.hasEdit && <EditButton />}
      </Datagrid>
    </List>
  );
};

const ListGuesser = ({
  filters = <FilterGuesser />,
  ...props
}: ListGuesserProps) => {
  useCheckMinimumRequiredProps('ListGuesser', ['resource'], props);
  if (!props.resource) {
    return null;
  }

  return (
    <Introspecter
      component={IntrospectedListGuesser}
      resource={props.resource}
      filters={filters}
      {...props}
    />
  );
};

ListGuesser.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  resource: PropTypes.string.isRequired,
  filters: PropTypes.element,
  hasShow: PropTypes.bool,
  hasEdit: PropTypes.bool,
  rowClick: PropTypes.string,
};

export default ListGuesser;
