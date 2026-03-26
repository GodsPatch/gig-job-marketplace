import { User } from '../../domain/entities/User';

describe('User Entity Domain Logic', () => {
  describe('User.create()', () => {
    it('should create a user with default status active', () => {
      const user = User.create({
        id: 'user-1',
        email: 'test@test.com',
        passwordHash: 'hashed-password',
        fullName: 'Test User',
        role: 'worker',
      });
      expect(user.status).toBe('active');
      expect(user.role).toBe('worker');
      expect(user.phoneNumber).toBeNull();
      expect(user.avatarUrl).toBeNull();
      expect(user.bio).toBeNull();
      expect(user.createdAt).toBeInstanceOf(Date);
    });

    it('should create employer user', () => {
      const user = User.create({
        id: 'user-2',
        email: 'employer@test.com',
        passwordHash: 'hashed-password',
        fullName: 'Employer User',
        role: 'employer',
      });
      expect(user.role).toBe('employer');
    });

    it('should create admin user', () => {
      const user = User.create({
        id: 'user-3',
        email: 'admin@test.com',
        passwordHash: 'hashed-password',
        fullName: 'Admin User',
        role: 'admin',
      });
      expect(user.role).toBe('admin');
    });
  });

  describe('User.updateProfile()', () => {
    it('should update fullName', () => {
      const user = User.create({
        id: 'user-1',
        email: 'test@test.com',
        passwordHash: 'hashed',
        fullName: 'Old Name',
        role: 'worker',
      });
      user.updateProfile({ fullName: 'New Name' });
      expect(user.fullName).toBe('New Name');
    });

    it('should update bio and phone', () => {
      const user = User.create({
        id: 'user-1',
        email: 'test@test.com',
        passwordHash: 'hashed',
        fullName: 'Test',
        role: 'worker',
      });
      user.updateProfile({ bio: 'My bio', phoneNumber: '0123456789' });
      expect(user.bio).toBe('My bio');
      expect(user.phoneNumber).toBe('0123456789');
    });

    it('should set updatedAt on profile update', () => {
      const user = User.create({
        id: 'user-1',
        email: 'test@test.com',
        passwordHash: 'hashed',
        fullName: 'Test',
        role: 'worker',
      });
      const oldUpdatedAt = user.updatedAt;
      // Force a small delay
      user.updateProfile({ fullName: 'Updated' });
      expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(oldUpdatedAt.getTime());
    });
  });

  describe('User.isActive()', () => {
    it('should return true for active user', () => {
      const user = User.create({
        id: 'user-1',
        email: 'test@test.com',
        passwordHash: 'hashed',
        fullName: 'Test',
        role: 'worker',
      });
      expect(user.isActive()).toBe(true);
    });
  });

  describe('User.toResponse()', () => {
    it('should not include passwordHash', () => {
      const user = User.create({
        id: 'user-1',
        email: 'test@test.com',
        passwordHash: 'super-secret-hash',
        fullName: 'Test',
        role: 'worker',
      });
      const response = user.toResponse();
      expect(response).not.toHaveProperty('passwordHash');
      expect(response.id).toBe('user-1');
      expect(response.email).toBe('test@test.com');
      expect(response.createdAt).toBeDefined();
    });
  });
});
