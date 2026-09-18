import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { requireDb } from './config';
import type { NewTaskInput, Priority, Recurrence, Status, Task } from '../types';
import { computeNextDueDate } from '../lib/recurrence';
import { logActivity } from './activity';

function tasksCollection(householdId: string) {
  return collection(requireDb(), 'households', householdId, 'tasks');
}

export function subscribeToTasks(
  householdId: string,
  callback: (tasks: Task[]) => void,
): () => void {
  const q = query(tasksCollection(householdId), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => normalizeTask(householdId, d.id, d.data())));
  });
}

export async function createTask(
  householdId: string,
  authorId: string,
  authorName: string,
  input: NewTaskInput,
): Promise<string> {
  const ref = await addDoc(tasksCollection(householdId), {
    title: input.title.trim(),
    description: input.description.trim(),
    category: input.category,
    priority: input.priority,
    status: 'a_faire' satisfies Status,
    assigneeId: input.assigneeId,
    createdBy: authorId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    dueDate: input.dueDate,
    recurrence: input.recurrence,
    completedAt: null,
    completedBy: null,
  });

  await logActivity(householdId, ref.id, {
    type: 'creation',
    authorId,
    authorName,
    text: '',
  });

  return ref.id;
}

export async function updateTaskFields(
  householdId: string,
  taskId: string,
  fields: Partial<Task>,
): Promise<void> {
  const ref = doc(requireDb(), 'households', householdId, 'tasks', taskId);
  await updateDoc(ref, { ...fields, updatedAt: serverTimestamp() });
}

export async function deleteTask(householdId: string, taskId: string): Promise<void> {
  await deleteDoc(doc(requireDb(), 'households', householdId, 'tasks', taskId));
}

/**
 * Change le statut d'une tâche. Si elle passe à "terminée" et qu'elle est
 * récurrente, une nouvelle occurrence est créée avec la prochaine échéance.
 */
export async function changeTaskStatus(
  householdId: string,
  task: Task,
  newStatus: Status,
  authorId: string,
  authorName: string,
): Promise<void> {
  const ref = doc(requireDb(), 'households', householdId, 'tasks', task.id);
  const now = Date.now();

  await updateDoc(ref, {
    status: newStatus,
    updatedAt: serverTimestamp(),
    completedAt: newStatus === 'termine' ? serverTimestamp() : null,
    completedBy: newStatus === 'termine' ? authorId : null,
  });

  await logActivity(householdId, task.id, {
    type: 'statut',
    authorId,
    authorName,
    text: '',
    from: task.status,
    to: newStatus,
  });

  if (newStatus === 'termine' && task.recurrence) {
    const baseDate = task.dueDate ?? now;
    const nextDueDate = computeNextDueDate(baseDate, task.recurrence);

    const newRef = await addDoc(tasksCollection(householdId), {
      title: task.title,
      description: task.description,
      category: task.category,
      priority: task.priority,
      status: 'a_faire' satisfies Status,
      assigneeId: task.assigneeId,
      createdBy: task.createdBy,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      dueDate: nextDueDate,
      recurrence: task.recurrence,
      completedAt: null,
      completedBy: null,
    });

    await logActivity(householdId, newRef.id, {
      type: 'creation',
      authorId,
      authorName,
      text: '',
    });
  }
}

export async function reassignTask(
  householdId: string,
  task: Task,
  newAssigneeId: string | null,
  newAssigneeName: string | null,
  authorId: string,
  authorName: string,
): Promise<void> {
  const ref = doc(requireDb(), 'households', householdId, 'tasks', task.id);
  await updateDoc(ref, { assigneeId: newAssigneeId, updatedAt: serverTimestamp() });

  await logActivity(householdId, task.id, {
    type: 'affectation',
    authorId,
    authorName,
    text: '',
    to: newAssigneeName,
  });
}

export async function changeTaskPriority(
  householdId: string,
  task: Task,
  newPriority: Priority,
  authorId: string,
  authorName: string,
): Promise<void> {
  const ref = doc(requireDb(), 'households', householdId, 'tasks', task.id);
  await updateDoc(ref, { priority: newPriority, updatedAt: serverTimestamp() });
  await logActivity(householdId, task.id, {
    type: 'priorite',
    authorId,
    authorName,
    text: '',
    from: task.priority,
    to: newPriority,
  });
}

export async function changeTaskDueDate(
  householdId: string,
  task: Task,
  newDueDate: number | null,
  formattedDate: string | null,
  authorId: string,
  authorName: string,
): Promise<void> {
  const ref = doc(requireDb(), 'households', householdId, 'tasks', task.id);
  await updateDoc(ref, { dueDate: newDueDate, updatedAt: serverTimestamp() });
  await logActivity(householdId, task.id, {
    type: 'echeance',
    authorId,
    authorName,
    text: '',
    to: formattedDate,
  });
}

export async function changeTaskRecurrence(
  householdId: string,
  task: Task,
  newRecurrence: Recurrence | null,
  description: string | null,
  authorId: string,
  authorName: string,
): Promise<void> {
  const ref = doc(requireDb(), 'households', householdId, 'tasks', task.id);
  await updateDoc(ref, { recurrence: newRecurrence, updatedAt: serverTimestamp() });
  await logActivity(householdId, task.id, {
    type: 'recurrence',
    authorId,
    authorName,
    text: '',
    to: description,
  });
}

export async function editTaskDetails(
  householdId: string,
  taskId: string,
  fields: { title: string; description: string; category: string },
): Promise<void> {
  const ref = doc(requireDb(), 'households', householdId, 'tasks', taskId);
  await updateDoc(ref, {
    title: fields.title.trim(),
    description: fields.description.trim(),
    category: fields.category,
    updatedAt: serverTimestamp(),
  });
}

function normalizeTask(householdId: string, id: string, data: Record<string, unknown>): Task {
  const toMillis = (v: unknown): number | null => {
    if (v === null || v === undefined) return null;
    if (typeof v === 'number') return v;
    const ts = v as { toMillis?: () => number };
    return ts.toMillis ? ts.toMillis() : null;
  };

  return {
    id,
    householdId,
    title: (data.title as string) ?? '',
    description: (data.description as string) ?? '',
    category: (data.category as string) ?? '',
    priority: (data.priority as Task['priority']) ?? 'normale',
    status: (data.status as Task['status']) ?? 'a_faire',
    assigneeId: (data.assigneeId as string | null) ?? null,
    createdBy: (data.createdBy as string) ?? '',
    createdAt: toMillis(data.createdAt) ?? Date.now(),
    updatedAt: toMillis(data.updatedAt) ?? Date.now(),
    dueDate: toMillis(data.dueDate),
    recurrence: (data.recurrence as Task['recurrence']) ?? null,
    completedAt: toMillis(data.completedAt),
    completedBy: (data.completedBy as string | null) ?? null,
  };
}
