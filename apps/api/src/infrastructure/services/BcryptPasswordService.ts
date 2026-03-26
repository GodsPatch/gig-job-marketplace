import bcrypt from 'bcrypt';
import { IPasswordService } from '../../application/interfaces/IPasswordService';

const SALT_ROUNDS = 12;

/**
 * Bcrypt implementation of IPasswordService.
 *
 * Uses bcrypt with cost factor 12 as specified in M2 requirements.
 * Cost factor 12 provides good security while keeping hashing time reasonable.
 */
export class BcryptPasswordService implements IPasswordService {
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  async verify(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
