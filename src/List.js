import React, {Component} from 'react';
import {List as BaseList, Datagrid, TextField, ShowButton, EditButton} from 'admin-on-rest/lib/mui';
import Resource from 'api-doc-parser/lib/Resource';
import fieldFactory from './fieldFactory';

export default class List extends Component {
  static defaultProps = {
    perPage: 30 // Default value in API Platform
  };

  static propTypes = {
    options: React.PropTypes.shape({
      inputFactory: React.PropTypes.func,
      resource: React.PropTypes.instanceOf(Resource),
    }),
    ...BaseList.propTypes,
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
