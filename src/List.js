import React, {Component} from 'react';
import PropTypes from 'prop-types';
import * as admin from 'admin-on-rest';
import {List as BaseList, Datagrid, TextField, ShowButton, EditButton} from 'admin-on-rest';
import fieldFactory from './fieldFactory';

export default class List extends Component {
  static defaultProps = {
    perPage: 30 // Default value in API Platform
  };
  static propTypes = {
    perPage: PropTypes.number
  };

  render() {
    const factory = this.props.options.fieldFactory ? this.props.options.fieldFactory : fieldFactory;

    console.log(admin.Datagrid);

    return <div>WTF?</div>;
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
