import _classCallCheck from 'babel-runtime/helpers/classCallCheck';
import _possibleConstructorReturn from 'babel-runtime/helpers/possibleConstructorReturn';
import _inherits from 'babel-runtime/helpers/inherits';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List as BaseList, Datagrid, TextField, ShowButton, EditButton } from 'admin-on-rest';
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
      BaseList,
      this.props,
      React.createElement(
        Datagrid,
        null,
        React.createElement(TextField, { source: 'id' }),
        this.props.options.resource.readableFields.map(function (field) {
          return factory(field, _this2.props.options.resource, 'list', _this2.props.options.api);
        }),
        React.createElement(ShowButton, null),
        React.createElement(EditButton, null)
      )
    );
  };

  return _class;
}(Component);

_class.defaultProps = {
  perPage: 30 // Default value in API Platform
};
_class.propTypes = {
  perPage: PropTypes.number
};
export default _class;