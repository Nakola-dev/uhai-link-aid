import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Global error boundary (F-030).
 * Catches uncaught React rendering errors and shows a recovery UI
 * instead of a blank white screen.
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-destructive"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>

            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Something went wrong
              </h1>
              <p className="text-muted-foreground">
                An unexpected error occurred. Please try refreshing the page.
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <pre className="text-left text-xs bg-muted p-4 rounded-lg overflow-auto max-h-40 text-muted-foreground">
                {this.state.error.message}
              </pre>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
              >
                Refresh Page
              </button>
              <button
                onClick={this.handleReset}
                className="px-6 py-2 rounded-lg border border-border hover:bg-accent transition-colors font-medium"
              >
                Go Home
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              If this problem persists, please contact support at{' '}
              <a href="mailto:support@uhailink.com" className="text-primary hover:underline">
                support@uhailink.com
              </a>
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
