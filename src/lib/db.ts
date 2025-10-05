import Dexie, { Table } from 'dexie';
import type { CitationPoint, PaperDetail, PaperIndex } from './types';

export type PaperRecord = PaperIndex & {
  sections?: PaperDetail['sections'];
  links?: PaperDetail['links'];
  ai_summary?: string;
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

const compareCitationPoints = (a: CitationPoint[], b: CitationPoint[]) => {
  if (a.length !== b.length) return false;
  return a.every((point, index) => {
    const other = b[index];
    return other?.y === point.y && other?.c === point.c;
  });
};

const compareArrays = (a: string[], b: string[]) => {
  if (a.length !== b.length) return false;
  return a.every((value, index) => value === b[index]);
};

const hasIndexChanged = (existing: PaperRecord | undefined, next: PaperIndex) => {
  if (!existing) return true;
  if (
    existing.title !== next.title ||
    existing.year !== next.year ||
    existing.organism !== next.organism ||
    existing.platform !== next.platform ||
    existing.confidence !== next.confidence
  ) {
    return true;
  }
  if (!compareArrays(existing.authors ?? [], next.authors)) return true;
  if (!compareArrays(existing.keywords ?? [], next.keywords)) return true;
  if (!compareArrays(existing.access ?? [], next.access)) return true;
  if (!compareArrays(existing.entities ?? [], next.entities)) return true;
  if (!compareCitationPoints(existing.citations_by_year ?? [], next.citations_by_year)) return true;
  return false;
};

export const seedIndex = async (items: PaperIndex[]) => {
  if (db) {
    const database = db;
    if (items.length === 0) {
      return;
    }

    await database.transaction('rw', database.papers, async () => {
      const ids = items.map((item) => item.id);
      const existingRecords = await database.papers.bulkGet(ids);
      const updates: PaperRecord[] = [];

      items.forEach((item, index) => {
        const existing = existingRecords[index] ?? undefined;
        const merged: PaperRecord = {
          ...existing,
          ...item,
          cachedAt: existing?.cachedAt ?? Date.now()
        };

        if (hasIndexChanged(existing ?? undefined, item)) {
          updates.push(merged);
        }
      });

      if (updates.length > 0) {
        await database.papers.bulkPut(updates);
      }
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
