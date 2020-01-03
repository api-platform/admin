import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {Datagrid, List, EditButton, ShowButton} from 'react-admin';
import {getOrderParametersFromResourceSchema} from './docsUtils';
import FieldGuesser from './FieldGuesser';
import FilterGuesser from './FilterGuesser';
import Introspecter from './Introspecter';

const displayOverrideCode = (resourceSchema, fields) => {
  if (process.env.NODE_ENV === 'production') return;

  let code =
    'If you want to override at least one field, paste this content in the <ListGuesser> component of your resource:\n\n';

  code += `const ${resourceSchema.title}List = props => (\n`;
  code += `    <ListGuesser {...props}>\n`;

  fields.forEach(field => {
    code += `        <FieldGuesser source={"${field.name}"} />\n`;
  });
  code += `    </ListGuesser>\n`;
  code += `);\n`;
  code += `\n`;
  code += `And don't forget update your <ResourceGuesser> component:\n`;
  code += `<ResourceGuesser name={"${resourceSchema.name}"} list={${resourceSchema.title}List} />`;
  console.info(code);
};

export const ListGuesserComponent = ({
  children,
  resourceSchema,
  fields,
  ...props
}) => {
  const [orderParameters, setOrderParameters] = useState([]);

  useEffect(() => {
    if (resourceSchema) {
      const resolvedOrderParameters = getOrderParametersFromResourceSchema(
        resourceSchema,
      );

      setOrderParameters(resolvedOrderParameters);

      if (!resolvedOrderParameters.length) {
        resourceSchema
          .getParameters()
          .then(() =>
            setOrderParameters(
              getOrderParametersFromResourceSchema(resourceSchema),
            ),
          );
      }
    }
  }, []);

  if (!children) {
    children = fields.map(field => (
      <FieldGuesser
        key={field.name}
        source={field.name}
        sortable={orderParameters.includes(field.name)}
        resource={props.resource}
      />
    ));
    displayOverrideCode(resourceSchema, fields);
  }

  return (
    <List {...props}>
      <Datagrid>
        {children}
        {props.hasShow && <ShowButton />}
        {props.hasEdit && <EditButton />}
      </Datagrid>
    </List>
  );
};

const ListGuesser = props => (
  <Introspecter component={ListGuesserComponent} {...props} />
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
