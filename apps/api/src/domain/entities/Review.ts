import { Job } from './Job';

export interface ReviewProps {
  id: string;
  jobId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
}

export interface CreateReviewProps {
  id: string;
  jobId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment: string | null;
}

export class Review {
  readonly id: string;
  readonly jobId: string;
  readonly reviewerId: string;
  readonly revieweeId: string;
  readonly rating: number;
  readonly comment: string | null;
  readonly createdAt: Date;

  constructor(props: ReviewProps) {
    this.id = props.id;
    this.jobId = props.jobId;
    this.reviewerId = props.reviewerId;
    this.revieweeId = props.revieweeId;
    this.rating = props.rating;
    this.comment = props.comment;
    this.createdAt = props.createdAt;
  }

  static create(props: CreateReviewProps): Review {
    if (props.rating < 1 || props.rating > 5 || !Number.isInteger(props.rating)) {
      throw new Error('Rating must be integer between 1 and 5');
    }
    if (props.reviewerId === props.revieweeId) {
      throw new Error('Cannot review yourself');
    }
    if (props.comment && props.comment.length > 1000) {
      throw new Error('Comment must be 1000 characters or less');
    }

    return new Review({
      ...props,
      createdAt: new Date(),
    });
  }

  /**
   * Validate whether a review can be created for a given job.
   */
  static validateCanReview(params: {
    job: Job;
    reviewerId: string;
    revieweeId: string;
    existingReview: Review | null;
  }): { valid: boolean; error?: string } {
    const { job, reviewerId, revieweeId, existingReview } = params;

    if (!job.isClosed()) {
      return { valid: false, error: 'Job must be closed before reviewing' };
    }

    if (reviewerId === revieweeId) {
      return { valid: false, error: 'Cannot review yourself' };
    }

    if (existingReview) {
      return { valid: false, error: 'You have already reviewed for this job' };
    }

    // MVP: at least one of reviewer/reviewee must be job owner (employer)
    const jobOwnerId = job.createdBy;
    if (reviewerId !== jobOwnerId && revieweeId !== jobOwnerId) {
      return { valid: false, error: 'Reviewer or reviewee must be the job owner' };
    }

    return { valid: true };
  }
}
