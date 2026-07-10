import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // In production you'd send this to Sentry / LogRocket
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-5">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-semibold text-stone-800 mb-2">Something went wrong</h1>
          <p className="text-stone-400 text-sm mb-6 leading-relaxed">
            An unexpected error occurred. Your data is safe — try refreshing the page.
          </p>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <pre className="text-left text-xs bg-red-50 border border-red-100 rounded-xl p-4 mb-5 text-red-700 overflow-auto max-h-40">
              {this.state.error.message}
            </pre>
          )}
          <button
            className="btn-primary flex items-center gap-2 mx-auto"
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
          >
            <RefreshCw className="w-4 h-4" />
            Reload page
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
