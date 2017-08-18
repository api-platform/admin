import _extends from 'babel-runtime/helpers/extends';
import _classCallCheck from 'babel-runtime/helpers/classCallCheck';
import _possibleConstructorReturn from 'babel-runtime/helpers/possibleConstructorReturn';
import _inherits from 'babel-runtime/helpers/inherits';
import apiDocumentationParser from 'api-doc-parser/lib/hydra/parseHydraDocumentation';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import AdminBuilder from '../AdminBuilder';
import restClient from './hydraClient';

var HydraAdmin = function (_Component) {
  _inherits(HydraAdmin, _Component);

  function HydraAdmin() {
    var _temp, _this, _ret;

    _classCallCheck(this, HydraAdmin);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, _Component.call.apply(_Component, [this].concat(args))), _this), _this.state = {
      api: null
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  HydraAdmin.prototype.componentDidMount = function componentDidMount() {
    var _this2 = this;

    this.props.apiDocumentationParser(this.props.entrypoint).then(function (api) {
      return _this2.setState({ api: api });
    });
  };

  HydraAdmin.prototype.render = function render() {
    if (null === this.state.api) {
      return React.createElement(
        'span',
        null,
        'Loading...'
      );
    }

    return React.createElement(AdminBuilder, _extends({}, this.props, {
      api: this.state.api,
      restClient: this.props.restClient(this.state.api)
    }));
  };

  return HydraAdmin;
}(Component);

HydraAdmin.defaultProps = {
  apiDocumentationParser: apiDocumentationParser,
  restClient: restClient
};
HydraAdmin.propTypes = {
  apiDocumentationParser: PropTypes.func,
  entrypoint: PropTypes.string.isRequired,
  restClient: PropTypes.func
};


export default HydraAdmin;