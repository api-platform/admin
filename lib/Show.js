import _classCallCheck from 'babel-runtime/helpers/classCallCheck';
import _possibleConstructorReturn from 'babel-runtime/helpers/possibleConstructorReturn';
import _inherits from 'babel-runtime/helpers/inherits';
import React, { Component } from 'react';
import { Show as BaseShow, SimpleShowLayout, TextField } from 'admin-on-rest';
import fieldFactory from './fieldFactory';

var _class = function (_Component) {
  _inherits(_class, _Component);

  function _class() {
    _classCallCheck(this, _class);

    return _possibleConstructorReturn(this, _Component.apply(this, arguments));
  }

  _class.prototype.render = function render() {
    var _this2 = this;

    var factory = this.props.options.fieldFactory ? this.props.options.fieldFactory : fieldFactory;

    return React.createElement(
      BaseShow,
      this.props,
      React.createElement(
        SimpleShowLayout,
        null,
        React.createElement(TextField, { source: 'id' }),
        this.props.options.resource.readableFields.map(function (field) {
          return factory(field, _this2.props.options.resource, 'show', _this2.props.options.api);
        })
      )
    );
  };

  return _class;
}(Component);

export default _class;