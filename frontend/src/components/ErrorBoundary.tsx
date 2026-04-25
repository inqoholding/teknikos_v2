import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="surface-card error-boundary__card">
            <div className="error-boundary__icon">
              <AlertTriangle size={48} />
            </div>
            <h1>Oops! Terjadi kesalahan</h1>
            <p>
              Mohon maaf, sepertinya aplikasi mengalami gangguan teknis saat merender halaman ini.
            </p>
            {this.state.error && (
              <div className="error-boundary__debug">
                <code>{this.state.error.message}</code>
              </div>
            )}
            <div className="button-row">
              <button onClick={this.handleReload} className="btn btn--primary">
                <RefreshCw size={18} />
                Muat Ulang Halaman
              </button>
            </div>
          </div>
          <style>{`
            .error-boundary {
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              padding: 24px;
              background-color: var(--background);
            }
            .error-boundary__card {
              max-width: 480px;
              width: 100%;
              text-align: center;
              padding: 40px;
            }
            .error-boundary__icon {
              color: var(--destructive);
              margin-bottom: 24px;
              display: flex;
              justify-content: center;
            }
            .error-boundary__debug {
              margin: 24px 0;
              padding: 12px;
              background: var(--muted);
              border-radius: var(--radius-md);
              font-size: 13px;
              text-align: left;
              max-height: 120px;
              overflow: auto;
            }
            .error-boundary h1 {
              font-size: 24px;
              font-weight: 700;
              margin-bottom: 12px;
              color: var(--foreground);
            }
            .error-boundary p {
              color: var(--muted-foreground);
              line-height: 1.6;
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}
