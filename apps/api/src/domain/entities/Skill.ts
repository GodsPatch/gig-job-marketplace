export interface SkillProps {
  id: string;
  name: string;
  slug: string;
  categoryId: string | null;
  isActive: boolean;
  createdAt: Date;
}

export class Skill {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly categoryId: string | null;
  readonly isActive: boolean;
  readonly createdAt: Date;

  constructor(props: SkillProps) {
    this.id = props.id;
    this.name = props.name;
    this.slug = props.slug;
    this.categoryId = props.categoryId;
    this.isActive = props.isActive;
    this.createdAt = props.createdAt;
  }
}
