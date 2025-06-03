// src/components/wallet/WalletBalanceCard.jsx
import React from 'react';
import { CurrencyDollarIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import Card from '../common/Card';

const WalletBalanceCard = ({ balance = 0 }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  return (
    <Card 
      className="overflow-hidden" 
      rounded="xl" 
      shadow="lg" 
      padding="none"
    >
      <div className="relative bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
        <div className="absolute right-0 top-0 w-64 h-64 -mr-12 -mt-12">
          <svg 
            viewBox="0 0 200 200" 
            xmlns="http://www.w3.org/2000/svg" 
            className="opacity-20"
          >
            <path 
              fill="currentColor" 
              d="M42.5,-65.2C55.9,-59,68,-47.4,75.6,-32.9C83.3,-18.5,86.5,-1.3,83.8,15C81.1,31.3,72.5,46.8,59.6,56.8C46.7,66.8,29.4,71.4,12.5,73.4C-4.4,75.4,-21,74.9,-35.8,68.8C-50.6,62.6,-63.7,50.9,-71,36.1C-78.3,21.3,-79.9,3.4,-75.8,-12.4C-71.6,-28.2,-61.7,-41.9,-49,-50.5C-36.3,-59.1,-20.8,-62.6,-5.2,-55.7C10.5,-48.9,29.1,-71.3,42.5,-65.2Z" 
              transform="translate(100 100)" 
            />
          </svg>
        </div>
        <div className="relative z-10">
          <p className="text-white/80 mb-2 flex items-center">
            <CurrencyDollarIcon className="w-5 h-5 mr-1" /> 
            Current Balance
          </p>
          <h3 className="text-3xl md:text-4xl font-bold">{formatCurrency(balance)}</h3>
        </div>
      </div>
      <div className="p-4 bg-white border-t border-orange-100">
        <div className="flex items-center justify-center text-sm text-orange-600">
          <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
          <span>Top up to enjoy seamless parking payments</span>
        </div>
      </div>
    </Card>
  );
};

export default WalletBalanceCard;
