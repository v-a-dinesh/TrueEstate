import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const DateRangeFilter = ({ dateFrom, dateTo, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasSelection = dateFrom || dateTo;
  const displayText = hasSelection ? 'Date (Selected)' : 'Date';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-md hover:bg-gray-100 transition-colors text-sm font-medium"
      >
        <span className="text-gray-600">{displayText}</span>
        <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 min-w-[250px]">
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => onChange({ dateFrom: e.target.value, dateTo })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => onChange({ dateFrom, dateTo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
              />
            </div>
            <button
              onClick={() => {
                onChange({ dateFrom: '', dateTo: '' });
                setIsOpen(false);
              }}
              className="w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangeFilter;
