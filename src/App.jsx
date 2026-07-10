import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import { SocketProvider } from '@/context/SocketContext';
import { TranslationProvider } from '@/context/TranslationContext';
import ErrorBoundary from '@/components/shared/ErrorBoundary';
import AppRouter from '@/router/AppRouter';
import { useCapacitor } from '@/hooks/useCapacitor';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const AppWithCapacitor = () => {
  useCapacitor();
  return <AppRouter />;
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <SocketProvider>
            <TranslationProvider>
              <ErrorBoundary>
                <AppWithCapacitor />
              </ErrorBoundary>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontFamily: 'DM Sans, sans-serif',
                  },
                }}
              />
            </TranslationProvider>
          </SocketProvider>
        </AuthProvider>
      </BrowserRouter>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
