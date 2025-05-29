import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';

const GET_ME = gql`
  query Me {
    me {
      _id
      saldo
    }
  }
`;

const TOP_UP_SALDO = gql`
  mutation TopUpSaldo($input: TopUpInput!) {
    topUpSaldo(input: $input) {
      _id
      amount
      paymentUrl
    }
  }
`;

const GET_PAYMENT_HISTORY = gql`
  query GetMyPaymentHistory {
    getMyPaymentHistory {
      _id
      amount
      paymentMethod
      status
      createdAt
    }
  }
`;

const Wallet = () => {
  const [topUpAmount, setTopUpAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('QRIS');
  
  const { data: userData, loading: userLoading } = useQuery(GET_ME);
  const { data: historyData, loading: historyLoading } = useQuery(GET_PAYMENT_HISTORY);
  const [topUpSaldo] = useMutation(TOP_UP_SALDO);

  const handleTopUp = async (e) => {
    e.preventDefault();
    if (!topUpAmount || topUpAmount < 10000) return;

    try {
      const result = await topUpSaldo({
        variables: {
          input: {
            amount: parseInt(topUpAmount),
            paymentMethod
          }
        }
      });

      if (result.data?.topUpSaldo?.paymentUrl) {
        window.open(result.data.topUpSaldo.paymentUrl, '_blank');
      }
    } catch (error) {
      console.error('Error during top up:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  if (userLoading) return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Wallet</h1>
      
      {/* Balance Card */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white mb-6">
        <h2 className="text-lg font-medium mb-2">Current Balance</h2>
        <p className="text-3xl font-bold">{formatCurrency(userData?.me?.saldo || 0)}</p>
      </div>

      {/* Top Up Form */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Top Up Balance</h3>
        <form onSubmit={handleTopUp} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input
              type="number"
              min="10000"
              step="1000"
              value={topUpAmount}
              onChange={(e) => setTopUpAmount(e.target.value)}
              placeholder="Minimum Rp 10,000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="QRIS">QRIS</option>
              <option value="VIRTUAL_ACCOUNT">Virtual Account</option>
              <option value="EWALLET">E-Wallet</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={!topUpAmount || topUpAmount < 10000}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Top Up Now
          </button>
        </form>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Transaction History</h3>
        {historyLoading ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {historyData?.getMyPaymentHistory?.length > 0 ? (
              historyData.getMyPaymentHistory.map((transaction) => (
                <div key={transaction._id} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium">{formatCurrency(transaction.amount)}</p>
                    <p className="text-sm text-gray-600">{transaction.paymentMethod}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(transaction.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    transaction.status === 'COMPLETED' 
                      ? 'bg-green-100 text-green-800' 
                      : transaction.status === 'PENDING'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {transaction.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No transactions yet</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wallet;