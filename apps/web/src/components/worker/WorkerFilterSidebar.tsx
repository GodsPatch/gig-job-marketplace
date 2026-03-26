'use client';

import { useState, useEffect } from 'react';
import { Skill, WorkerListFilters } from '@/types/marketplace';
import { skillsApi } from '@/lib/api/skills.api';

interface WorkerFilterSidebarProps {
  filters: WorkerListFilters;
  onChange: (filters: Partial<WorkerListFilters>) => void;
}

export function WorkerFilterSidebar({ filters, onChange }: WorkerFilterSidebarProps) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const selectedSkillIds = filters.skillIds ? filters.skillIds.split(',') : [];

  useEffect(() => { skillsApi.list().then(setSkills).catch(console.error); }, []);

  const toggleSkill = (id: string) => {
    const current = new Set(selectedSkillIds);
    if (current.has(id)) current.delete(id); else current.add(id);
    onChange({ skillIds: [...current].join(',') || undefined, page: 1 });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-gray-900 mb-2">Trạng thái</h3>
        <select
          value={filters.availability || ''}
          onChange={e => onChange({ availability: (e.target.value || undefined) as any, page: 1 })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Tất cả</option>
          <option value="available">Sẵn sàng</option>
          <option value="busy">Đang bận</option>
        </select>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 mb-2">Kỹ năng</h3>
        <div className="max-h-48 overflow-y-auto space-y-1">
          {skills.map(s => (
            <label key={s.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded">
              <input type="checkbox" checked={selectedSkillIds.includes(s.id)} onChange={() => toggleSkill(s.id)} className="rounded text-indigo-600" />
              {s.name}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 mb-2">Giá/giờ (VND)</h3>
        <div className="flex gap-2">
          <input type="number" placeholder="Min" value={filters.hourlyRateMin || ''} onChange={e => onChange({ hourlyRateMin: e.target.value ? Number(e.target.value) : undefined, page: 1 })}
            className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm" />
          <input type="number" placeholder="Max" value={filters.hourlyRateMax || ''} onChange={e => onChange({ hourlyRateMax: e.target.value ? Number(e.target.value) : undefined, page: 1 })}
            className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm" />
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 mb-2">Rating tối thiểu</h3>
        <select
          value={filters.ratingMin || ''}
          onChange={e => onChange({ ratingMin: e.target.value ? Number(e.target.value) : undefined, page: 1 })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Tất cả</option>
          <option value="4">4+ sao</option>
          <option value="3">3+ sao</option>
          <option value="2">2+ sao</option>
        </select>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 mb-2">Kinh nghiệm (năm)</h3>
        <input type="number" placeholder="Tối thiểu" value={filters.experienceMin || ''} onChange={e => onChange({ experienceMin: e.target.value ? Number(e.target.value) : undefined, page: 1 })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
      </div>
    </div>
  );
}
