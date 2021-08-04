import React, { ErrorInfo } from "react";

interface Props {}
interface State {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(errorInfo);
    return;
  }
  render() {
    if (this.state.hasError) {
      return <>error</>;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
