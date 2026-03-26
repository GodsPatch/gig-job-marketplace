import { Request, Response, NextFunction } from 'express';
import { ListCategoriesUseCase } from '../../../application/use-cases/category/ListCategoriesUseCase';
import { GetCategoryDetailUseCase } from '../../../application/use-cases/category/GetCategoryDetailUseCase';
import { PostgresCategoryRepository } from '../../../infrastructure/repositories/PostgresCategoryRepository';

const categoryRepo = new PostgresCategoryRepository();
const listCategoriesUseCase = new ListCategoriesUseCase(categoryRepo);
const getCategoryDetailUseCase = new GetCategoryDetailUseCase(categoryRepo);

export class CategoryController {
  static async list(_req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await listCategoriesUseCase.execute();
      res.status(200).json({
        success: true,
        data: { categories },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const slug = req.params.slug as string;
      const category = await getCategoryDetailUseCase.execute(slug);
      res.status(200).json({
        success: true,
        data: { category },
      });
    } catch (error) {
      next(error);
    }
  }
}
