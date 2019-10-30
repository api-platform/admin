import React from 'react';
import PropTypes from 'prop-types';
import {Datagrid, List, EditButton, ShowButton} from 'react-admin';
import {getOrderParametersFromResourceSchema} from './docsUtils';
import FieldGuesser from './FieldGuesser';
import FilterGuesser from './FilterGuesser';
import IntrospectQuery from './IntrospectQuery';

const displayOverrideCode = (resourceSchema, fields) => {
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

export class ListGuesserComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      orderParameters: this.props.resourceSchema
        ? getOrderParametersFromResourceSchema(this.props.resourceSchema)
        : [],
    };
  }

  componentDidMount() {
    if (this.state.orderParameters.length) {
      return;
    }

    this.props.resourceSchema.getParameters().then(() => {
      this.setState({
        orderParameters: getOrderParametersFromResourceSchema(
          this.props.resourceSchema,
        ),
      });
    });
  }

  render() {
    const {resourceSchema, fields, ...props} = this.props;

    if (!props.children) {
      props.children = fields.map(field => (
        <FieldGuesser
          key={field.name}
          source={field.name}
          sortable={this.state.orderParameters.includes(field.name)}
        />
      ));
      displayOverrideCode(resourceSchema, fields);
    }

    return (
      <List {...props}>
        <Datagrid>
          {props.children}
          {props.hasShow && <ShowButton />}
          {props.hasEdit && <EditButton />}
        </Datagrid>
      </List>
    );
  }
}

const ListGuesser = props => (
  <IntrospectQuery component={ListGuesserComponent} {...props} />
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
