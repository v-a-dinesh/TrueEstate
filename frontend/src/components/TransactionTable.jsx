import React from 'react';
import { Copy } from 'lucide-react';
import toast from 'react-hot-toast';

const TransactionTable = ({ transactions, loading }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Phone number copied!');
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <div className="text-center text-gray-500">
          No transactions found
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-2.5 text-left text-sm font-medium text-gray-600">Transaction ID</th>
              <th className="px-4 py-2.5 text-left text-sm font-medium text-gray-600">Date</th>
              <th className="px-4 py-2.5 text-left text-sm font-medium text-gray-600">Customer ID</th>
              <th className="px-4 py-2.5 text-left text-sm font-medium text-gray-600">Customer name</th>
              <th className="px-4 py-2.5 text-left text-sm font-medium text-gray-600">Phone Number</th>
              <th className="px-4 py-2.5 text-left text-sm font-medium text-gray-600">Gender</th>
              <th className="px-4 py-2.5 text-left text-sm font-medium text-gray-600">Age</th>
              <th className="px-4 py-2.5 text-left text-sm font-medium text-gray-600">Product Category</th>
              <th className="px-4 py-2.5 text-left text-sm font-medium text-gray-600">Quantity</th>
              <th className="px-4 py-2.5 text-left text-sm font-medium text-gray-600">Total Amount</th>
              <th className="px-4 py-2.5 text-left text-sm font-medium text-gray-600">Customer region</th>
              <th className="px-4 py-2.5 text-left text-sm font-medium text-gray-600">Product ID</th>
              <th className="px-4 py-2.5 text-left text-sm font-medium text-gray-600">Employee name</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-gray-200">
            {transactions.map((transaction) => (
              <tr key={transaction._id} className="hover:bg-gray-100">
                <td className="px-4 py-3 text-sm text-gray-900">{transaction.transactionId}</td>
                <td className="px-4 py-3 text-sm text-gray-400">{formatDate(transaction.date)}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{transaction.customerId}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{transaction.customerName}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span>+91 {transaction.phoneNumber}</span>
                    <button
                      onClick={() => copyToClipboard(transaction.phoneNumber)}
                      className="text-gray-400 hover:text-gray-600"
                      title="Copy phone number"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">{transaction.gender}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{transaction.age}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{transaction.productCategory}</td>
                <td className="px-4 py-3 text-sm text-gray-900 font-medium">{String(transaction.quantity).padStart(2, '0')}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(transaction.totalAmount)}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{transaction.customerRegion}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{transaction.productId}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{transaction.employeeName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionTable;
