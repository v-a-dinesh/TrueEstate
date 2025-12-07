import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const SortDropdown = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const sortOptions = [
    { value: 'date-desc', label: 'Date (Newest First)', sortBy: 'date', sortOrder: 'desc' },
    { value: 'date-asc', label: 'Date (Oldest First)', sortBy: 'date', sortOrder: 'asc' },
    { value: 'quantity-desc', label: 'Quantity (High to Low)', sortBy: 'quantity', sortOrder: 'desc' },
    { value: 'quantity-asc', label: 'Quantity (Low to High)', sortBy: 'quantity', sortOrder: 'asc' },
    { value: 'customerName-asc', label: 'Customer Name (A-Z)', sortBy: 'customerName', sortOrder: 'asc' },
    { value: 'customerName-desc', label: 'Customer Name (Z-A)', sortBy: 'customerName', sortOrder: 'desc' },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentOption = sortOptions.find(opt => opt.value === value) || sortOptions[0];

  const handleSelect = (option) => {
    onChange(option.sortBy, option.sortOrder);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-md hover:bg-gray-100 transition-colors text-sm font-medium whitespace-nowrap"
      >
        <span className="text-gray-600">Sort by: {currentOption.label}</span>
        <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[250px]">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option)}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                currentOption.value === option.value ? 'bg-gray-100 text-purple-600 font-medium' : 'text-gray-900'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SortDropdown;
