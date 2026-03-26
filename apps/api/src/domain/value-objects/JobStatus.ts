import { InvalidStateTransitionError } from '../errors/JobErrors';

export enum JobStatusEnum {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CLOSED = 'closed'
}

export class JobStatus {
  private constructor(public readonly value: JobStatusEnum) {}

  static draft(): JobStatus {
    return new JobStatus(JobStatusEnum.DRAFT);
  }

  static published(): JobStatus {
    return new JobStatus(JobStatusEnum.PUBLISHED);
  }

  static closed(): JobStatus {
    return new JobStatus(JobStatusEnum.CLOSED);
  }

  static fromString(status: string): JobStatus {
    if (Object.values(JobStatusEnum).includes(status as JobStatusEnum)) {
      return new JobStatus(status as JobStatusEnum);
    }
    throw new Error(`Invalid job status: ${status}`);
  }

  canTransitionTo(toStatus: JobStatusEnum): boolean {
    if (this.value === JobStatusEnum.DRAFT) {
      return toStatus === JobStatusEnum.DRAFT || toStatus === JobStatusEnum.PUBLISHED;
    }
    if (this.value === JobStatusEnum.PUBLISHED) {
      return toStatus === JobStatusEnum.CLOSED;
    }
    return false;
  }

  transitionTo(toStatus: JobStatusEnum): JobStatus {
    if (!this.canTransitionTo(toStatus)) {
      throw new InvalidStateTransitionError(`Cannot transition from ${this.value} to ${toStatus}`);
    }
    return new JobStatus(toStatus);
  }
}
