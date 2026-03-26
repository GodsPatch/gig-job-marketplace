export interface ISlugService {
  generateUniqueSlug(title: string): Promise<string>;
}
