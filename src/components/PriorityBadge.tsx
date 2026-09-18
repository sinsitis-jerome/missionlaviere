import type { Priority } from '../types';
import { PRIORITY_LABELS } from '../types';

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={`priorite priorite--${priority}`}>
      <span className="priorite__pastille" aria-hidden="true" />
      {PRIORITY_LABELS[priority]}
    </span>
  );
}
