import { Request, Response, NextFunction } from 'express';
import { PostgresSkillRepository } from '../../../infrastructure/repositories/PostgresSkillRepository';
import { ListSkillsUseCase } from '../../../application/use-cases/skill/ListSkillsUseCase';

const skillRepo = new PostgresSkillRepository();
const listSkills = new ListSkillsUseCase(skillRepo);

export class SkillController {
  static async list(_req: Request, res: Response, next: NextFunction) {
    try {
      const skills = await listSkills.execute();
      res.status(200).json({ success: true, data: { skills } });
    } catch (error) { next(error); }
  }
}
