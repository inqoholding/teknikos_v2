import { Component, type ErrorInfo, type ReactNode } from "react";

type State = {
  hasError: boolean;
  message: string;
};

export class AppErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = {
    hasError: false,
    message: "",
  };

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error.message,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("UI crash caught by AppErrorBoundary", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, message: "" });
    window.location.assign("/dashboard");
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="page-state page-state--error">
          <strong>Tampilan mengalami kendala</strong>
          <p>{this.state.message || "Terjadi error runtime di frontend."}</p>
          <button className="btn btn--secondary" type="button" onClick={this.handleReset}>
            Muat ulang aplikasi
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
