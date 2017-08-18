import _extends from 'babel-runtime/helpers/extends';
import _classCallCheck from 'babel-runtime/helpers/classCallCheck';
import _possibleConstructorReturn from 'babel-runtime/helpers/possibleConstructorReturn';
import _inherits from 'babel-runtime/helpers/inherits';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Admin, Resource, Delete } from 'admin-on-rest';
import Api from 'api-doc-parser/lib/Api';
import List from './List';
import Show from './Show';
import Create from './Create';
import Edit from './Edit';

var _class = function (_Component) {
  _inherits(_class, _Component);

  function _class() {
    _classCallCheck(this, _class);

    return _possibleConstructorReturn(this, _Component.apply(this, arguments));
  }

  _class.prototype.render = function render() {
    var _this2 = this;

    var props = _extends({}, this.props);
    if (!props.title) props.title = this.props.api.title;

    return React.createElement(
      Admin,
      props,
      this.props.api.resources.map(function (resource) {
        return React.createElement(Resource, _extends({
          options: { api: _this2.props.api, resource: resource },
          key: resource.name,
          name: resource.name,
          list: List,
          show: Show,
          create: Create,
          edit: Edit,
          remove: Delete
        }, resource.props));
      })
    );
  };

  return _class;
}(Component);

_class.propTypes = {
  api: PropTypes.instanceOf(Api).isRequired,
  restClient: PropTypes.func.isRequired
};
export default _class;