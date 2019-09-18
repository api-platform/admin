import React, {Children} from 'react';
import PropTypes from 'prop-types';
import {Datagrid, List, EditButton, ShowButton} from 'react-admin';
import {getOrderParametersFromResourceSchema} from './docsUtils';
import FieldGuesser from './FieldGuesser';
import FilterGuesser from './FilterGuesser';
import WithReactAdminQuery from './withReactAdminQuery';

class ListGuesserComponent extends React.Component {
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
    const {resourceSchema, fields, hasShow, hasEdit, ...props} = this.props;
    const children = Children.toArray(props.children);
    return (
      <List {...props}>
        <Datagrid>
          {children}
          {fields.map(field => (
            <FieldGuesser
              key={field.name}
              source={field.name}
              sortable={this.state.orderParameters.includes(field.name)}
            />
          ))}
          {hasShow && <ShowButton />}
          {hasEdit && <EditButton />}
        </Datagrid>
      </List>
    );
  }
}

const ListGuesser = props => (
  <WithReactAdminQuery component={ListGuesserComponent} {...props} />
);

export default ListGuesser;

ListGuesser.propTypes = {
  children: PropTypes.object,
  resource: PropTypes.string.isRequired,
  fields: PropTypes.array,
  filters: PropTypes.object.isRequired,
};

ListGuesser.defaultProps = {
  filters: <FilterGuesser />,
};
