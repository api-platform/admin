import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Datagrid, List, EditButton, ShowButton } from 'react-admin';
import FieldGuesser from './FieldGuesser';
import FilterGuesser from './FilterGuesser';
import Introspecter from './Introspecter';
import Pagination from './list/Pagination';

const displayOverrideCode = (schema, fields) => {
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

export const IntrospectedListGuesser = ({
  fields,
  readableFields,
  writableFields,
  schema,
  schemaAnalyzer,
  children,
  ...props
}) => {
  const [orderParameters, setOrderParameters] = useState([]);

  useEffect(() => {
    if (schema) {
      schemaAnalyzer
        .getOrderParametersFromSchema(schema)
        .then((parameters) => setOrderParameters(parameters));
    }
  }, []);

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
      <Datagrid>
        {fieldChildren}
        {props.hasShow && <ShowButton />}
        {props.hasEdit && <EditButton />}
      </Datagrid>
    </List>
  );
};

const ListGuesser = (props) => (
  <Introspecter component={IntrospectedListGuesser} {...props} />
);

ListGuesser.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  resource: PropTypes.string.isRequired,
  filters: PropTypes.element,
};

ListGuesser.defaultProps = {
  filters: <FilterGuesser />,
};

export default ListGuesser;
