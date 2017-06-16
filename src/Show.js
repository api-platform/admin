import React, {Component} from 'react';
import {Show as BaseShow, SimpleShowLayout, TextField} from 'admin-on-rest';
import fieldFactory from './fieldFactory';

export default class Show extends Component {
  render() {
    const factory = this.props.options.fieldFactory ? this.props.options.fieldFactory : fieldFactory;

    return <BaseShow {...this.props}>
      <SimpleShowLayout>
        <TextField source="id"/>
        {this.props.options.resource.readableFields.map(field => factory(field, this.props.options.resource, 'show', this.props.options.api))}
      </SimpleShowLayout>
    </BaseShow>
  }
}
