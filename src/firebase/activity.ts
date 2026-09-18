import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { requireDb } from './config';
import type { ActivityEntry, ActivityType } from '../types';
import { buildActivityText } from '../lib/activityText';

function activityCollection(householdId: string, taskId: string) {
  return collection(requireDb(), 'households', householdId, 'tasks', taskId, 'activity');
}

interface LogActivityArgs {
  type: ActivityType;
  authorId: string;
  authorName: string;
  text: string;
  from?: string | null;
  to?: string | null;
}

export async function logActivity(
  householdId: string,
  taskId: string,
  args: LogActivityArgs,
): Promise<void> {
  const text = args.type === 'commentaire' ? args.text : buildActivityText(args);

  await addDoc(activityCollection(householdId, taskId), {
    type: args.type,
    authorId: args.authorId,
    authorName: args.authorName,
    text,
    createdAt: serverTimestamp(),
  });
}

export async function addComment(
  householdId: string,
  taskId: string,
  authorId: string,
  authorName: string,
  text: string,
): Promise<void> {
  const trimmed = text.trim();
  if (!trimmed) return;
  await logActivity(householdId, taskId, {
    type: 'commentaire',
    authorId,
    authorName,
    text: trimmed,
  });
}

export function subscribeToActivity(
  householdId: string,
  taskId: string,
  callback: (entries: ActivityEntry[]) => void,
): () => void {
  const q = query(activityCollection(householdId, taskId), orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snap) => {
    callback(
      snap.docs.map((d) => {
        const data = d.data() as Record<string, unknown>;
        const createdAt = data.createdAt as { toMillis?: () => number } | number | undefined;
        return {
          id: d.id,
          taskId,
          type: (data.type as ActivityType) ?? 'commentaire',
          authorId: (data.authorId as string) ?? '',
          authorName: (data.authorName as string) ?? '',
          text: (data.text as string) ?? '',
          createdAt: typeof createdAt === 'number' ? createdAt : createdAt?.toMillis?.() ?? Date.now(),
        };
      }),
    );
  });
}
