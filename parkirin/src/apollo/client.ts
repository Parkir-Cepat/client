import { ApolloClient, InMemoryCache, createHttpLink, from, split } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';

// Create WebSocket link
const wsLink = new GraphQLWsLink(createClient({
  url: import.meta.env.VITE_WS_URL || 'ws://localhost:3000/graphql',
  connectionParams: () => {
    const token = localStorage.getItem('token');
    return {
      authorization: token ? `Bearer ${token}` : '',
    };
  },
}));

// Create HTTP link
const httpLink = createHttpLink({
  uri: import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:3000/graphql',
  credentials: 'include'
});

// Add authentication headers
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      const code = err.extensions?.code;
      
      // Log all GraphQL errors for debugging
      console.error('GraphQL error:', {
        message: err.message,
        code,
        path: err.path,
        locations: err.locations
      });

      switch (code) {
        case 'UNAUTHENTICATED':
          // Handle token expiration or missing authentication
          localStorage.removeItem('token');
          if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
            window.location.href = '/login';
          }
          break;
          
        case 'FORBIDDEN':
          // Handle unauthorized access
          console.error('Access denied:', err.message);
          break;
          
        case 'RATE_LIMITED':
          // Handle rate limiting with exponential backoff
          console.warn('Rate limited:', err.message);
          return forward(operation);
          
        case 'BAD_USER_INPUT':
          // Handle validation errors with detailed logging
          console.warn('Validation error:', {
            message: err.message,
            path: err.path,
            extensions: err.extensions,
            variables: operation.variables
          });
          break;
          
        default:
          // Handle other types of errors
          if (err.message.includes('Cannot query field')) {
            console.error('Schema error:', err.message);
          }
      }
    }
  }

  if (networkError) {
    console.error('Network error:', networkError);
    // Optionally retry on network errors
    return forward(operation);
  }
});

// Retry link for failed requests
const retryLink = new RetryLink({
  delay: {
    initial: 1000,
    max: 10000,
    jitter: true
  },
  attempts: {
    max: 3,
    retryIf: (error) => {
      return !!error && (error.message.includes('Network error') || 
        (error.extensions?.code === 'RATE_LIMITED'));
    }
  }
});

// Split links for subscription and query/mutation
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  from([authLink, httpLink])
);

// Create Apollo Client
export const client = new ApolloClient({
  link: from([errorLink, retryLink, splitLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          searchParkingLots: {
            // Don't merge search results, always use latest
            merge: false
          },
          getMyBookingHistory: {
            // Merge function for booking history with keyArgs
            keyArgs: false,
            merge(existing = [], incoming, { args }) {
              if (args?.offset === 0) {
                return incoming;
              }
              return [...existing, ...incoming];
            }
          }
        }
      },
      ParkingLot: {
        // Identify ParkingLot objects by _id
        keyFields: ['_id']
      }
    }
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});

// Helper function to update auth token
export const updateAuthToken = (token: string | null) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
  
  // Reset Apollo Client cache on token change
  client.resetStore();
};
