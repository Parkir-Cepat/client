import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { TOP_UP_WALLET } from '../../graphql/mutations';
import WalletBalanceCard from '../../components/wallet/WalletBalanceCard';
import TopUpForm from '../../components/wallet/TopUpForm';
import TransactionHistoryList from '../../components/wallet/TransactionHistoryList';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const GET_ME = gql`
  query Me {
    me {
      _id
      saldo
    }
  }
`;

const GET_PAYMENT_HISTORY = gql`
  query GetMyPaymentHistory {
    getMyPaymentHistory {
      _id
      amount
      payment_method
      status
      created_at
    }
  }
`;

const Wallet = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: userData, loading: userLoading } = useQuery(GET_ME);
  const { data: historyData, loading: historyLoading } = useQuery(GET_PAYMENT_HISTORY);
  const [topUpSaldo] = useMutation(TOP_UP_WALLET);

  const handleTopUp = async (formData) => {
    setIsSubmitting(true);
    try {
      const result = await topUpSaldo({
        variables: {
          input: {
            amount: formData.amount,
            payment_method: formData.paymentMethod
          }
        }
      });

      if (result.data?.topUpSaldo?.payment_url) {
        window.open(result.data.topUpSaldo.payment_url, '_blank');
      }
    } catch (error) {
      console.error('Error during top up:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (userLoading) return <LoadingSpinner size="large" variant="primary" />;

  return (
    <div className="w-full py-6 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-orange-500">My Wallet</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Balance Card */}
          <WalletBalanceCard balance={userData?.me?.saldo || 0} />
          
          {/* Top Up Form */}
          <TopUpForm onSubmit={handleTopUp} isSubmitting={isSubmitting} />
        </div>
        
        <div className="lg:col-span-3">
          {/* Transaction History */}
          {historyLoading ? (
            <LoadingSpinner size="medium" variant="primary" />
          ) : (
            <TransactionHistoryList transactions={historyData?.getMyPaymentHistory || []} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Wallet;