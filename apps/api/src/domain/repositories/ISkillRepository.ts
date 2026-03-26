import { Skill } from '../entities/Skill';

export interface ISkillRepository {
  findAll(): Promise<Skill[]>;
  findByIds(ids: string[]): Promise<Skill[]>;
  findByCategoryId(categoryId: string): Promise<Skill[]>;
  findByWorkerProfileId(profileId: string): Promise<Skill[]>;
  setWorkerSkills(profileId: string, skillIds: string[]): Promise<void>;
}
