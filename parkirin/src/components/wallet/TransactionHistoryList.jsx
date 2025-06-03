// src/components/wallet/TransactionHistoryList.jsx
import React from 'react';
import { 
  BanknotesIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import Card from '../common/Card';
import Badge from '../common/Badge';

const TransactionHistoryList = ({ transactions = [] }) => {
  if (!transactions || transactions.length === 0) {
    return (
      <Card className="text-center py-8" rounded="xl">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <BanknotesIcon className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500">No transactions yet</p>
        </div>
      </Card>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircleIcon className="h-5 w-5" />;
      case 'PENDING':
        return <ClockIcon className="h-5 w-5" />;
      default:
        return <XCircleIcon className="h-5 w-5" />;
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'success';
      case 'PENDING':
        return 'warning';
      default:
        return 'danger';
    }
  };

  return (
    <Card className="overflow-hidden" rounded="xl" shadow="lg">
      <Card.Header>
        <Card.Title>Transaction History</Card.Title>
      </Card.Header>
      <div className="space-y-3">
        {transactions.map((transaction) => (
          <div 
            key={transaction._id} 
            className="flex justify-between items-center p-4 border border-gray-100 rounded-lg bg-gray-50 hover:bg-orange-50/30 transition-colors"
          >
            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-full ${
                transaction.status === 'COMPLETED' ? 'bg-green-100' : 
                transaction.status === 'PENDING' ? 'bg-yellow-100' : 'bg-red-100'
              }`}>
                <BanknotesIcon className={`h-5 w-5 ${
                  transaction.status === 'COMPLETED' ? 'text-green-600' : 
                  transaction.status === 'PENDING' ? 'text-yellow-600' : 'text-red-600'
                }`} />
              </div>
              <div>
                <p className="font-medium text-gray-900">{formatCurrency(transaction.amount)}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="mr-2">{transaction.payment_method}</span>
                  <span className="text-xs">•</span>
                  <span className="ml-2 text-xs">{new Date(transaction.created_at).toLocaleString()}</span>
                </div>
              </div>
            </div>
            <Badge 
              variant={getStatusBadgeVariant(transaction.status)} 
              size="sm"
              rounded="full"
              icon={getStatusIcon(transaction.status)}
            >
              {transaction.status}
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default TransactionHistoryList;
