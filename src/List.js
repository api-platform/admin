import React, {Component} from 'react';
import {List as BaseList, Datagrid, TextField, ShowButton, EditButton} from 'admin-on-rest/lib/mui';
import fieldFactory from './fieldFactory';

export default class List extends Component {
  static defaultProps = {
    perPage: 30 // Default value in API Platform
  };
  static propTypes = {
    perPage: React.PropTypes.number
  };

  render() {
    const factory = this.props.options.fieldFactory ? this.props.options.fieldFactory : fieldFactory;

    return <BaseList {...this.props}>
      <Datagrid>
        <TextField source="id"/>
        {this.props.options.resource.readableFields.map(field => factory(field, this.props.options.resource, 'list', this.props.options.api))}
        <ShowButton />
        <EditButton />
      </Datagrid>
    </BaseList>
  }
}
