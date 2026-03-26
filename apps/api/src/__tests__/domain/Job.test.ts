import { Job } from '../../domain/entities/Job';
import { BudgetType } from '../../domain/value-objects/BudgetType';
import { LocationType } from '../../domain/value-objects/LocationType';
import { JobNotPublishableError, JobNotEditableError } from '../../domain/errors/JobErrors';

describe('Job Entity Domain Logic', () => {
  const validProps = {
    title: 'Senior React Developer',
    description: 'We are looking for a highly skilled React JS developer with at least 5 years of experience to join our core team.',
    categoryId: 'uuid-123',
    budgetType: BudgetType.fixed(),
    budgetMin: 1000,
    budgetMax: 1000,
    locationType: LocationType.remote(),
    location: null,
    createdBy: 'user-uuid'
  };

  it('should create a valid draft job by default', () => {
    const job = Job.create(validProps as any);
    expect(job.isDraft()).toBe(true);
    expect(job.status.value).toBe('draft');
  });

  it('should allow publishing a valid draft job', () => {
    const job = Job.create(validProps as any);
    job.publish();
    expect(job.isPublic()).toBe(true);
    expect(job.publishedAt).toBeInstanceOf(Date);
  });

  it('should prevent publishing if required fields are invalid', () => {
    const job = Job.create({ ...validProps, title: 'Short' } as any);
    expect(() => job.publish()).toThrow(JobNotPublishableError);
  });

  it('should allow editing a draft job', () => {
    const job = Job.create(validProps as any);
    job.updateDraft({ title: 'Updated Title', budgetMin: 2000 });
    expect(job.title).toBe('Updated Title');
    expect(job.budgetMin).toBe(2000);
  });

  it('should prevent editing a published job', () => {
    const job = Job.create(validProps as any);
    job.publish();
    expect(() => job.updateDraft({ title: 'Hacked' })).toThrow(JobNotEditableError);
  });

  it('should allow closing a published job', () => {
    const job = Job.create(validProps as any);
    job.publish();
    job.close();
    expect(job.isClosed()).toBe(true);
    expect(job.closedAt).toBeInstanceOf(Date);
  });

  it('should prevent reopening a closed job', () => {
    const job = Job.create(validProps as any);
    job.publish();
    job.close();
    expect(() => job.publish()).toThrow();
  });
});
