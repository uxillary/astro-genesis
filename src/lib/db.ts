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

export const db = new BioArchiveDB();

export const seedIndex = async (items: PaperIndex[]) => {
  await db.transaction('rw', db.papers, async () => {
    await Promise.all(
      items.map(async (item) => {
        const existing = await db.papers.get(item.id);
        await db.papers.put({ ...existing, ...item, cachedAt: existing?.cachedAt ?? Date.now() });
      })
    );
  });
};

export const upsertPaperDetail = async (detail: PaperDetail) => {
  const existing = await db.papers.get(detail.id);
  await db.papers.put({ ...existing, ...detail, cachedAt: Date.now() });
};

export const getPaperFromCache = (id: string) => db.papers.get(id);

export const listPaperIndex = () => db.papers.orderBy('year').reverse().toArray();
