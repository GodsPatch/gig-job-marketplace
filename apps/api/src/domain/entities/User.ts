/**
 * User roles in the system.
 * - worker: default role, represents gig workers looking for jobs
 * - employer: posts gig jobs, hires workers
 * - admin: system administrator
 */
export type UserRole = 'worker' | 'employer' | 'admin';

/**
 * User account status.
 * - active: normal account
 * - inactive: deactivated by user
 * - banned: banned by admin
 */
export type UserStatus = 'active' | 'inactive' | 'banned';

/**
 * Properties required to construct a User entity.
 */
export interface UserProps {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string | null;
  role: UserRole;
  status: UserStatus;
  phoneNumber: string | null;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Data required to create a new user (registration).
 */
export interface CreateUserProps {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  role: UserRole;
}

/**
 * Allowed profile updates.
 * NOTE: email, password, role, status are NOT updatable via profile.
 */
export interface UpdateProfileProps {
  fullName?: string;
  phoneNumber?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
}

/**
 * Safe user response — excludes passwordHash.
 */
export interface UserResponse {
  id: string;
  email: string;
  fullName: string | null;
  role: UserRole;
  status: UserStatus;
  phoneNumber: string | null;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

/**
 * User domain entity — pure class with business rules.
 *
 * IMPORTANT: This class has NO infrastructure dependencies.
 * It only contains business rules and data representation.
 */
export class User {
  private readonly props: UserProps;

  constructor(props: UserProps) {
    this.props = { ...props };
  }

  /**
   * Factory method for creating a new user during registration.
   * Sets defaults for status and profile fields.
   */
  static create(props: CreateUserProps): User {
    return new User({
      ...props,
      status: 'active',
      phoneNumber: null,
      avatarUrl: null,
      bio: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // --- Getters ---

  get id(): string {
    return this.props.id;
  }

  get email(): string {
    return this.props.email;
  }

  get passwordHash(): string {
    return this.props.passwordHash;
  }

  get fullName(): string | null {
    return this.props.fullName;
  }

  get role(): UserRole {
    return this.props.role;
  }

  get status(): UserStatus {
    return this.props.status;
  }

  get phoneNumber(): string | null {
    return this.props.phoneNumber;
  }

  get avatarUrl(): string | null {
    return this.props.avatarUrl;
  }

  get bio(): string | null {
    return this.props.bio;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // --- Methods ---

  /**
   * Update profile fields. Only allowed fields can be updated.
   * Email, password, role, status require separate flows.
   */
  updateProfile(updates: UpdateProfileProps): void {
    if (updates.fullName !== undefined) {
      this.props.fullName = updates.fullName;
    }
    if (updates.phoneNumber !== undefined) {
      this.props.phoneNumber = updates.phoneNumber;
    }
    if (updates.avatarUrl !== undefined) {
      this.props.avatarUrl = updates.avatarUrl;
    }
    if (updates.bio !== undefined) {
      this.props.bio = updates.bio;
    }
    this.props.updatedAt = new Date();
  }

  /**
   * Check if user account is active.
   */
  isActive(): boolean {
    return this.props.status === 'active';
  }

  /**
   * Returns a response-safe representation of the user,
   * omitting sensitive fields like passwordHash.
   */
  toResponse(): UserResponse {
    return {
      id: this.props.id,
      email: this.props.email,
      fullName: this.props.fullName,
      role: this.props.role,
      status: this.props.status,
      phoneNumber: this.props.phoneNumber,
      avatarUrl: this.props.avatarUrl,
      bio: this.props.bio,
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString(),
    };
  }

  // TODO M5: Add methods for detailed worker profile
  // - changeRole(role: UserRole): void
  // - deactivate(): void
  // - ban(): void
}
