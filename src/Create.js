import React, {Component} from 'react';
import {Create as BaseCreate, SimpleForm} from 'admin-on-rest/lib/mui';
import inputFactory from './inputFactory';

export default class Create extends Component {
  render() {
    const factory = this.props.options.inputFactory ? this.props.options.inputFactory : inputFactory;

    return <BaseCreate {...this.props}>
      <SimpleForm>
        {this.props.options.resource.readableFields.map(field => factory(field, this.props.options.resource, 'create', this.props.options.api))}
      </SimpleForm>
    </BaseCreate>
  }
}
