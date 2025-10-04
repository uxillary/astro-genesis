import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const organisms = ['Arabidopsis thaliana', 'Mus musculus', 'Caenorhabditis elegans', 'Saccharomyces cerevisiae'];
const platforms = ['ISS - Veggie', 'ISS - WetLab-2', 'ISS - Kubik', 'Deep Space Habitat'];
const keywordsPool = [
  'microgravity',
  'gene expression',
  'root morphology',
  'radiation response',
  'immune modulation',
  'cell differentiation',
  'metabolomics',
  'transcriptomics',
  'photosynthesis',
  'circadian rhythm'
];

const paragraphs = [
  'Microgravity environments alter cellular morphology and biochemical signaling cascades, prompting adaptive responses across multiple organ systems.',
  'Radiation shielding strategies were evaluated alongside transcriptomic profiling to identify mission-critical biomarkers.',
  'Automated imaging payloads captured time-series datasets to quantify phenotypic drift under extended orbital exposure.',
  'Crew-operated assays validated ground-based analog simulations, highlighting variance in nutrient uptake kinetics.'
];

const baseDir = join(process.cwd(), 'public', 'data');

const randomFrom = <T,>(array: T[]): T => array[Math.floor(Math.random() * array.length)];

const sentence = () => {
  const selected = Array.from({ length: 2 + Math.floor(Math.random() * 2) }, () => randomFrom(paragraphs));
  return selected.join(' ');
};

const generatePaper = (index: number) => {
  const id = `exp_${(index + 1).toString().padStart(3, '0')}`;
  const title = `Bioadaptive Study ${index + 1}`;
  const authors = [`Dr. ${String.fromCharCode(65 + index)}. Vega`, `Lt. ${String.fromCharCode(77 + index)}. Orion`];
  const year = 2016 + index;
  const organism = randomFrom(organisms);
  const platform = randomFrom(platforms);
  const keywords = Array.from(new Set(Array.from({ length: 3 }, () => randomFrom(keywordsPool))));
  return {
    id,
    title,
    authors,
    year,
    organism,
    platform,
    keywords,
    sections: {
      abstract: sentence(),
      methods: sentence(),
      results: sentence(),
      conclusion: sentence()
    },
    links: {
      taskbook: `https://example.com/taskbook/${id}`,
      osdr: `https://example.com/osdr/${id}`
    }
  };
};

const run = async () => {
  await mkdir(join(baseDir, 'papers'), { recursive: true });
  const papers = Array.from({ length: 10 }, (_, index) => generatePaper(index));
  const indexEntries = papers.map(({ sections, links, ...rest }) => rest);

  await writeFile(join(baseDir, 'index.json'), JSON.stringify(indexEntries, null, 2));

  await Promise.all(
    papers.map((paper) => writeFile(join(baseDir, 'papers', `${paper.id}.json`), JSON.stringify(paper, null, 2)))
  );

  console.log('Dummy data generated in public/data');
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
