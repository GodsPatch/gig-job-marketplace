import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { PublicJobFilters, Job, PaginatedResult } from '../types/job';
import { jobsApi } from '../lib/api/jobs.api';

export function useJobSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<PaginatedResult<Job> | null>(null);
  
  const [filters, setFilters] = useState<PublicJobFilters>({
    keyword: searchParams.get('keyword') || undefined,
    categorySlug: searchParams.get('categorySlug') || undefined,
    locationType: (searchParams.get('locationType') as any) || undefined,
    budgetType: (searchParams.get('budgetType') as any) || undefined,
    budgetMin: searchParams.get('budgetMin') ? Number(searchParams.get('budgetMin')) : undefined,
    budgetMax: searchParams.get('budgetMax') ? Number(searchParams.get('budgetMax')) : undefined,
    sort: searchParams.get('sort') || 'newest',
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
    limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 12,
  });

  const fetchJobs = useCallback(async (currentFilters: PublicJobFilters) => {
    setLoading(true);
    try {
      const response = await jobsApi.searchPublic(currentFilters);
      setData(response);
    } catch (error) {
      console.error('Failed to fetch jobs', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.keyword) params.set('keyword', filters.keyword);
    if (filters.categorySlug) params.set('categorySlug', filters.categorySlug);
    if (filters.locationType) params.set('locationType', filters.locationType);
    if (filters.budgetType) params.set('budgetType', filters.budgetType);
    if (filters.budgetMin) params.set('budgetMin', filters.budgetMin.toString());
    if (filters.budgetMax) params.set('budgetMax', filters.budgetMax.toString());
    if (filters.sort && filters.sort !== 'newest') params.set('sort', filters.sort);
    if (filters.page && filters.page > 1) params.set('page', filters.page.toString());
    if (filters.limit && filters.limit !== 12) params.set('limit', filters.limit.toString());

    const search = params.toString();
    const query = search ? `?${search}` : '';
    
    router.replace(`${pathname}${query}`, { scroll: false });
    
    const timeoutId = setTimeout(() => {
      fetchJobs(filters);
    }, 400); 
    
    return () => clearTimeout(timeoutId);
  }, [filters, fetchJobs, pathname, router]);

  const updateFilters = (newFilters: Partial<PublicJobFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: newFilters.page !== undefined ? newFilters.page : 1
    }));
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 12,
      sort: 'newest'
    });
  };

  return {
    filters,
    updateFilters,
    clearFilters,
    loading,
    data
  };
}
