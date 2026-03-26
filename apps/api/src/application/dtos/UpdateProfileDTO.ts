/**
 * Update Profile DTO — Data Transfer Object for profile updates.
 * Only these fields are allowed to be updated via profile endpoint.
 * Email, password, role, status require separate flows.
 */
export interface UpdateProfileDTO {
  fullName?: string;
  phoneNumber?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
}
