import { useSubscription } from '@apollo/client';
import { 
  BOOKING_STATUS_CHANGED,
  PAYMENT_STATUS_UPDATED,
  CHAT_RECEIVED,
  CHAT_STATUS_UPDATED
} from '../apollo/subscriptions';

export function useBookingSubscription(bookingId: string) {
  return useSubscription(BOOKING_STATUS_CHANGED, {
    variables: { bookingId },
    skip: !bookingId
  });
}

export function usePaymentSubscription(paymentId: string) {
  return useSubscription(PAYMENT_STATUS_UPDATED, {
    variables: { paymentId },
    skip: !paymentId
  });
}

export function useChatSubscription(bookingId: string, userId: string) {
  const chatSub = useSubscription(CHAT_RECEIVED, {
    variables: { bookingId },
    skip: !bookingId
  });

  const statusSub = useSubscription(CHAT_STATUS_UPDATED, {
    variables: { userId },
    skip: !userId
  });

  return {
    chatData: chatSub.data,
    chatLoading: chatSub.loading,
    chatError: chatSub.error,
    statusData: statusSub.data,
    statusLoading: statusSub.loading,
    statusError: statusSub.error
  };
}
