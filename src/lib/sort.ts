import type { Priority, Status, Task } from '../types';
import { PRIORITY_ORDER } from '../types';

export interface TaskFilters {
  assigneeId?: string | 'non_affectee' | 'tous';
  category?: string | 'toutes';
  status?: Status | 'toutes';
  priority?: Priority | 'toutes';
  search?: string;
}

const priorityRank: Record<Priority, number> = Object.fromEntries(
  PRIORITY_ORDER.map((p, i) => [p, i]),
) as Record<Priority, number>;

/**
 * Trie les tâches par priorité décroissante, puis par échéance la plus
 * proche (les tâches sans échéance passent en dernier), puis par date de
 * création.
 */
export function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const priorityDiff = priorityRank[a.priority] - priorityRank[b.priority];
    if (priorityDiff !== 0) return priorityDiff;

    if (a.dueDate !== null && b.dueDate !== null) {
      if (a.dueDate !== b.dueDate) return a.dueDate - b.dueDate;
    } else if (a.dueDate !== null) {
      return -1;
    } else if (b.dueDate !== null) {
      return 1;
    }

    return a.createdAt - b.createdAt;
  });
}

export function filterTasks(tasks: Task[], filters: TaskFilters): Task[] {
  return tasks.filter((task) => {
    if (filters.assigneeId && filters.assigneeId !== 'tous') {
      if (filters.assigneeId === 'non_affectee') {
        if (task.assigneeId !== null) return false;
      } else if (task.assigneeId !== filters.assigneeId) {
        return false;
      }
    }

    if (filters.category && filters.category !== 'toutes' && task.category !== filters.category) {
      return false;
    }

    if (filters.status && filters.status !== 'toutes' && task.status !== filters.status) {
      return false;
    }

    if (filters.priority && filters.priority !== 'toutes' && task.priority !== filters.priority) {
      return false;
    }

    if (filters.search) {
      const needle = filters.search.trim().toLowerCase();
      if (needle) {
        const haystack = `${task.title} ${task.description}`.toLowerCase();
        if (!haystack.includes(needle)) return false;
      }
    }

    return true;
  });
}

export function groupByStatus(tasks: Task[]): Record<Status, Task[]> {
  return {
    a_faire: tasks.filter((t) => t.status === 'a_faire'),
    en_cours: tasks.filter((t) => t.status === 'en_cours'),
    termine: tasks.filter((t) => t.status === 'termine'),
  };
}

/** Une tâche est en retard si sa date d'échéance est dépassée et qu'elle n'est pas terminée. */
export function isOverdue(task: Task, now: number = Date.now()): boolean {
  return task.status !== 'termine' && task.dueDate !== null && task.dueDate < now;
}
