import { Review } from '../../domain/entities/Review';
import { Job } from '../../domain/entities/Job';
import { BudgetType } from '../../domain/value-objects/BudgetType';
import { LocationType } from '../../domain/value-objects/LocationType';

describe('Review Entity Domain Logic', () => {
  const validProps = {
    id: 'review-1',
    jobId: 'job-1',
    reviewerId: 'user-1',
    revieweeId: 'user-2',
    rating: 4,
    comment: 'Great work!',
  };

  describe('Review.create()', () => {
    it('should create a valid review', () => {
      const review = Review.create(validProps);
      expect(review.rating).toBe(4);
      expect(review.comment).toBe('Great work!');
      expect(review.createdAt).toBeInstanceOf(Date);
    });

    it('should create a review with null comment', () => {
      const review = Review.create({ ...validProps, comment: null });
      expect(review.comment).toBeNull();
    });

    it('should reject rating below 1', () => {
      expect(() => Review.create({ ...validProps, rating: 0 })).toThrow('Rating must be integer between 1 and 5');
    });

    it('should reject rating above 5', () => {
      expect(() => Review.create({ ...validProps, rating: 6 })).toThrow('Rating must be integer between 1 and 5');
    });

    it('should reject non-integer rating', () => {
      expect(() => Review.create({ ...validProps, rating: 3.5 })).toThrow('Rating must be integer between 1 and 5');
    });

    it('should reject self-review', () => {
      expect(() => Review.create({ ...validProps, revieweeId: 'user-1' })).toThrow('Cannot review yourself');
    });

    it('should reject comment longer than 1000 characters', () => {
      const longComment = 'a'.repeat(1001);
      expect(() => Review.create({ ...validProps, comment: longComment })).toThrow('Comment must be 1000 characters or less');
    });

    it('should accept comment at exactly 1000 characters', () => {
      const maxComment = 'a'.repeat(1000);
      const review = Review.create({ ...validProps, comment: maxComment });
      expect(review.comment?.length).toBe(1000);
    });
  });

  describe('Review.validateCanReview()', () => {
    function createClosedJob(ownerId: string): Job {
      const job = Job.create({
        title: 'Senior React Developer',
        description: 'We are looking for a highly skilled React JS developer with at least 5 years of experience to join our core team.',
        categoryId: 'cat-1',
        budgetType: BudgetType.fixed(),
        budgetMin: 1000,
        budgetMax: 1000,
        locationType: LocationType.remote(),
        location: null,
        createdBy: ownerId,
      } as any);
      job.publish();
      job.close();
      return job;
    }

    it('should validate a legitimate review', () => {
      const job = createClosedJob('user-1');
      const result = Review.validateCanReview({
        job,
        reviewerId: 'user-1',
        revieweeId: 'user-2',
        existingReview: null,
      });
      expect(result.valid).toBe(true);
    });

    it('should reject review for non-closed job', () => {
      const job = Job.create({
        title: 'Senior React Developer',
        description: 'We are looking for a highly skilled React JS developer with at least 5 years of experience to join our core team.',
        categoryId: 'cat-1',
        budgetType: BudgetType.fixed(),
        budgetMin: 1000,
        budgetMax: 1000,
        locationType: LocationType.remote(),
        location: null,
        createdBy: 'user-1',
      } as any);
      job.publish();
      
      const result = Review.validateCanReview({
        job,
        reviewerId: 'user-1',
        revieweeId: 'user-2',
        existingReview: null,
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('closed');
    });

    it('should reject self-review', () => {
      const job = createClosedJob('user-1');
      const result = Review.validateCanReview({
        job,
        reviewerId: 'user-1',
        revieweeId: 'user-1',
        existingReview: null,
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('yourself');
    });

    it('should reject duplicate review', () => {
      const job = createClosedJob('user-1');
      const existingReview = new Review({
        id: 'existing-1',
        jobId: job.id,
        reviewerId: 'user-1',
        revieweeId: 'user-2',
        rating: 5,
        comment: null,
        createdAt: new Date(),
      });

      const result = Review.validateCanReview({
        job,
        reviewerId: 'user-1',
        revieweeId: 'user-2',
        existingReview,
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('already reviewed');
    });

    it('should reject review when neither party is job owner', () => {
      const job = createClosedJob('user-1');
      const result = Review.validateCanReview({
        job,
        reviewerId: 'user-3',
        revieweeId: 'user-4',
        existingReview: null,
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('job owner');
    });
  });
});
