import type { Household, Task } from '../types';
import { formatDueDate } from '../lib/dates';
import { isOverdue } from '../lib/sort';
import { PriorityBadge } from './PriorityBadge';
import { MemberAvatar } from './MemberAvatar';
import { RecurrenceIcon } from './icons/RecurrenceIcon';

export function TaskCard({
  task,
  household,
  onOpen,
}: {
  task: Task;
  household: Household;
  onOpen: () => void;
}) {
  const assignee = task.assigneeId ? household.members[task.assigneeId] : null;
  const overdue = isOverdue(task);

  return (
    <button className={`carte-tache carte-tache--${task.priority}`} onClick={onOpen}>
      <div className="carte-tache__entete">
        <span className="carte-tache__categorie">{task.category}</span>
        {task.recurrence && <RecurrenceIcon />}
      </div>

      <p className="carte-tache__titre">{task.title}</p>

      <div className="carte-tache__pied">
        <PriorityBadge priority={task.priority} />
        {task.dueDate && (
          <span className={`echeance${overdue ? ' echeance--retard' : ''}`}>
            {formatDueDate(task.dueDate)}
          </span>
        )}
      </div>

      {assignee && (
        <div className="carte-tache__assigne">
          <MemberAvatar member={assignee} size={24} />
          <span>{assignee.displayName}</span>
        </div>
      )}
    </button>
  );
}
