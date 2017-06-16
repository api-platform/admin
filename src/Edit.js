import React, {Component} from 'react';
import {Edit as BaseEdit, SimpleForm, DisabledInput} from 'admin-on-rest';
import inputFactory from './inputFactory';

export default class Edit extends Component {
  render() {
    const factory = this.props.options.inputFactory ? this.props.options.inputFactory : inputFactory;

    return <BaseEdit {...this.props}>
      <SimpleForm>
      <DisabledInput source="id"/>
        {this.props.options.resource.readableFields.map(field => factory(field, this.props.options.resource, 'edit', this.props.options.api))}
      </SimpleForm>
    </BaseEdit>
  }
}
