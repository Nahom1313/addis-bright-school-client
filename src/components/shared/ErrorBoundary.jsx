import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  handleRetry = () => {
    // Reset boundary state so children re-render fresh, without a full
    // page reload — much faster to recover from a transient network blip.
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const isOffline = typeof navigator !== 'undefined' && navigator.onLine === false;
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center',
          justifyContent: 'center', background: '#fafaf9', padding: '24px',
        }}>
          <div style={{ textAlign: 'center', maxWidth: '400px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>{isOffline ? '📡' : '⚠️'}</div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1c1917', marginBottom: '8px' }}>
              {isOffline ? "You're offline" : 'Something went wrong'}
            </h2>
            <p style={{ fontSize: '14px', color: '#78716c', marginBottom: '20px', lineHeight: 1.6 }}>
              {isOffline
                ? 'Check your internet connection and try again.'
                : 'An unexpected error occurred. Please try again, or refresh the page if it keeps happening.'}
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={this.handleRetry}
                style={{
                  padding: '10px 24px', borderRadius: '10px', border: 'none',
                  background: 'linear-gradient(135deg,#d97706,#b45309)',
                  color: 'white', fontWeight: 600, fontSize: '14px', cursor: 'pointer',
                }}
              >
                Try again
              </button>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '10px 24px', borderRadius: '10px',
                  border: '1px solid #d6d3d1', background: 'white',
                  color: '#44403c', fontWeight: 600, fontSize: '14px', cursor: 'pointer',
                }}
              >
                Refresh page
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
