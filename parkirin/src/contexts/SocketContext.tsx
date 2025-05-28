import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useSubscription } from '@apollo/client';
import { 
  NOTIFICATION_RECEIVED,
  SALDO_UPDATED
} from '../apollo/subscriptions';
import { useAuth } from './AuthContext';

interface SocketContextType {
  connected: boolean;
  subscribeToBooking: (bookingId: string) => void;
  subscribeToChat: (bookingId: string) => void;
  subscribeToPayment: (paymentId: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export { SocketContext };

export function SocketProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false);
  const { user } = useAuth();

  // Subscribe to notifications for the current user
  useSubscription(NOTIFICATION_RECEIVED, {
    skip: !user,
    onData: ({ data }) => {
      // Handle notification data
      console.log('New notification:', data);
    }
  });

  // Subscribe to saldo updates
  useSubscription(SALDO_UPDATED, {
    skip: !user,
    onData: ({ data }) => {
      // Handle saldo update
      console.log('Saldo updated:', data);
    }
  });

  useEffect(() => {
    if (user) {
      setConnected(true);
      return () => setConnected(false);
    }
  }, [user]);

  // Function to subscribe to booking status changes
  const subscribeToBooking = (bookingId: string) => {
    console.log('Subscribing to booking:', bookingId);
  };

  // Function to subscribe to chat messages and status
  const subscribeToChat = (bookingId: string) => {
    console.log('Subscribing to chat:', bookingId);
  };

  // Function to subscribe to payment status updates
  const subscribeToPayment = (paymentId: string) => {
    console.log('Subscribing to payment:', paymentId);
  };

  return (
    <SocketContext.Provider
      value={{
        connected,
        subscribeToBooking,
        subscribeToChat,
        subscribeToPayment
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
