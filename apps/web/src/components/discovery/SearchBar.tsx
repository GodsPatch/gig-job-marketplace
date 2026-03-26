import React, { useState, useEffect } from 'react';

interface SearchBarProps {
  initialValue?: string;
  onSearch: (keyword: string) => void;
  className?: string;
}

export function SearchBar({ initialValue = '', onSearch, className = '' }: SearchBarProps) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue || '');
  }, [initialValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(value.trim());
  };

  return (
    <form onSubmit={handleSubmit} className={`relative flex w-full max-w-2xl mx-auto shadow-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 ${className}`}>
      <div className="flex-grow flex items-center px-4 py-3">
        <svg className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Tìm kiếm theo từ khóa 'React', 'Marketing'..."
          className="w-full bg-transparent border-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-base"
        />
      </div>
      <button
        type="submit"
        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-r-lg transition-colors border border-transparent"
      >
        Tìm kiếm
      </button>
    </form>
  );
}
