import { UserResponse } from '../../domain/entities/User';

/**
 * Auth Response DTO — returned after successful authentication (login/register).
 */
export interface AuthResponseDTO {
  user: UserResponse;
  accessToken: string;
  refreshToken: string; // plaintext — only sent once via cookie, never stored
}
