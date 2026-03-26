import { ISlugService } from '../../application/interfaces/ISlugService';
import { IJobRepository } from '../../domain/repositories/IJobRepository';
import { Slug } from '../../domain/value-objects/Slug';

export class SlugService implements ISlugService {
  constructor(private readonly jobRepository: IJobRepository) {}

  async generateUniqueSlug(title: string): Promise<string> {
    const baseSlug = Slug.create(title).value;
    let slug = baseSlug;

    // First attempt: base slug + short random string
    const suffix = Math.random().toString(36).substring(2, 8);
    slug = `${baseSlug}-${suffix}`;

    let isUnique = false;
    let attempts = 0;
    const MAX_ATTEMPTS = 5;

    while (!isUnique && attempts < MAX_ATTEMPTS) {
      const exists = await this.jobRepository.existsBySlug(slug);
      if (!exists) {
        isUnique = true;
      } else {
        attempts++;
        const newSuffix = Math.random().toString(36).substring(2, 8);
        slug = `${baseSlug}-${newSuffix}`;
      }
    }

    if (!isUnique) {
      throw new Error('Could not generate a unique slug after maximum attempts');
    }

    return slug;
  }
}
