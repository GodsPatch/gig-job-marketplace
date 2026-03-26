'use client';

import React, { useState, FormEvent } from 'react';
import { CreateJobInput, UpdateJobInput, Job } from '../../types/job';
import { CategorySelect } from '../categories/CategorySelect';

interface JobFormProps {
  initialData?: Job;
  onSubmit: (data: CreateJobInput | UpdateJobInput) => Promise<void>;
  isLoading: boolean;
}

export function JobForm({ initialData, onSubmit, isLoading }: JobFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    categoryId: initialData?.category?.id || '',
    locationType: initialData?.locationType || 'remote',
    location: initialData?.location || '',
    budgetType: initialData?.budgetType || 'negotiable',
    budgetMin: initialData?.budgetMin?.toString() || '',
    budgetMax: initialData?.budgetMax?.toString() || '',
  });

  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic Validation
    if (formData.title.length < 10) return setError('Title must be at least 10 characters.');
    if (formData.description.length < 30) return setError('Description must be at least 30 characters.');
    if (!formData.categoryId) return setError('Please select a category.');
    
    if (['fixed', 'hourly'].includes(formData.budgetType)) {
      if (!formData.budgetMin || !formData.budgetMax) return setError('Please specify both minimum and maximum budget.');
      if (Number(formData.budgetMin) > Number(formData.budgetMax)) return setError('Min budget cannot be greater than Max budget.');
    }

    if (['onsite', 'hybrid'].includes(formData.locationType) && !formData.location.trim()) {
      return setError('Location is required for onsite or hybrid jobs.');
    }

    try {
      await onSubmit({
        title: formData.title,
        description: formData.description,
        categoryId: formData.categoryId,
        locationType: formData.locationType as any,
        location: formData.location,
        budgetType: formData.budgetType as any,
        budgetMin: formData.budgetMin ? Number(formData.budgetMin) : null,
        budgetMax: formData.budgetMax ? Number(formData.budgetMax) : null,
      });
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'An error occurred while saving the job.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl bg-white p-6 sm:p-8 rounded-xl shadow border border-gray-100">
      {error && <div className="bg-red-50 text-red-700 p-4 rounded-md text-sm">{error}</div>}

      <div>
        <label className="block text-sm font-medium text-gray-700">Job Title <span className="text-red-500">*</span></label>
        <input 
          type="text" name="title" required
          value={formData.title} onChange={handleChange}
          placeholder="e.g. Senior React Developer"
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-4 py-2 border"
        />
      </div>

      <CategorySelect 
        value={formData.categoryId} 
        onChange={(val) => setFormData(prev => ({ ...prev, categoryId: val }))} 
      />

      <div>
        <label className="block text-sm font-medium text-gray-700">Description <span className="text-red-500">*</span></label>
        <textarea 
          name="description" required rows={6}
          value={formData.description} onChange={handleChange}
          placeholder="Describe the job role, responsibilities, and requirements..."
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-4 py-2 border"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Location Type <span className="text-red-500">*</span></label>
          <select 
            name="locationType" value={formData.locationType} onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-4 py-2 border bg-white"
          >
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
            <option value="onsite">On-site</option>
          </select>
        </div>
        
        {['hybrid', 'onsite'].includes(formData.locationType) && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Specific Location <span className="text-red-500">*</span></label>
            <input 
              type="text" name="location" required
              value={formData.location} onChange={handleChange}
              placeholder="e.g. San Francisco, CA"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-4 py-2 border"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Budget Type <span className="text-red-500">*</span></label>
          <select 
            name="budgetType" value={formData.budgetType} onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-4 py-2 border bg-white"
          >
            <option value="negotiable">Negotiable</option>
            <option value="fixed">Fixed</option>
            <option value="hourly">Hourly</option>
          </select>
        </div>

        {['fixed', 'hourly'].includes(formData.budgetType) && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">Min Budget ($) <span className="text-red-500">*</span></label>
              <input 
                type="number" name="budgetMin" required min="1"
                value={formData.budgetMin} onChange={handleChange}
                placeholder="20"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-4 py-2 border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Max Budget ($) <span className="text-red-500">*</span></label>
              <input 
                type="number" name="budgetMax" required min="1"
                value={formData.budgetMax} onChange={handleChange}
                placeholder="50"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-4 py-2 border"
              />
            </div>
          </>
        )}
      </div>

      <div className="pt-4 flex items-center justify-end space-x-4">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 border border-transparent py-2 px-6 rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : (initialData ? 'Update Job' : 'Create Job')}
        </button>
      </div>
    </form>
  );
}
