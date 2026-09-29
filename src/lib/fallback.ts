import type { PaperDetail } from './types';

export const createFallbackPaper = (id: string): PaperDetail => ({
  id,
  title: 'Signal Lost: Placeholder Dossier',
  authors: ['Archive Relay Node'],
  year: new Date().getUTCFullYear(),
  organism: 'Unresolved',
  platform: 'Deep Archive',
  keywords: ['fallback', 'offline', 'stub dossier'],
  confidence: 0.32,
  access: ['ARCHIVE-STUB', 'PROVISIONAL'],
  citations_by_year: [],
  entities: ['ARCHIVE PLACEHOLDER'],
  ai_summary:
    'Analyst uplink unavailable. This synthetic summary placeholder confirms UI integrity until the classified channel resumes transmission.',
  sections: {
    abstract:
      'The uplink to the classified dossier degraded mid-transfer. A synthetic summary shell is on display until the secure channel stabilises.',
    methods:
      'Automated relay nodes are replaying the last known transmission across redundant channels. Manual refresh will initiate a fresh pull from deep storage when connectivity returns.',
    results:
      'No mission telemetry present. Operators should treat this dossier as an illustrative scaffold only—content will repopulate once synchronization succeeds.',
    conclusion:
      'Continue monitoring archive health dashboards. The fallback shell confirms UI integrity while the system awaits a verified dossier payload.'
  },
  links: {}
});
