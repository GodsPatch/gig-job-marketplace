export interface CategoryResponseDTO {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  displayOrder: number;
}

export interface CategoryWithCountDTO extends CategoryResponseDTO {
  jobCount: number;
}
