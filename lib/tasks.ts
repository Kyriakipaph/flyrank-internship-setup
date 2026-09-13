import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from './firebase';

const TASKS_COLLECTION = 'tasks';

import type { VibeId } from './vibes';
import type { CategoryId } from './categories';

export type TaskStatus = 'unfinished' | 'completed';
export type CakeType = 'cupcake' | 'cake' | 'tiered';

export type Task = {
  id: string;
  name: string;
  totalSecondsFocused: number;
  targetMinutes: number;
  vibe: VibeId;
  cakeType: CakeType;
  category: CategoryId;
  status: TaskStatus;
  createdAt: Date;
  completedAt?: Date;
  dueDate?: Date;
};

type TaskDoc = {
  name: string;
  totalSecondsFocused: number;
  targetMinutes?: number; // LEGACY
  targetMinutesV2?: number;
  vibe?: VibeId;
  cakeType?: CakeType;
  category?: CategoryId;
  status: TaskStatus;
  createdAt: Timestamp | null;
  completedAt?: Timestamp | null;
  dueDate?: Timestamp | null;
};

function toTask(id: string, data: TaskDoc): Task {
  let targetMinutes: number;
  if (typeof data.targetMinutesV2 === 'number') {
    // Written by current code — always minutes, no migration
    targetMinutes = data.targetMinutesV2;
  } else if (typeof data.targetMinutes === 'number') {
    // Legacy: values 1-6 were actually tier counts, convert to minutes
    const raw = data.targetMinutes;
    targetMinutes = raw <= 6 ? raw * 10 : raw;
  } else {
    targetMinutes = 30;
  }
  return {
    id,
    name: data.name,
    totalSecondsFocused: data.totalSecondsFocused ?? 0,
    targetMinutes,
    vibe: data.vibe ?? 'classic',
    cakeType: data.cakeType ?? 'tiered',
    category: data.category ?? 'other',
    status: data.status,
    createdAt: data.createdAt?.toDate() ?? new Date(),
    completedAt: data.completedAt?.toDate(),
    dueDate: data.dueDate?.toDate(),
  };
}

/** Find an existing unfinished task with this exact name. */
export async function findActiveTaskByName(name: string): Promise<Task | null> {
  const q = query(
    collection(db, TASKS_COLLECTION),
    where('name', '==', name),
    where('status', '==', 'unfinished'),
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return toTask(doc.id, doc.data() as TaskDoc);
}

/** Create a new unfinished task. Returns the new id. */
export async function createTask(opts: {
  name: string;
  targetMinutes?: number;
  cakeType?: CakeType;
  vibe?: VibeId;
  category?: CategoryId;
  dueDate?: Date | null;
}): Promise<string> {
  const payload: Record<string, unknown> = {
    name: opts.name,
    totalSecondsFocused: 0,
    targetMinutesV2: opts.targetMinutes ?? 30,
    cakeType: opts.cakeType ?? 'tiered',
    vibe: opts.vibe ?? 'classic',
    category: opts.category ?? 'other',
    status: 'unfinished',
    createdAt: serverTimestamp(),
  };
  if (opts.dueDate) {
    payload.dueDate = Timestamp.fromDate(opts.dueDate);
  }
  const ref = await addDoc(collection(db, TASKS_COLLECTION), payload);
  return ref.id;
}

/** Update the accumulated focus time on a task. */
export async function updateTaskTime(
  id: string,
  totalSeconds: number,
): Promise<void> {
  await updateDoc(doc(db, TASKS_COLLECTION, id), {
    totalSecondsFocused: totalSeconds,
  });
}

/** Mark task complete and record its final time. */
export async function completeTask(
  id: string,
  totalSeconds: number,
): Promise<void> {
  await updateDoc(doc(db, TASKS_COLLECTION, id), {
    totalSecondsFocused: totalSeconds,
    status: 'completed',
    completedAt: serverTimestamp(),
  });
}

export async function getTask(id: string): Promise<Task | null> {
  const snap = await getDoc(doc(db, TASKS_COLLECTION, id));
  if (!snap.exists()) return null;
  return toTask(snap.id, snap.data() as TaskDoc);
}

export async function getTasks(): Promise<Task[]> {
  const q = query(
    collection(db, TASKS_COLLECTION),
    orderBy('createdAt', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => toTask(d.id, d.data() as TaskDoc));
}

export async function deleteTask(id: string): Promise<void> {
  await deleteDoc(doc(db, TASKS_COLLECTION, id));
}
