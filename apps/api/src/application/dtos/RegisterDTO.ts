import { UserRole } from '../../domain/entities/User';

/**
 * Register DTO — Data Transfer Object for user registration.
 * Used to transfer data between interface and application layers.
 */
export interface RegisterDTO {
  email: string;
  password: string;
  fullName: string;
  role?: UserRole;
}
