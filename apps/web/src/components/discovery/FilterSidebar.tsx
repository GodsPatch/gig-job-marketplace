import React from 'react';
import { PublicJobFilters, CategoryWithCount } from '@/types/job';

interface FilterSidebarProps {
  filters: PublicJobFilters;
  onChange: (filters: Partial<PublicJobFilters>) => void;
  categories: CategoryWithCount[];
}

export function FilterSidebar({ filters, onChange, categories }: FilterSidebarProps) {
  const budgetOptions = [
    { value: '', label: 'Tất cả' },
    { value: 'fixed', label: 'Cố định' },
    { value: 'hourly', label: 'Theo giờ' },
    { value: 'negotiable', label: 'Thương lượng' },
  ];

  const locationOptions = [
    { value: '', label: 'Tất cả' },
    { value: 'remote', label: 'Remote' },
    { value: 'onsite', label: 'Tại văn phòng' },
    { value: 'hybrid', label: 'Hybrid' },
  ];

  const handleBudgetRangeChange = (minStr: string, maxStr: string) => {
    const budgetMin = minStr ? Number(minStr) : undefined;
    const budgetMax = maxStr ? Number(maxStr) : undefined;
    onChange({ budgetMin, budgetMax });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-8">
      
      {/* Categories */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">Danh mục</h3>
        <div className="space-y-2">
          <label className="flex items-center space-x-3 cursor-pointer group">
            <input 
              type="radio" 
              name="category"
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700 cursor-pointer"
              checked={!filters.categoryId && !filters.categorySlug}
              onChange={() => onChange({ categoryId: undefined, categorySlug: undefined })}
            />
            <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Tất cả danh mục</span>
          </label>
          
          {categories.map(c => (
            <label key={c.id} className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center space-x-3">
                <input 
                  type="radio" 
                  name="category"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700 cursor-pointer"
                  checked={filters.categoryId === c.id || filters.categorySlug === c.slug}
                  onChange={() => onChange({ categorySlug: c.slug, categoryId: undefined })}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  {c.name}
                </span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                {c.jobCount}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Location */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">Hình thức làm việc</h3>
        <div className="space-y-2">
          {locationOptions.map(opt => (
            <label key={opt.value} className="flex items-center space-x-3 cursor-pointer group">
              <input 
                type="radio" 
                name="locationType"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700 cursor-pointer"
                checked={(filters.locationType || '') === opt.value}
                onChange={() => onChange({ locationType: (opt.value || undefined) as any })}
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Budget Type */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">Loại ngân sách</h3>
        <div className="space-y-2">
          {budgetOptions.map(opt => (
            <label key={opt.value} className="flex items-center space-x-3 cursor-pointer group">
              <input 
                type="radio" 
                name="budgetType"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700 cursor-pointer"
                checked={(filters.budgetType || '') === opt.value}
                onChange={() => onChange({ budgetType: (opt.value || undefined) as any, budgetMin: undefined, budgetMax: undefined })}
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Conditional Budget Range Component */}
      {(filters.budgetType === 'fixed' || filters.budgetType === 'hourly') && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">Mức lương (VND)</h3>
          <div className="flex items-center space-x-2">
            <input 
              type="number" 
              placeholder="Từ..."
              className="w-full text-sm rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 shadow-sm px-3 py-2"
              value={filters.budgetMin || ''}
              onChange={(e) => handleBudgetRangeChange(e.target.value, filters.budgetMax?.toString() || '')}
            />
            <span className="text-gray-500">-</span>
            <input 
              type="number" 
              placeholder="Đến..."
              className="w-full text-sm rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 shadow-sm px-3 py-2"
              value={filters.budgetMax || ''}
              onChange={(e) => handleBudgetRangeChange(filters.budgetMin?.toString() || '', e.target.value)}
            />
          </div>
        </div>
      )}

    </div>
  );
}
