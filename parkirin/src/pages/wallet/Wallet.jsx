import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { TOP_UP_WALLET } from '../../graphql/mutations';
import { 
  CreditCardIcon, 
  ArrowUpIcon, 
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  WalletIcon
} from '@heroicons/react/24/outline';

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
  const [topUpAmount, setTopUpAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('QRIS');
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  
  const { data: userData, loading: userLoading } = useQuery(GET_ME);
  const { data: historyData, loading: historyLoading } = useQuery(GET_PAYMENT_HISTORY);
  const [topUpSaldo, { loading: topUpLoading }] = useMutation(TOP_UP_WALLET);

  const handleTopUp = async (e) => {
    e.preventDefault();
    if (!topUpAmount || topUpAmount < 10000) return;

    try {
      const result = await topUpSaldo({
        variables: {
          input: {
            amount: parseInt(topUpAmount),
            payment_method: paymentMethod
          }
        }
      });

      if (result.data?.topUpSaldo?.payment_url) {
        window.open(result.data.topUpSaldo.payment_url, '_blank');
        setTopUpAmount('');
        setIsTopUpOpen(false);
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'PENDING':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      default:
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'PENDING':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default:
        return 'bg-red-50 text-red-700 border-red-200';
    }
  };

  const quickAmounts = [10000, 25000, 50000, 100000, 250000, 500000];

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mx-auto"></div>
          <p className="text-gray-600 mt-4 text-center">Loading wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 backdrop-blur-sm bg-white/95">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
              <WalletIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Wallet</h1>
              <p className="text-gray-600">Manage your balance and transactions</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Balance Card */}
        <div className="relative overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-3xl p-8 text-white shadow-2xl transform hover:scale-[1.02] transition-transform duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full transform translate-x-16 -translate-y-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full transform -translate-x-12 translate-y-12"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-white/80 text-sm font-medium">Current Balance</p>
                  <p className="text-4xl font-bold tracking-tight">{formatCurrency(userData?.me?.saldo || 0)}</p>
                </div>
                <CreditCardIcon className="w-12 h-12 text-white/60" />
              </div>
              
              <button
                onClick={() => setIsTopUpOpen(!isTopUpOpen)}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-3 rounded-2xl font-semibold transition-all duration-300 hover:scale-105"
              >
                <ArrowUpIcon className="w-5 h-5" />
                Top Up Balance
              </button>
            </div>
          </div>
        </div>

        {/* Top Up Section */}
        <div className={`transform transition-all duration-500 ease-out ${
          isTopUpOpen ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-4 opacity-0 scale-95 pointer-events-none'
        }`}>
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-50 to-red-50 px-8 py-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-orange-500 rounded-xl">
                  <ArrowUpIcon className="w-5 h-5 text-white" />
                </div>
                Top Up Your Balance
              </h3>
              <p className="text-gray-600 mt-1">Add money to your wallet for seamless parking payments</p>
            </div>
            
            <form onSubmit={handleTopUp} className="p-8 space-y-6">
              {/* Quick Amount Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">Quick Select</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {quickAmounts.map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => setTopUpAmount(amount.toString())}
                      className={`p-3 rounded-xl border-2 font-semibold transition-all duration-200 hover:scale-105 ${
                        topUpAmount === amount.toString()
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-orange-300 hover:bg-orange-50'
                      }`}
                    >
                      {formatCurrency(amount)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Amount */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Custom Amount</label>
                <div className="relative">
                  <input
                    type="number"
                    min="10000"
                    step="1000"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                    placeholder="Enter amount (min. Rp 10,000)"
                    className="w-full px-4 py-4 pl-12 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all duration-200 text-lg font-semibold"
                    required
                  />
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">Rp</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">Minimum top-up amount is Rp 10,000</p>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all duration-200 text-gray-900 font-medium"
                >
                  <option value="QRIS">QRIS</option>
                  <option value="VIRTUAL_ACCOUNT">Virtual Account</option>
                  <option value="EWALLET">E-Wallet</option>
                </select>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsTopUpOpen(false)}
                  className="flex-1 py-4 px-6 border-2 border-gray-200 text-gray-700 rounded-2xl font-semibold hover:bg-gray-50 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!topUpAmount || topUpAmount < 10000 || topUpLoading}
                  className="flex-1 py-4 px-6 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl font-semibold hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  {topUpLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <ArrowUpIcon className="w-5 h-5" />
                      Top Up Now
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-gray-600 rounded-xl">
                <ClockIcon className="w-5 h-5 text-white" />
              </div>
              Transaction History
            </h3>
            <p className="text-gray-600 mt-1">Your recent wallet transactions</p>
          </div>
          
          <div className="p-8">
            {historyLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
                <p className="text-gray-600 mt-4">Loading transactions...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {historyData?.getMyPaymentHistory?.length > 0 ? (
                  historyData.getMyPaymentHistory.map((transaction, index) => (
                    <div 
                      key={transaction._id} 
                      className={`group p-6 border-2 border-gray-100 rounded-2xl hover:border-orange-200 hover:bg-orange-50/30 transition-all duration-300 transform hover:scale-[1.02] ${
                        index === 0 ? 'ring-2 ring-orange-100' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl">
                            <ArrowUpIcon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="text-xl font-bold text-gray-900">{formatCurrency(transaction.amount)}</p>
                            <p className="text-sm font-medium text-gray-600">{transaction.payment_method}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(transaction.created_at).toLocaleDateString('id-ID', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border font-semibold text-sm ${getStatusStyle(transaction.status)}`}>
                            {getStatusIcon(transaction.status)}
                            {transaction.status}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16">
                    <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                      <ClockIcon className="w-10 h-10 text-gray-400" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">No Transactions Yet</h4>
                    <p className="text-gray-600">Your transaction history will appear here once you make your first top-up.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;