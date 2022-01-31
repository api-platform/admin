import { Component, ComponentType, createElement, ErrorInfo } from 'react';
import PropTypes from 'prop-types';
import { ComponentPropType, ErrorProps } from 'react-admin';

type ErrorBoundaryProps = {
  error: ComponentType<ErrorProps>;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | undefined;
  errorInfo: ErrorInfo | undefined;
};

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  static propTypes = {
    children: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
    error: ComponentPropType,
  };

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: undefined, errorInfo: undefined };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ hasError: true, error, errorInfo });
  }

  render() {
    const { error: Error, children } = this.props;
    const { hasError, error, errorInfo } = this.state;

    return hasError && error
      ? createElement(Error, {
          error,
          errorInfo,
        })
      : children;
  }
}

export default ErrorBoundary;
