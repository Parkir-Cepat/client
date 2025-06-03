// src/components/wallet/TopUpForm.jsx
import React, { useState } from 'react';
import { CashIcon, CreditCardIcon, QrcodeIcon } from '@heroicons/react/24/outline';
import Card from '../common/Card';
import Button from '../common/Button';

const TopUpForm = ({ onSubmit, isSubmitting = false }) => {
  const [topUpAmount, setTopUpAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('QRIS');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit && topUpAmount && parseInt(topUpAmount) >= 10000) {
      onSubmit({
        amount: parseInt(topUpAmount),
        paymentMethod
      });
    }
  };

  // Payment method options with icons
  const paymentOptions = [
    { value: 'QRIS', label: 'QRIS', icon: <QrcodeIcon className="h-5 w-5" /> },
    { value: 'VIRTUAL_ACCOUNT', label: 'Virtual Account', icon: <CreditCardIcon className="h-5 w-5" /> },
    { value: 'EWALLET', label: 'E-Wallet', icon: <CashIcon className="h-5 w-5" /> }
  ];

  // Predefined amounts for quick selection
  const predefinedAmounts = [10000, 20000, 50000, 100000, 200000];

  return (
    <Card className="overflow-hidden" rounded="xl" shadow="lg">
      <Card.Header>
        <Card.Title>Top Up Balance</Card.Title>
      </Card.Header>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Amount</label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-4">
            {predefinedAmounts.map(amount => (
              <button
                key={amount}
                type="button"
                className={`p-2 border rounded-lg text-sm font-medium transition-all ${
                  parseInt(topUpAmount) === amount 
                    ? 'bg-orange-50 border-orange-500 text-orange-600' 
                    : 'border-gray-200 hover:border-orange-200 hover:bg-orange-50'
                }`}
                onClick={() => setTopUpAmount(amount.toString())}
              >
                Rp {amount.toLocaleString()}
              </button>
            ))}
          </div>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">Rp</span>
            <input
              type="number"
              min="10000"
              step="1000"
              value={topUpAmount}
              onChange={(e) => setTopUpAmount(e.target.value)}
              placeholder="Custom Amount (min. 10,000)"
              className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              required
            />
          </div>
          {parseInt(topUpAmount) < 10000 && topUpAmount !== '' && (
            <p className="mt-1 text-sm text-red-600">Minimum amount is Rp 10,000</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {paymentOptions.map(option => (
              <label 
                key={option.value}
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                  paymentMethod === option.value 
                    ? 'bg-orange-50 border-orange-500' 
                    : 'border-gray-200 hover:border-orange-200'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={option.value}
                  checked={paymentMethod === option.value}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="sr-only"
                />
                <span className={`mr-2 text-lg ${paymentMethod === option.value ? 'text-orange-500' : 'text-gray-400'}`}>
                  {option.icon}
                </span>
                <span className={`text-sm font-medium ${paymentMethod === option.value ? 'text-orange-800' : 'text-gray-700'}`}>
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>
        
        <Button
          type="submit"
          variant="primary"
          size="large"
          fullWidth
          rounded="full"
          disabled={!topUpAmount || parseInt(topUpAmount) < 10000 || isSubmitting}
          loading={isSubmitting}
        >
          Top Up Now
        </Button>
      </form>
    </Card>
  );
};

export default TopUpForm;
