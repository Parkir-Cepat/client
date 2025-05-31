import { useSubscription } from '@apollo/client';
import { useMemo } from 'react';
import {
  NOTIFICATION_RECEIVED,
  SALDO_UPDATED
} from '../apollo/subscriptions';

export function useUserSubscriptions(userId: string) {
  // Subscribe to notifications
  const notificationSub = useSubscription(NOTIFICATION_RECEIVED, {
    skip: !userId
  });

  // Subscribe to saldo updates
  const saldoSub = useSubscription(SALDO_UPDATED, {
    skip: !userId
  });

  return useMemo(() => ({
    notifications: {
      data: notificationSub.data,
      loading: notificationSub.loading,
      error: notificationSub.error
    },
    saldo: {
      data: saldoSub.data,
      loading: saldoSub.loading,
      error: saldoSub.error
    }
  }), [notificationSub, saldoSub]);
}
