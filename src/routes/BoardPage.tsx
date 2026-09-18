import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useHousehold } from '../context/HouseholdContext';
import { subscribeToTasks, createTask } from '../firebase/tasks';
import type { Task } from '../types';
import { STATUS_ORDER } from '../types';
import { filterTasks, groupByStatus, sortTasks, type TaskFilters as TaskFiltersState } from '../lib/sort';
import { TaskColumn } from '../components/TaskColumn';
import { TaskFilters } from '../components/TaskFilters';
import { TaskFormModal } from '../components/TaskFormModal';
import { TaskDetailModal } from '../components/TaskDetailModal';
import { EmptyState } from '../components/EmptyState';

export function BoardPage() {
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<TaskFiltersState>({});
  const [showForm, setShowForm] = useState(false);
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);

  useEffect(() => {
    if (!currentHousehold) return;
    setLoading(true);
    return subscribeToTasks(currentHousehold.id, (t) => {
      setTasks(t);
      setLoading(false);
    });
  }, [currentHousehold?.id]);

  const visibleTasks = useMemo(() => sortTasks(filterTasks(tasks, filters)), [tasks, filters]);
  const grouped = useMemo(() => groupByStatus(visibleTasks), [visibleTasks]);
  const openTask = openTaskId ? tasks.find((t) => t.id === openTaskId) ?? null : null;

  if (!currentHousehold || !user) return null;

  return (
    <div className="tableau">
      <div className="tableau__barre">
        <TaskFilters household={currentHousehold} filters={filters} onChange={setFilters} />
        <button className="bouton bouton--plein" onClick={() => setShowForm(true)}>
          + Nouvelle tâche
        </button>
      </div>

      {!loading && tasks.length === 0 ? (
        <EmptyState onCreate={() => setShowForm(true)} />
      ) : (
        <div className="tableau__colonnes">
          {STATUS_ORDER.map((status) => (
            <TaskColumn
              key={status}
              status={status}
              tasks={grouped[status]}
              household={currentHousehold}
              onOpenTask={(task) => setOpenTaskId(task.id)}
            />
          ))}
        </div>
      )}

      {showForm && (
        <TaskFormModal
          household={currentHousehold}
          onClose={() => setShowForm(false)}
          onCreate={(input) =>
            createTask(
              currentHousehold.id,
              user.uid,
              currentHousehold.members[user.uid]?.displayName ?? user.displayName ?? 'Un membre',
              input,
            ).then(() => {})
          }
        />
      )}

      {openTask && (
        <TaskDetailModal task={openTask} household={currentHousehold} onClose={() => setOpenTaskId(null)} />
      )}
    </div>
  );
}
