import React from 'react';
import { Info } from 'lucide-react';

const StatsCards = ({ stats }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const cards = [
    {
      label: 'Total units sold',
      value: stats.totalUnits || 0,
      format: (val) => val.toLocaleString()
    },
    {
      label: 'Total Amount',
      value: stats.totalAmount || 0,
      format: (val) => `${formatCurrency(val)} (${stats.transactionCount || 0} SRs)`
    },
    {
      label: 'Total Discount',
      value: stats.totalDiscount || 0,
      format: (val) => `${formatCurrency(val)} (${stats.transactionCount || 0} SRs)`
    }
  ];

  return (
    <div className="flex gap-4 mb-6">
      {cards.map((card, index) => (
        <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 min-w-[200px]">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-gray-600 font-normal">{card.label}</span>
            <Info className="w-3 h-3 text-gray-400" />
          </div>
          <div className="text-base font-semibold text-gray-900">
            {card.format(card.value)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
