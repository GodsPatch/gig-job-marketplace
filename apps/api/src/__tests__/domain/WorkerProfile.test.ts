import { WorkerProfile } from '../../domain/entities/WorkerProfile';

describe('WorkerProfile Entity Domain Logic', () => {
  describe('WorkerProfile.createEmpty()', () => {
    it('should create empty profile with defaults', () => {
      const profile = WorkerProfile.createEmpty('user-1', 'profile-1');
      expect(profile.userId).toBe('user-1');
      expect(profile.id).toBe('profile-1');
      expect(profile.title).toBeNull();
      expect(profile.hourlyRate).toBeNull();
      expect(profile.availability).toBe('available');
      expect(profile.isVisible).toBe(true);
      expect(profile.ratingAverage).toBe(0);
      expect(profile.ratingCount).toBe(0);
      expect(profile.jobsCompleted).toBe(0);
    });
  });

  describe('WorkerProfile.update()', () => {
    it('should update title', () => {
      const profile = WorkerProfile.createEmpty('user-1', 'profile-1');
      profile.update({ title: 'Senior Developer' });
      expect(profile.title).toBe('Senior Developer');
    });

    it('should update hourly rate', () => {
      const profile = WorkerProfile.createEmpty('user-1', 'profile-1');
      profile.update({ hourlyRate: 50 });
      expect(profile.hourlyRate).toBe(50);
    });

    it('should update visibility', () => {
      const profile = WorkerProfile.createEmpty('user-1', 'profile-1');
      profile.update({ isVisible: false });
      expect(profile.isVisible).toBe(false);
    });

    it('should update updatedAt on update', () => {
      const profile = WorkerProfile.createEmpty('user-1', 'profile-1');
      const oldUpdated = profile.updatedAt;
      profile.update({ title: 'New Title' });
      expect(profile.updatedAt.getTime()).toBeGreaterThanOrEqual(oldUpdated.getTime());
    });
  });

  describe('WorkerProfile.isDiscoverable()', () => {
    it('should be discoverable if visible and has title', () => {
      const profile = WorkerProfile.createEmpty('user-1', 'profile-1');
      profile.update({ title: 'React Developer', isVisible: true });
      expect(profile.isDiscoverable()).toBe(true);
    });

    it('should NOT be discoverable if invisible', () => {
      const profile = WorkerProfile.createEmpty('user-1', 'profile-1');
      profile.update({ title: 'React Developer', isVisible: false });
      expect(profile.isDiscoverable()).toBe(false);
    });

    it('should NOT be discoverable without title', () => {
      const profile = WorkerProfile.createEmpty('user-1', 'profile-1');
      expect(profile.isDiscoverable()).toBe(false);
    });

    it('should NOT be discoverable with empty title', () => {
      const profile = WorkerProfile.createEmpty('user-1', 'profile-1');
      profile.update({ title: '' });
      expect(profile.isDiscoverable()).toBe(false);
    });
  });
});
