import { DomainError } from './DomainError';
import { ActionCode } from '../value-objects/ActionCode';

export class ActionCooldownError extends DomainError {
  constructor(actionCode: ActionCode) {
    super(`Hành động ${actionCode} đang trong thời gian chờ (cooldown) hoặc đã đạt giới hạn.`, 'ACTION_COOLDOWN_ACTIVE', 400);
  }
}
