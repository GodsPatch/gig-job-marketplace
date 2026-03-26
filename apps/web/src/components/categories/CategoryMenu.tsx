'use client';

import React, { useEffect, useState } from 'react';
import { categoriesApi } from '../../lib/api/categories.api';
import { Category } from '../../types/job';
import Link from 'next/link';

interface CategoryMenuProps {
  currentSlug?: string;
}

export function CategoryMenu({ currentSlug }: CategoryMenuProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoriesApi.list().then(setCategories).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="animate-pulse flex flex-col space-y-3 p-4">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
    </div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
      <ul className="space-y-2">
        <li>
          <Link
            href="/jobs"
            className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              !currentSlug ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            All Categories
          </Link>
        </li>
        {categories.map((cat) => (
          <li key={cat.id}>
            <Link
              href={`/jobs?category=${cat.slug}`}
              className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentSlug === cat.slug ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {cat.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
