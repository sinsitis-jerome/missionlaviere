import { useState } from 'react';
import type { Household, Task } from '../types';
import { TaskCard } from './TaskCard';
import { UrgentIcon } from './icons/UrgentIcon';

export function CategoryGroup({
  category,
  tasks,
  household,
  onOpenTask,
}: {
  category: string;
  tasks: Task[];
  household: Household;
  onOpenTask: (task: Task) => void;
}) {
  const [ouverte, setOuverte] = useState(false);
  const contientUrgente = tasks.some((t) => t.priority === 'urgente');

  return (
    <div className={`groupe-categorie${ouverte ? ' groupe-categorie--ouverte' : ''}`}>
      <button
        type="button"
        className="groupe-categorie__entete"
        onClick={() => setOuverte((v) => !v)}
        aria-expanded={ouverte}
      >
        <span className="groupe-categorie__chevron" aria-hidden="true" />
        <span className="groupe-categorie__nom">{category}</span>
        {contientUrgente && <UrgentIcon />}
        <span className="groupe-categorie__compteur">{tasks.length}</span>
      </button>

      {ouverte && (
        <div className="groupe-categorie__liste">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} household={household} onOpen={() => onOpenTask(task)} />
          ))}
        </div>
      )}
    </div>
  );
}
