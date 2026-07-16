import { Component } from 'react';

// A dynamic import() failing with this message is what happens when the
// user is offline and navigates to a route whose JS chunk hasn't been
// downloaded yet (Vite's route-based code splitting). It's not a real
// app crash — it's an expected offline symptom — so we detect it
// specifically rather than showing the generic "something went wrong" screen.
const isChunkLoadError = (error) =>
  /Failed to fetch dynamically imported module/i.test(error?.message || '') ||
  /Loading chunk .* failed/i.test(error?.message || '') ||
  error?.name === 'ChunkLoadError';

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

  componentDidUpdate(_, prevState) {
    // If we just entered an error state because of a chunk-load failure,
    // listen for the connection coming back and retry automatically —
    // no need to make the user click anything once they're back online.
    if (this.state.hasError && !prevState.hasError && isChunkLoadError(this.state.error)) {
      window.addEventListener('online', this.handleRetry, { once: true });
    }
  }

  componentWillUnmount() {
    window.removeEventListener('online', this.handleRetry);
  }

  handleRetry = () => {
    // Reset boundary state so children re-render fresh, without a full
    // page reload — much faster to recover from a transient network blip.
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const isOffline = typeof navigator !== 'undefined' && navigator.onLine === false;
      const isChunkFail = isChunkLoadError(this.state.error);
      const offlineLike = isOffline || isChunkFail;
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center',
          justifyContent: 'center', background: '#fafaf9', padding: '24px',
        }}>
          <div style={{ textAlign: 'center', maxWidth: '400px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>{offlineLike ? '📡' : '⚠️'}</div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1c1917', marginBottom: '8px' }}>
              {offlineLike ? "You're offline" : 'Something went wrong'}
            </h2>
            <p style={{ fontSize: '14px', color: '#78716c', marginBottom: '20px', lineHeight: 1.6 }}>
              {offlineLike
                ? "This page hasn't finished loading and needs a connection. We'll retry automatically once you're back online, or tap below."
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
