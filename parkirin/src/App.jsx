import { ApolloProvider } from '@apollo/client';
import { BrowserRouter as Router } from 'react-router-dom';
import client from './graphql/client';
import AppRoutes from './routes';
import { Toaster } from 'react-hot-toast';
import { ErrorBoundary } from './components/common';
import "./App.css";

function App() {
  return (
    <ErrorBoundary>
      <ApolloProvider client={client}>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <div className="min-h-screen bg-gray-50 font-sans antialiased text-gray-900">
            <AppRoutes />
            <Toaster 
              position="top-right" 
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#fff',
                  color: '#333',
                  borderRadius: '8px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                },
                success: {
                  style: {
                    borderLeft: '4px solid #10B981',
                  },
                },
                error: {
                  style: {
                    borderLeft: '4px solid #EF4444',
                  },
                },
                loading: {
                  style: {
                    borderLeft: '4px solid #F59E0B',
                  },
                },
              }}
            />
          </div>
        </Router>
      </ApolloProvider>
    </ErrorBoundary>
  );
}

export default App;
