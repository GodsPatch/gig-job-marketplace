import { ISkillRepository } from '../../../domain/repositories/ISkillRepository';

export class ListSkillsUseCase {
  constructor(private readonly skillRepo: ISkillRepository) {}

  async execute() {
    const skills = await this.skillRepo.findAll();
    return skills.filter(s => s.isActive);
  }
}
