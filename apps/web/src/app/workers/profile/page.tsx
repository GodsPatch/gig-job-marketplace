'use client';

import { useState, useEffect } from 'react';
import { workersApi } from '@/lib/api/workers.api';
import { skillsApi } from '@/lib/api/skills.api';
import { Skill, UpdateWorkerProfileInput } from '@/types/marketplace';

export default function WorkerProfileEditPage() {
  const [workerSkills, setWorkerSkills] = useState<Skill[]>([]);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [form, setForm] = useState<UpdateWorkerProfileInput>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [profileData, skillsData] = await Promise.all([
          workersApi.getMyProfile(),
          skillsApi.list(),
        ]);
        setWorkerSkills(profileData.skills);
        setAllSkills(skillsData);
        setForm({
          title: profileData.profile.title || '',
          hourlyRate: profileData.profile.hourlyRate || undefined,
          experienceYears: profileData.profile.experienceYears || undefined,
          availability: profileData.profile.availability,
          portfolioUrl: profileData.profile.portfolioUrl || '',
          isVisible: profileData.profile.isVisible,
        });
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setMessage('');
    try {
      await workersApi.updateMyProfile(form);
      setMessage('✅ Đã lưu hồ sơ');
    } catch (err: any) { setMessage(`❌ ${err.message}`); }
    finally { setSaving(false); }
  };

  const toggleSkill = async (skillId: string) => {
    const current = workerSkills.map(s => s.id);
    const updated = current.includes(skillId) ? current.filter(id => id !== skillId) : [...current, skillId];
    if (updated.length > 15) { setMessage('❌ Tối đa 15 kỹ năng'); return; }
    try {
      const newSkills = await workersApi.updateMySkills(updated);
      setWorkerSkills(newSkills);
      setMessage('✅ Đã cập nhật kỹ năng');
    } catch (err: any) { setMessage(`❌ ${err.message}`); }
  };

  if (loading) return <div className="max-w-3xl mx-auto py-16 text-center"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto" /></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Hồ sơ nghề nghiệp</h1>
      {message && <div className="mb-4 p-3 rounded-lg bg-gray-100 text-sm">{message}</div>}

      <form onSubmit={handleSaveProfile} className="bg-white border border-gray-200 rounded-xl p-6 mb-6 space-y-4">
        <h2 className="font-semibold text-lg text-gray-900">Thông tin cơ bản</h2>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Chức danh</label>
          <input type="text" value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Senior React Developer"
            className="w-full border border-gray-300 rounded-lg px-3 py-2" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Giá/giờ (VND)</label>
            <input type="number" value={form.hourlyRate || ''} onChange={e => setForm({ ...form, hourlyRate: e.target.value ? Number(e.target.value) : undefined })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kinh nghiệm (năm)</label>
            <input type="number" value={form.experienceYears || ''} onChange={e => setForm({ ...form, experienceYears: e.target.value ? Number(e.target.value) : undefined })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
          <select value={form.availability} onChange={e => setForm({ ...form, availability: e.target.value as any })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2">
            <option value="available">Sẵn sàng</option>
            <option value="busy">Đang bận</option>
            <option value="unavailable">Không sẵn sàng</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio URL</label>
          <input type="url" value={form.portfolioUrl || ''} onChange={e => setForm({ ...form, portfolioUrl: e.target.value || null })} placeholder="https://..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2" />
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" checked={form.isVisible} onChange={e => setForm({ ...form, isVisible: e.target.checked })} className="rounded text-indigo-600" />
          <label className="text-sm text-gray-700">Hiển thị hồ sơ công khai</label>
        </div>

        <button type="submit" disabled={saving} className="w-full bg-indigo-600 text-white rounded-lg py-2.5 font-medium hover:bg-indigo-700 disabled:opacity-50">
          {saving ? 'Đang lưu...' : 'Lưu hồ sơ'}
        </button>
      </form>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="font-semibold text-lg text-gray-900 mb-3">Kỹ năng ({workerSkills.length}/15)</h2>
        <div className="flex flex-wrap gap-2">
          {allSkills.map(s => {
            const selected = workerSkills.some(ws => ws.id === s.id);
            return (
              <button key={s.id} type="button" onClick={() => toggleSkill(s.id)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${selected ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                {s.name} {selected && '✓'}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
