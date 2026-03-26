import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { IWorkerProfileRepository } from '../../../domain/repositories/IWorkerProfileRepository';
import { ISkillRepository } from '../../../domain/repositories/ISkillRepository';
import { IReviewRepository } from '../../../domain/repositories/IReviewRepository';
import { IJobRepository } from '../../../domain/repositories/IJobRepository';
import { UserNotFoundError } from '../../../domain/errors';

export class GetPublicProfileUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly workerProfileRepo: IWorkerProfileRepository,
    private readonly skillRepo: ISkillRepository,
    private readonly reviewRepo: IReviewRepository,
    private readonly jobRepo: IJobRepository,
  ) {}

  async execute(userId: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new UserNotFoundError(userId);

    const recentReviews = await this.reviewRepo.findByRevieweeId(userId, { page: 1, limit: 5, sort: 'newest' });

    if (user.role === 'worker') {
      const profile = await this.workerProfileRepo.findByUserId(userId);
      let skills: { id: string; name: string; slug: string }[] = [];
      
      if (profile) {
        skills = await this.skillRepo.findByWorkerProfileId(profile.id);
      }

      const isLimited = profile ? !profile.isVisible : true;

      return {
        user: {
          id: user.id,
          fullName: user.fullName,
          avatarUrl: user.avatarUrl,
          bio: user.bio,
          role: user.role,
          createdAt: user.createdAt,
        },
        workerProfile: isLimited ? null : {
          title: profile!.title,
          hourlyRate: profile!.hourlyRate,
          experienceYears: profile!.experienceYears,
          availability: profile!.availability,
          portfolioUrl: profile!.portfolioUrl,
          ratingAverage: profile!.ratingAverage,
          ratingCount: profile!.ratingCount,
          jobsCompleted: profile!.jobsCompleted,
          skills,
        },
        recentReviews: isLimited ? [] : recentReviews.data,
      };
    }

    if (user.role === 'employer') {
      // Count jobs by this employer
      const ownJobs = await this.jobRepo.findByOwner(user.id, { page: 1, limit: 1 });
      // We need total count and active count
      const publishedJobs = await this.jobRepo.findByOwner(user.id, { page: 1, limit: 1, status: 'published' });

      return {
        user: {
          id: user.id,
          fullName: user.fullName,
          avatarUrl: user.avatarUrl,
          bio: user.bio,
          role: user.role,
          createdAt: user.createdAt,
        },
        employerStats: {
          totalJobsPosted: ownJobs.total,
          activeJobs: publishedJobs.total,
          ratingAverage: (user as any).ratingAverage || 0,
          ratingCount: (user as any).ratingCount || 0,
        },
        recentReviews: recentReviews.data,
      };
    }

    // Admin — minimal info
    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        bio: null,
        role: user.role,
        createdAt: user.createdAt,
      },
    };
  }
}
