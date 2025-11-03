import { openDB } from 'idb';

const DB_NAME = 'floodsense';
const DB_VERSION = 1;
const STORE = 'kv';

let dbPromise;
function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE, { keyPath: 'key' });
        }
      },
    });
  }
  return dbPromise;
}

export async function idbSetItem(key, value) {
  const db = await getDB();
  await db.put(STORE, { key, value });
}

export async function idbGetItem(key) {
  const db = await getDB();
  const row = await db.get(STORE, key);
  return row?.value ?? null;
}

export async function setFallbacks(list) {
  try {
    await idbSetItem('fallbacks', Array.isArray(list) ? list : []);
  } catch (_) {
    // ignore
  }
}

export async function getFallbacks() {
  try {
    const list = await idbGetItem('fallbacks');
    return Array.isArray(list) ? list : [];
  } catch (_) {
    return [];
  }
}
