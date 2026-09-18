import {
  arrayRemove,
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { requireDb } from './config';
import type { Household, HouseholdMember } from '../types';
import { DEFAULT_CATEGORIES, MEMBER_COLORS } from '../types';
import { generateInviteCode, normalizeInviteCode } from '../lib/inviteCode';

const HOUSEHOLDS = 'households';
const INVITE_CODES = 'inviteCodes';

function pickMemberColor(existing: HouseholdMember[]): string {
  const used = new Set(existing.map((m) => m.colorTag));
  const free = MEMBER_COLORS.find((c) => !used.has(c));
  return free ?? MEMBER_COLORS[existing.length % MEMBER_COLORS.length];
}

function memberFromUser(user: User, colorTag: string): HouseholdMember {
  return {
    uid: user.uid,
    displayName: user.displayName ?? user.email ?? 'Membre',
    photoURL: user.photoURL,
    colorTag,
    joinedAt: Date.now(),
  };
}

export async function createHousehold(user: User, name: string): Promise<string> {
  const ref = doc(collection(requireDb(), HOUSEHOLDS));
  const member = memberFromUser(user, MEMBER_COLORS[0]);
  const inviteCode = generateInviteCode();

  const household: Omit<Household, 'id'> = {
    name: name.trim(),
    ownerId: user.uid,
    inviteCode,
    memberIds: [user.uid],
    members: { [user.uid]: member },
    categories: DEFAULT_CATEGORIES,
    createdAt: Date.now(),
  };

  await setDoc(ref, { ...household, createdAt: serverTimestamp() });
  await setDoc(doc(requireDb(), INVITE_CODES, inviteCode), {
    householdId: ref.id,
    createdBy: user.uid,
  });
  return ref.id;
}

export async function joinHouseholdByCode(user: User, rawCode: string): Promise<string> {
  const code = normalizeInviteCode(rawCode);
  const codeSnap = await getDoc(doc(requireDb(), INVITE_CODES, code));

  if (!codeSnap.exists()) {
    throw new Error("Aucun foyer ne correspond à ce code d'invitation.");
  }

  const { householdId } = codeSnap.data() as { householdId: string };
  const householdRef = doc(requireDb(), HOUSEHOLDS, householdId);
  const householdSnap = await getDoc(householdRef);

  if (!householdSnap.exists()) {
    throw new Error("Ce foyer n'existe plus.");
  }

  const household = normalizeHousehold(householdSnap.id, householdSnap.data());

  if (household.memberIds.includes(user.uid)) {
    return household.id;
  }

  const color = pickMemberColor(Object.values(household.members));
  const member = memberFromUser(user, color);

  await updateDoc(householdRef, {
    memberIds: [...household.memberIds, user.uid],
    [`members.${user.uid}`]: member,
  });

  return household.id;
}

export function subscribeToUserHouseholds(
  uid: string,
  callback: (households: Household[]) => void,
): () => void {
  const q = query(collection(requireDb(), HOUSEHOLDS), where('memberIds', 'array-contains', uid));
  return onSnapshot(q, (snap) => {
    const households = snap.docs
      .map((d) => normalizeHousehold(d.id, d.data()))
      .sort((a, b) => a.createdAt - b.createdAt);
    callback(households);
  });
}

export function subscribeToHousehold(
  householdId: string,
  callback: (household: Household | null) => void,
): () => void {
  const ref = doc(requireDb(), HOUSEHOLDS, householdId);
  return onSnapshot(ref, (snap) => {
    if (!snap.exists()) {
      callback(null);
      return;
    }
    callback(normalizeHousehold(snap.id, snap.data()));
  });
}

export async function getHousehold(householdId: string): Promise<Household | null> {
  const ref = doc(requireDb(), HOUSEHOLDS, householdId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return normalizeHousehold(snap.id, snap.data());
}

export async function renameHousehold(householdId: string, name: string): Promise<void> {
  await updateDoc(doc(requireDb(), HOUSEHOLDS, householdId), { name: name.trim() });
}

export async function updateCategories(householdId: string, categories: string[]): Promise<void> {
  await updateDoc(doc(requireDb(), HOUSEHOLDS, householdId), { categories });
}

export async function rotateInviteCode(householdId: string, actorId: string): Promise<string> {
  const household = await getHousehold(householdId);
  const newCode = generateInviteCode();

  await setDoc(doc(requireDb(), INVITE_CODES, newCode), { householdId, createdBy: actorId });
  await updateDoc(doc(requireDb(), HOUSEHOLDS, householdId), { inviteCode: newCode });

  if (household?.inviteCode) {
    await deleteDoc(doc(requireDb(), INVITE_CODES, household.inviteCode));
  }

  return newCode;
}

export async function leaveHousehold(householdId: string, uid: string): Promise<void> {
  const ref = doc(requireDb(), HOUSEHOLDS, householdId);
  await updateDoc(ref, {
    memberIds: arrayRemove(uid),
    [`members.${uid}`]: deleteField(),
  });
}

// Firestore stocke serverTimestamp() comme Timestamp ; on le convertit en ms.
function normalizeHousehold(id: string, data: Record<string, unknown>): Household {
  const createdAt = data.createdAt as { toMillis?: () => number } | number | undefined;
  return {
    id,
    name: (data.name as string) ?? '',
    ownerId: (data.ownerId as string) ?? '',
    inviteCode: (data.inviteCode as string) ?? '',
    memberIds: (data.memberIds as string[]) ?? [],
    members: (data.members as Household['members']) ?? {},
    categories: (data.categories as string[]) ?? DEFAULT_CATEGORIES,
    createdAt: typeof createdAt === 'number' ? createdAt : createdAt?.toMillis?.() ?? Date.now(),
  };
}
