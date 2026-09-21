import { useEffect, useState } from 'react';
import type { ActivityEntry, Household, Priority, Recurrence, Status, Task } from '../types';
import { PRIORITY_LABELS, PRIORITY_ORDER, STATUS_LABELS, STATUS_ORDER } from '../types';
import { Modal } from './Modal';
import { RecurrencePicker } from './RecurrencePicker';
import { ActivityFeed } from './ActivityFeed';
import { CommentBox } from './CommentBox';
import { subscribeToActivity, addComment } from '../firebase/activity';
import {
  changeTaskCategory,
  changeTaskDueDate,
  changeTaskPriority,
  changeTaskRecurrence,
  changeTaskStatus,
  deleteTask,
  editTaskDetails,
  reassignTask,
} from '../firebase/tasks';
import { describeRecurrence } from '../lib/recurrence';
import { formatDueDate } from '../lib/dates';
import { useAuth } from '../context/AuthContext';

export function TaskDetailModal({
  task,
  household,
  onClose,
}: {
  task: Task;
  household: Household;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [editingDetails, setEditingDetails] = useState(false);

  useEffect(() => {
    return subscribeToActivity(household.id, task.id, setActivity);
  }, [household.id, task.id]);

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description);
  }, [task.id, task.title, task.description]);

  if (!user) return null;
  const authorId = user.uid;
  const authorName = household.members[user.uid]?.displayName ?? user.displayName ?? 'Un membre';

  async function handleStatusChange(status: Status) {
    if (status === task.status) return;
    await changeTaskStatus(household.id, task, status, authorId, authorName);
  }

  async function handlePriorityChange(priority: Priority) {
    if (priority === task.priority) return;
    await changeTaskPriority(household.id, task, priority, authorId, authorName);
  }

  async function handleCategoryChange(category: string) {
    if (category === task.category) return;
    await changeTaskCategory(household.id, task, category, authorId, authorName);
  }

  async function handleAssigneeChange(assigneeId: string) {
    const nextId = assigneeId || null;
    if (nextId === task.assigneeId) return;
    const nextName = nextId ? household.members[nextId]?.displayName ?? null : null;
    await reassignTask(household.id, task, nextId, nextName, authorId, authorName);
  }

  async function handleDueDateChange(value: string) {
    const nextTimestamp = value ? new Date(value).getTime() : null;
    if (nextTimestamp === task.dueDate) return;
    await changeTaskDueDate(
      household.id,
      task,
      nextTimestamp,
      nextTimestamp ? formatDueDate(nextTimestamp) : null,
      authorId,
      authorName,
    );
  }

  async function handleRecurrenceChange(recurrence: Recurrence | null) {
    await changeTaskRecurrence(
      household.id,
      task,
      recurrence,
      recurrence ? describeRecurrence(recurrence) : null,
      authorId,
      authorName,
    );
  }

  async function handleSaveDetails() {
    await editTaskDetails(household.id, task.id, { title, description });
    setEditingDetails(false);
  }

  async function handleDelete() {
    if (!confirm('Supprimer définitivement cette tâche ?')) return;
    await deleteTask(household.id, task.id);
    onClose();
  }

  return (
    <Modal title="Détail de la tâche" onClose={onClose} wide>
      <div className="detail-tache">
        {editingDetails ? (
          <div className="detail-tache__edition">
            <input value={title} onChange={(e) => setTitle(e.target.value)} aria-label="Titre" />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              aria-label="Description"
            />
            <div className="formulaire__actions">
              <button className="bouton bouton--texte" onClick={() => setEditingDetails(false)}>
                Annuler
              </button>
              <button className="bouton bouton--plein" onClick={handleSaveDetails}>
                Enregistrer
              </button>
            </div>
          </div>
        ) : (
          <button className="detail-tache__titre" onClick={() => setEditingDetails(true)}>
            <h3>{task.title}</h3>
            {task.description && <p>{task.description}</p>}
            <span className="lien">Modifier</span>
          </button>
        )}

        <div className="detail-tache__grille">
          <div>
            <span className="etiquette">Statut</span>
            <div className="segmente">
              {STATUS_ORDER.map((s) => (
                <button
                  key={s}
                  className={`segmente__bouton${task.status === s ? ' segmente__bouton--actif' : ''}`}
                  onClick={() => handleStatusChange(s)}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="etiquette">Catégorie</span>
            <select value={task.category} onChange={(e) => handleCategoryChange(e.target.value)}>
              {!household.categories.includes(task.category) && (
                <option value={task.category}>{task.category}</option>
              )}
              {household.categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <span className="etiquette">Priorité</span>
            <select value={task.priority} onChange={(e) => handlePriorityChange(e.target.value as Priority)}>
              {PRIORITY_ORDER.map((p) => (
                <option key={p} value={p}>
                  {PRIORITY_LABELS[p]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <span className="etiquette">Affectée à</span>
            <select value={task.assigneeId ?? ''} onChange={(e) => handleAssigneeChange(e.target.value)}>
              <option value="">Personne</option>
              {Object.values(household.members).map((m) => (
                <option key={m.uid} value={m.uid}>
                  {m.displayName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <span className="etiquette">Échéance</span>
            <input
              type="date"
              value={task.dueDate ? toDateInputValue(task.dueDate) : ''}
              onChange={(e) => handleDueDateChange(e.target.value)}
            />
          </div>
        </div>

        <RecurrencePicker value={task.recurrence} onChange={handleRecurrenceChange} />

        <button className="lien lien--danger" onClick={handleDelete}>
          Supprimer la tâche
        </button>

        <hr className="separateur" />

        <h4>Activité</h4>
        <ActivityFeed entries={activity} />
        <CommentBox onSubmit={(text) => addComment(household.id, task.id, authorId, authorName, text)} />
      </div>
    </Modal>
  );
}

function toDateInputValue(timestamp: number): string {
  const d = new Date(timestamp);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}