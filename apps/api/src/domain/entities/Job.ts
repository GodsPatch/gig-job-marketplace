import { JobStatus, JobStatusEnum } from '../value-objects/JobStatus';
import { BudgetType } from '../value-objects/BudgetType';
import { LocationType } from '../value-objects/LocationType';
import { JobNotPublishableError, JobNotEditableError } from '../errors/JobErrors';

export interface JobProps {
  id: string;
  title: string;
  slug: string;
  description: string;
  categoryId: string;
  budgetType: BudgetType;
  budgetMin: number | null;
  budgetMax: number | null;
  locationType: LocationType;
  location: string | null;
  status: JobStatus;
  createdBy: string;
  publishedAt: Date | null;
  closedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  viewCount: number;
}

export type CreateJobProps = Omit<JobProps, 'id' | 'status' | 'publishedAt' | 'closedAt' | 'createdAt' | 'updatedAt' | 'viewCount'> & {
  id?: string;
  status?: JobStatus;
  createdAt?: Date;
  updatedAt?: Date;
  viewCount?: number;
};

export type UpdateJobProps = Partial<Pick<JobProps, 'title' | 'description' | 'categoryId' | 'budgetType' | 'budgetMin' | 'budgetMax' | 'locationType' | 'location'>>;

export class Job {
  readonly id: string;
  public title: string;
  public slug: string;
  public description: string;
  public categoryId: string;
  public budgetType: BudgetType;
  public budgetMin: number | null;
  public budgetMax: number | null;
  public locationType: LocationType;
  public location: string | null;
  public status: JobStatus;
  public createdBy: string;
  public publishedAt: Date | null;
  public closedAt: Date | null;
  public createdAt: Date;
  public updatedAt: Date;
  public viewCount: number;

  private constructor(props: JobProps) {
    this.id = props.id;
    this.title = props.title;
    this.slug = props.slug;
    this.description = props.description;
    this.categoryId = props.categoryId;
    this.budgetType = props.budgetType;
    this.budgetMin = props.budgetMin;
    this.budgetMax = props.budgetMax;
    this.locationType = props.locationType;
    this.location = props.location;
    this.status = props.status;
    this.createdBy = props.createdBy;
    this.publishedAt = props.publishedAt;
    this.closedAt = props.closedAt;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.viewCount = props.viewCount;
  }

  static create(props: CreateJobProps): Job {
    const now = new Date();
    return new Job({
      ...props,
      id: props.id || 'NEW_UUID_PLACEHOLDER_WILL_BE_REPLACED_IN_REPO', // Handled by DB mostly or ID generator,
      status: props.status || JobStatus.draft(),
      publishedAt: null,
      closedAt: null,
      createdAt: props.createdAt || now,
      updatedAt: props.updatedAt || now,
      viewCount: props.viewCount || 0,
    });
  }

  publish(): void {
    const validation = this.isPublishable();
    if (!validation.valid) {
      throw new JobNotPublishableError(validation.errors);
    }
    this.status = this.status.transitionTo(JobStatusEnum.PUBLISHED);
    this.publishedAt = new Date();
    this.updatedAt = new Date();
  }

  close(): void {
    this.status = this.status.transitionTo(JobStatusEnum.CLOSED);
    this.closedAt = new Date();
    this.updatedAt = new Date();
  }

  incrementView(): void {
    if (this.isPublic()) {
      this.viewCount += 1;
    }
  }

  updateDraft(props: UpdateJobProps): void {
    if (!this.isDraft()) {
      throw new JobNotEditableError();
    }
    
    if (props.title !== undefined) this.title = props.title;
    if (props.description !== undefined) this.description = props.description;
    if (props.categoryId !== undefined) this.categoryId = props.categoryId;
    if (props.budgetType !== undefined) this.budgetType = props.budgetType;
    if (props.budgetMin !== undefined) this.budgetMin = props.budgetMin;
    if (props.budgetMax !== undefined) this.budgetMax = props.budgetMax;
    if (props.locationType !== undefined) this.locationType = props.locationType;
    if (props.location !== undefined) this.location = props.location;
    
    this.updatedAt = new Date();
  }

  isPublishable(): { valid: boolean; errors: { field: string; message: string }[] } {
    const errors: { field: string; message: string }[] = [];
    
    if (!this.title || this.title.length < 10) errors.push({ field: 'title', message: 'Tựa đề phải có ít nhất 10 ký tự' });
    if (!this.description || this.description.length < 30) errors.push({ field: 'description', message: 'Mô tả phải có ít nhất 30 ký tự' });
    if (!this.categoryId) errors.push({ field: 'categoryId', message: 'Danh mục là bắt buộc' });
    
    if (this.budgetType.requiresBudgetRange()) {
      if (this.budgetMin === null || this.budgetMax === null) {
        errors.push({ field: 'budget', message: 'Ngân sách tĩnh hoặc theo giờ yêu cầu min và max' });
      } else if (this.budgetMin > this.budgetMax) {
        errors.push({ field: 'budget', message: 'Ngân sách min không được lớn hơn max' });
      }
    }
    
    if (this.locationType.requiresLocationDetails()) {
      if (!this.location || this.location.trim().length === 0) {
        errors.push({ field: 'location', message: 'Loại địa điểm này yêu cầu phải nhập tên địa điểm' });
      }
    }
    
    return { valid: errors.length === 0, errors };
  }

  isOwner(userId: string): boolean {
    return this.createdBy === userId;
  }

  isPublic(): boolean {
    return this.status.value === JobStatusEnum.PUBLISHED;
  }

  isDraft(): boolean {
    return this.status.value === JobStatusEnum.DRAFT;
  }

  isClosed(): boolean {
    return this.status.value === JobStatusEnum.CLOSED;
  }
}
