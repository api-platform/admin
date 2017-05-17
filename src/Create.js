import React, {Component} from 'react';
import {Create as BaseCreate, SimpleForm} from 'admin-on-rest/lib/mui';
import Resource from 'api-doc-parser/lib/Resource';
import inputFactory from './inputFactory';

export default class Create extends Component {
  static propTypes = {
    options: React.PropTypes.shape({
      inputFactory: React.PropTypes.func,
      resource: React.PropTypes.instanceOf(Resource),
    }),
    ...BaseCreate.propTypes,
  };

  render() {
    const factory = this.props.options.inputFactory ? this.props.options.inputFactory : inputFactory;

    return <BaseCreate {...this.props}>
      <SimpleForm>
        {this.props.options.resource.readableFields.map(field => factory(field, this.props.options.resource, 'create', this.props.options.api))}
      </SimpleForm>
    </BaseCreate>
  }
}
