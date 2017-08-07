import _classCallCheck from 'babel-runtime/helpers/classCallCheck';
import _possibleConstructorReturn from 'babel-runtime/helpers/possibleConstructorReturn';
import _inherits from 'babel-runtime/helpers/inherits';
import React, { Component } from 'react';
import { Edit as BaseEdit, SimpleForm, DisabledInput } from 'admin-on-rest';
import inputFactory from './inputFactory';

var _class = function (_Component) {
  _inherits(_class, _Component);

  function _class() {
    _classCallCheck(this, _class);

    return _possibleConstructorReturn(this, _Component.apply(this, arguments));
  }

  _class.prototype.render = function render() {
    var _this2 = this;

    var factory = this.props.options.inputFactory ? this.props.options.inputFactory : inputFactory;

    return React.createElement(
      BaseEdit,
      this.props,
      React.createElement(
        SimpleForm,
        null,
        React.createElement(DisabledInput, { source: 'id' }),
        this.props.options.resource.writableFields.map(function (field) {
          return factory(field, _this2.props.options.resource, 'edit', _this2.props.options.api);
        })
      )
    );
  };

  return _class;
}(Component);

export default _class;