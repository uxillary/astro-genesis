import Dexie, { Table } from 'dexie';
import type { PaperDetail, PaperIndex } from './types';

export type PaperRecord = PaperIndex & {
  sections?: PaperDetail['sections'];
  links?: PaperDetail['links'];
  cachedAt?: number;
};

class BioArchiveDB extends Dexie {
  papers!: Table<PaperRecord, string>;

  constructor() {
    super('bio-archive');
    this.version(1).stores({
      papers: '&id, year, organism, platform'
    });

    this.version(2)
      .stores({
        papers: '&id, year, organism, platform, title'
      })
      .upgrade(async (transaction) => {
        await transaction
          .table<PaperRecord>('papers')
          .toCollection()
          .modify((record) => {
            record.access ??= [];
            record.citations_by_year ??= [];
            record.confidence ??= 0.5;
            record.entities ??= [];
          });
      });
  }
}

let db: BioArchiveDB | null = null;
let dbInitError: unknown = null;

try {
  db = new BioArchiveDB();
} catch (error) {
  dbInitError = error;
  // eslint-disable-next-line no-console
  console.warn('[BioArchive] Dexie unavailable, disabling offline cache.', error);
}

const memoryStore = new Map<string, PaperRecord>();

const writeToMemory = (
  payload: Partial<PaperRecord> & { id: string },
  options: { refreshCachedAt?: boolean } = {}
) => {
  const existing = memoryStore.get(payload.id);
  const merged: PaperRecord = {
    ...existing,
    ...payload,
    cachedAt: options.refreshCachedAt ? Date.now() : existing?.cachedAt ?? Date.now()
  } as PaperRecord;
  memoryStore.set(payload.id, merged);
  return merged;
};

export const isDexieAvailable = () => db !== null;
export const getDexieInitError = () => dbInitError;

export const seedIndex = async (items: PaperIndex[]) => {
  if (db) {
    const database = db;
    await database.transaction('rw', database.papers, async () => {
      await Promise.all(
        items.map(async (item) => {
          const existing = await database.papers.get(item.id);
          await database.papers.put({ ...existing, ...item, cachedAt: existing?.cachedAt ?? Date.now() });
        })
      );
    });
    return;
  }

  items.forEach((item) => {
    writeToMemory(item);
  });
};

export const upsertPaperDetail = async (detail: PaperDetail) => {
  if (db) {
    const database = db;
    const existing = await database.papers.get(detail.id);
    await database.papers.put({ ...existing, ...detail, cachedAt: Date.now() });
    return;
  }

  writeToMemory(detail, { refreshCachedAt: true });
};

export const getPaperFromCache = (id: string) => {
  if (db) {
    return db.papers.get(id);
  }
  return Promise.resolve(memoryStore.get(id));
};

export const listPaperIndex = () => {
  if (db) {
    return db.papers.orderBy('year').reverse().toArray();
  }
  const records = Array.from(memoryStore.values()).sort((a, b) => b.year - a.year);
  return Promise.resolve(records);
};

export { db };
