'use client';

import React, { useEffect, useState } from 'react';
import { categoriesApi } from '../../lib/api/categories.api';
import { Category } from '../../types/job';

interface CategorySelectProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  className?: string;
}

export function CategorySelect({ value, onChange, error, className = '' }: CategorySelectProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await categoriesApi.list();
        setCategories(data);
      } catch (err) {
        console.error('Failed to load categories', err);
      } finally {
        setLoading(false);
      }
    }
    loadCategories();
  }, []);

  return (
    <div className={`flex flex-col ${className}`}>
      <label className="text-sm font-medium text-gray-700 mb-1">
        Category <span className="text-red-500">*</span>
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading}
        className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md ${
          error ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' : ''
        }`}
      >
        <option value="" disabled>
          {loading ? 'Loading categories...' : 'Select a category'}
        </option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
