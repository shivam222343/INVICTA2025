import { useState, useEffect } from 'react';

export default function RegistrationFilters({ 
  registrations, 
  onFilterChange, 
  adminSettings 
}) {
  const [filters, setFilters] = useState({
    search: '',
    workshop: '',
    status: '',
    college: '',
    yearOfStudy: ''
  });

  // Get unique values for filter options
  const getUniqueValues = (key) => {
    const values = registrations.map(reg => reg[key]).filter(Boolean);
    return [...new Set(values)].sort();
  };

  const workshops = adminSettings?.workshops || getUniqueValues('workshop');
  const colleges = getUniqueValues('college');
  const years = adminSettings?.years || getUniqueValues('yearOfStudy');

  useEffect(() => {
    // Apply filters
    let filtered = registrations;

    // Search filter (name, email, mobile, PRN)
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(reg => 
        reg.fullName?.toLowerCase().includes(searchTerm) ||
        reg.email?.toLowerCase().includes(searchTerm) ||
        reg.mobile?.includes(searchTerm) ||
        reg.prnNumber?.toLowerCase().includes(searchTerm)
      );
    }

    // Workshop filter
    if (filters.workshop) {
      filtered = filtered.filter(reg => reg.workshop === filters.workshop);
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(reg => (reg.status || 'pending') === filters.status);
    }

    // College filter
    if (filters.college) {
      filtered = filtered.filter(reg => reg.college === filters.college);
    }

    // Year filter
    if (filters.yearOfStudy) {
      filtered = filtered.filter(reg => reg.yearOfStudy === filters.yearOfStudy);
    }

    onFilterChange(filtered);
  }, [filters, registrations, onFilterChange]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      workshop: '',
      status: '',
      college: '',
      yearOfStudy: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Filter Registrations</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
          >
            Clear All Filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-4">
        {/* Search */}
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            placeholder="Name, email..."
            className="w-full px-2 md:px-3 py-1.5 md:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-xs md:text-sm"
          />
        </div>

        {/* Workshop Filter */}
        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
            Workshop
          </label>
          <select
            value={filters.workshop}
            onChange={(e) => handleFilterChange('workshop', e.target.value)}
            className="w-full px-2 md:px-3 py-1.5 md:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-xs md:text-sm"
          >
            <option value="">All Workshops</option>
            {workshops.map(workshop => (
              <option key={workshop} value={workshop}>{workshop}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-2 md:px-3 py-1.5 md:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-xs md:text-sm"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* College Filter */}
        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
            College
          </label>
          <select
            value={filters.college}
            onChange={(e) => handleFilterChange('college', e.target.value)}
            className="w-full px-2 md:px-3 py-1.5 md:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-xs md:text-sm"
          >
            <option value="">All Colleges</option>
            {colleges.map(college => (
              <option key={college} value={college}>{college}</option>
            ))}
          </select>
        </div>

        {/* Year Filter */}
        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
            Year
          </label>
          <select
            value={filters.yearOfStudy}
            onChange={(e) => handleFilterChange('yearOfStudy', e.target.value)}
            className="w-full px-2 md:px-3 py-1.5 md:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-xs md:text-sm"
          >
            <option value="">All Years</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Filter Summary */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {Object.entries(filters).map(([key, value]) => {
              if (!value) return null;
              return (
                <span
                  key={key}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800"
                >
                  <span className="capitalize font-medium">{key}:</span>
                  <span className="ml-1">{value}</span>
                  <button
                    onClick={() => handleFilterChange(key, '')}
                    className="ml-2 text-indigo-600 hover:text-indigo-800"
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
