import { AvailabilityValue } from '../value-objects/Availability';

export interface WorkerProfileProps {
  id: string;
  userId: string;
  title: string | null;
  hourlyRate: number | null;
  experienceYears: number | null;
  availability: AvailabilityValue;
  portfolioUrl: string | null;
  isVisible: boolean;
  ratingAverage: number;
  ratingCount: number;
  jobsCompleted: number;
  createdAt: Date;
  updatedAt: Date;
}

export type UpdateWorkerProfileProps = Partial<Pick<WorkerProfileProps,
  'title' | 'hourlyRate' | 'experienceYears' | 'availability' | 'portfolioUrl' | 'isVisible'
>>;

export class WorkerProfile {
  readonly id: string;
  readonly userId: string;
  public title: string | null;
  public hourlyRate: number | null;
  public experienceYears: number | null;
  public availability: AvailabilityValue;
  public portfolioUrl: string | null;
  public isVisible: boolean;
  public ratingAverage: number;
  public ratingCount: number;
  public jobsCompleted: number;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(props: WorkerProfileProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.title = props.title;
    this.hourlyRate = props.hourlyRate;
    this.experienceYears = props.experienceYears;
    this.availability = props.availability;
    this.portfolioUrl = props.portfolioUrl;
    this.isVisible = props.isVisible;
    this.ratingAverage = props.ratingAverage;
    this.ratingCount = props.ratingCount;
    this.jobsCompleted = props.jobsCompleted;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static createEmpty(userId: string, id: string): WorkerProfile {
    const now = new Date();
    return new WorkerProfile({
      id,
      userId,
      title: null,
      hourlyRate: null,
      experienceYears: null,
      availability: 'available',
      portfolioUrl: null,
      isVisible: true,
      ratingAverage: 0,
      ratingCount: 0,
      jobsCompleted: 0,
      createdAt: now,
      updatedAt: now,
    });
  }

  update(props: UpdateWorkerProfileProps): void {
    if (props.title !== undefined) this.title = props.title;
    if (props.hourlyRate !== undefined) this.hourlyRate = props.hourlyRate;
    if (props.experienceYears !== undefined) this.experienceYears = props.experienceYears;
    if (props.availability !== undefined) this.availability = props.availability;
    if (props.portfolioUrl !== undefined) this.portfolioUrl = props.portfolioUrl;
    if (props.isVisible !== undefined) this.isVisible = props.isVisible;
    this.updatedAt = new Date();
  }

  /** Worker is discoverable in listings if visible + has title + (skills handled externally) */
  isDiscoverable(): boolean {
    return this.isVisible && this.title !== null && this.title.length > 0;
  }
}
