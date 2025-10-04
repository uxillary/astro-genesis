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
  }
}

export const db = new BioArchiveDB();

export const seedIndex = async (items: PaperIndex[]) => {
  const existing = await db.papers.count();
  if (existing > 0) return;
  await db.papers.bulkPut(items.map((item) => ({ ...item, cachedAt: Date.now() })));
};

export const upsertPaperDetail = async (detail: PaperDetail) => {
  await db.papers.put({ ...detail, cachedAt: Date.now() });
};

export const getPaperFromCache = (id: string) => db.papers.get(id);

export const listPaperIndex = () => db.papers.toArray();
