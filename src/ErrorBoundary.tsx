import { Component, createElement } from 'react';
import PropTypes from 'prop-types';
import { ComponentPropType } from 'react-admin';

type ErrorBoundaryProps = {
  error: string;
};

type ErrorBoundaryState = {
  hasError: boolean;
  errorMessage: string | null;
  errorInfo: string | null;
};

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  static propTypes: any;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: null, errorInfo: null };
  }

  componentDidCatch(errorMessage, errorInfo) {
    this.setState({ hasError: true, errorMessage, errorInfo });
  }

  render() {
    const { error, children } = this.props;
    const { hasError, errorMessage, errorInfo } = this.state;

    return hasError
      ? createElement(error, {
          error: errorMessage,
          errorInfo,
        })
      : children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
  error: ComponentPropType,
};

export default ErrorBoundary;
