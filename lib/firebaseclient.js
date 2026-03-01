import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  signOut as fbSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export function subscribeAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  await ensureUserProfile(result.user.uid, {
    email: result.user.email,
    name: result.user.displayName,
    photoURL: result.user.photoURL,
  });
  return result;
}

export async function signOut() {
  return fbSignOut(auth);
}

export async function getUserProfile(uid) {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function setUserProfile(uid, data) {
  const ref = doc(db, 'users', uid);
  await setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

export async function ensureUserProfile(uid, { email, name, photoURL }) {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      email: email || '',
      name: name || '',
      photoURL: photoURL || null,
      startWeight: 0,
      targetWeight: 0,
      createdAt: serverTimestamp(),
    });
  }
}

// --- Weights ---
const MIN_WEIGHT = 30;
const MAX_WEIGHT = 800;

export function validateWeight(weight) {
  const n = Number(weight);
  if (Number.isNaN(n)) return { valid: false, error: 'Please enter a valid number.' };
  if (n < MIN_WEIGHT || n > MAX_WEIGHT) {
    return { valid: false, error: `Weight must be between ${MIN_WEIGHT} and ${MAX_WEIGHT} lbs.` };
  }
  return { valid: true, value: n };
}

/** Upsert weight for a week (one record per userId + weekStart). Replaces if same week. */
export async function setWeightForWeek(uid, weight, weekStart) {
  const validation = validateWeight(weight);
  if (!validation.valid) throw new Error(validation.error);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(weekStart)) throw new Error('Invalid weekStart format.');

  const col = collection(db, 'weights');
  const q = query(col, where('userId', '==', uid), where('weekStart', '==', weekStart));
  const snap = await getDocs(q);

  const batch = writeBatch(db);
  if (!snap.empty) {
    batch.update(snap.docs[0].ref, {
      weight: validation.value,
      updatedAt: serverTimestamp(),
    });
  } else {
    const newRef = doc(col);
    batch.set(newRef, {
      userId: uid,
      weight: validation.value,
      weekStart,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
  await batch.commit();
  return { weekStart, weight: validation.value };
}

/** Legacy: pass any date, converts to weekStart. Prefer setWeightForWeek. */
export async function setWeightForDay(uid, weight, date) {
  const { getWeekStart } = await import('./dateUtils');
  const weekStart = getWeekStart(date);
  return setWeightForWeek(uid, weight, weekStart);
}

export async function getWeightsForUser(uid) {
  const col = collection(db, 'weights');
  const q = query(col, where('userId', '==', uid));
  const snap = await getDocs(q);
  const raw = snap.docs.map((d) => {
    const data = d.data();
    const dateKey = data.weekStart || data.date;
    const updated = data.updatedAt?.toMillis?.() ?? 0;
    const created = data.createdAt?.toMillis?.() ?? 0;
    return {
      id: d.id,
      ...data,
      date: dateKey,
      weekStart: dateKey,
      _sortTs: updated || created,
      createdAt: data.createdAt?.toDate?.()?.toISOString?.() ?? data.createdAt,
    };
  });
  const byKey = {};
  raw.forEach((r) => {
    const key = r.weekStart || r.date;
    if (!key) return;
    if (!byKey[key] || (r._sortTs > (byKey[key]._sortTs || 0))) byKey[key] = r;
  });
  const docs = Object.values(byKey).map((r) => {
    const { _sortTs, ...rest } = r;
    return { ...rest, _sortTs };
  });
  docs.sort((a, b) => ((a.weekStart || a.date || '') > (b.weekStart || b.date || '') ? -1 : 1));
  return docs;
}

export async function getAllUsers() {
  const col = collection(db, 'users');
  const snap = await getDocs(col);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getAllWeights(opts = {}) {
  const col = collection(db, 'weights');
  const snap = await getDocs(col);
  const raw = snap.docs.map((d) => {
    const data = d.data();
    const dateKey = data.weekStart || data.date;
    const updated = data.updatedAt?.toMillis?.() ?? 0;
    const created = data.createdAt?.toMillis?.() ?? 0;
    return { id: d.id, ...data, date: dateKey, weekStart: dateKey, _sortTs: updated || created };
  });
  const byUserDate = {};
  raw.forEach((r) => {
    const dk = r.weekStart || r.date;
    if (!dk || !r.userId) return;
    const key = `${r.userId}::${dk}`;
    if (!byUserDate[key] || (r._sortTs > (byUserDate[key]._sortTs || 0))) byUserDate[key] = r;
  });
  let docs = Object.values(byUserDate).map((r) => {
    const { _sortTs, ...rest } = r;
    return { ...rest, _sortTs };
  });
  if (opts.weekStartMin || opts.dateMin) {
    const min = opts.dateMin || opts.weekStartMin;
    docs = docs.filter((d) => (d.weekStart || d.date || '') >= min);
  }
  docs.sort((a, b) =>
    (a.weekStart || a.date || '') > (b.weekStart || b.date || '') ? -1 : 1
  );
  return docs;
}
