export class Slug {
  private constructor(public readonly value: string) {}

  static create(title: string, suffix?: string): Slug {
    if (!title || title.trim().length === 0) {
      throw new Error('Title cannot be empty when creating a slug');
    }
    
    // Simple basic slugification
    let slug = title
      .toLowerCase()
      .normalize('NFD') // decompose diacritics
      .replace(/[\u0300-\u036f]/g, '') // remove diacritics
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-') // replace non-alphanumeric with hyphen
      .replace(/^-+|-+$/g, ''); // trim hyphens

    if (suffix) {
      slug = `${slug}-${suffix}`;
    }

    return new Slug(slug);
  }

  static fromString(slug: string): Slug {
    return new Slug(slug);
  }
}
