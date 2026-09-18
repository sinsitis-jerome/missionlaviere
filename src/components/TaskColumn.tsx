import type { Household, Status, Task } from '../types';
import { STATUS_LABELS } from '../types';
import { TaskCard } from './TaskCard';

export function TaskColumn({
  status,
  tasks,
  household,
  onOpenTask,
}: {
  status: Status;
  tasks: Task[];
  household: Household;
  onOpenTask: (task: Task) => void;
}) {
  return (
    <section className={`colonne colonne--${status}`} aria-label={STATUS_LABELS[status]}>
      <header className="colonne__entete">
        <h2>{STATUS_LABELS[status]}</h2>
        <span className="colonne__compteur">{tasks.length}</span>
      </header>

      <div className="colonne__liste">
        {tasks.length === 0 ? (
          <p className="colonne__vide">Rien ici pour l'instant.</p>
        ) : (
          tasks.map((task) => (
            <TaskCard key={task.id} task={task} household={household} onOpen={() => onOpenTask(task)} />
          ))
        )}
      </div>
    </section>
  );
}
