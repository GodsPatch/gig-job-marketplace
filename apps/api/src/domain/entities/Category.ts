export interface CategoryProps {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  displayOrder: number;
  isActive: boolean;
}

export class Category {
  readonly id: string;
  public name: string;
  public slug: string;
  public description: string | null;
  public icon: string | null;
  public displayOrder: number;
  public isActive: boolean;

  private constructor(props: CategoryProps) {
    this.id = props.id;
    this.name = props.name;
    this.slug = props.slug;
    this.description = props.description;
    this.icon = props.icon;
    this.displayOrder = props.displayOrder;
    this.isActive = props.isActive;
  }

  static create(props: CategoryProps): Category {
    return new Category(props);
  }

  toResponse() {
    return {
      id: this.id,
      name: this.name,
      slug: this.slug,
      description: this.description,
      icon: this.icon,
      displayOrder: this.displayOrder
    };
  }
}
