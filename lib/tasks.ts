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

export type TaskStatus = 'unfinished' | 'completed';

export type Task = {
  id: string;
  name: string;
  totalSecondsFocused: number;
  targetMinutes: number; // 1..6
  status: TaskStatus;
  createdAt: Date;
  completedAt?: Date;
};

type TaskDoc = {
  name: string;
  totalSecondsFocused: number;
  targetMinutes?: number;
  status: TaskStatus;
  createdAt: Timestamp | null;
  completedAt?: Timestamp | null;
};

function toTask(id: string, data: TaskDoc): Task {
  // Backwards compat: old tasks stored `targetTiers` (1-6) as the value.
  // If we see a small number, assume it's an old tier count and convert.
  const raw = data.targetMinutes ?? 30;
  const targetMinutes = raw <= 6 ? raw * 10 : raw;
  return {
    id,
    name: data.name,
    totalSecondsFocused: data.totalSecondsFocused ?? 0,
    targetMinutes,
    status: data.status,
    createdAt: data.createdAt?.toDate() ?? new Date(),
    completedAt: data.completedAt?.toDate(),
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
export async function createTask(
  name: string,
  targetMinutes: number = 30,
): Promise<string> {
  const ref = await addDoc(collection(db, TASKS_COLLECTION), {
    name,
    totalSecondsFocused: 0,
    targetMinutes,
    status: 'unfinished',
    createdAt: serverTimestamp(),
  });
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
