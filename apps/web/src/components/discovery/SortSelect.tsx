import React from 'react';

interface SortSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function SortSelect({ value, onChange }: SortSelectProps) {
  return (
    <div className="flex items-center space-x-2">
      <label htmlFor="sort" className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Sắp xếp theo:
      </label>
      <select
        id="sort"
        value={value || 'newest'}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm bg-white dark:bg-gray-700 dark:text-white"
      >
        <option value="newest">Ngày tạo (Mới nhất)</option>
        <option value="oldest">Ngày tạo (Cũ nhất)</option>
        <option value="trending">Nổi bật (Trending)</option>
        <option value="budget_desc">Ngân sách (Cao xuống thấp)</option>
        <option value="budget_asc">Ngân sách (Thấp lên cao)</option>
      </select>
    </div>
  );
}
