import React from 'react';
import { RotateCcw } from 'lucide-react';
import FilterDropdown from './FilterDropdown';
import AgeRangeFilter from './AgeRangeFilter';
import DateRangeFilter from './DateRangeFilter';

const FilterBar = ({ filters, filterOptions, onFilterChange, onReset }) => {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={onReset}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        title="Reset filters"
      >
        <RotateCcw className="w-4 h-4 text-gray-600" />
      </button>

      <FilterDropdown
        label="Customer Region"
        options={filterOptions.customerRegion}
        selectedValues={filters.customerRegion}
        onChange={(values) => onFilterChange({ customerRegion: values })}
      />

      <FilterDropdown
        label="Gender"
        options={filterOptions.gender}
        selectedValues={filters.gender}
        onChange={(values) => onFilterChange({ gender: values })}
      />

      <AgeRangeFilter
        ageMin={filters.ageMin}
        ageMax={filters.ageMax}
        onChange={(values) => onFilterChange(values)}
      />

      <FilterDropdown
        label="Product Category"
        options={filterOptions.productCategory}
        selectedValues={filters.productCategory}
        onChange={(values) => onFilterChange({ productCategory: values })}
      />

      <FilterDropdown
        label="Tags"
        options={filterOptions.tags}
        selectedValues={filters.tags}
        onChange={(values) => onFilterChange({ tags: values })}
      />

      <FilterDropdown
        label="Payment Method"
        options={filterOptions.paymentMethod}
        selectedValues={filters.paymentMethod}
        onChange={(values) => onFilterChange({ paymentMethod: values })}
      />

      <DateRangeFilter
        dateFrom={filters.dateFrom}
        dateTo={filters.dateTo}
        onChange={(values) => onFilterChange(values)}
      />
    </div>
  );
};

export default FilterBar;
