const INDEX_URL = './data/index.json';
const PAPER_URLS = [id => `./data/papers/${id}.json`, id => `./data_min/clean/${id}.json`];

const state = {
  papers: [],
  filtered: [],
  selected: null,
};

const elements = {
  search: document.getElementById('search'),
  searchSuggestions: document.getElementById('search-suggestions'),
  filters: {
    organism: document.getElementById('filter-organism'),
    experiment: document.getElementById('filter-experiment'),
    year: document.getElementById('filter-year'),
    platform: document.getElementById('filter-platform'),
  },
  publicationList: document.getElementById('publication-list'),
  publicationTitle: document.getElementById('publication-title'),
  publicationMeta: document.getElementById('publication-meta'),
  abstract: document.getElementById('abstract-content'),
  methods: document.getElementById('methods-content'),
  results: document.getElementById('results-content'),
  conclusion: document.getElementById('conclusion-content'),
  metadataList: document.getElementById('metadata-list'),
  aiSummary: document.getElementById('ai-summary'),
  externalLinks: document.getElementById('external-links'),
  branchLines: document.getElementById('branch-lines'),
  trendGraph: document.getElementById('trend-graph'),
};

async function fetchJSON(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}`);
  }
  return response.json();
}

async function loadIndex() {
  try {
    const data = await fetchJSON(INDEX_URL);
    state.papers = data;
    buildFilterOptions();
    populateSearchSuggestions();
    applyFilters();
  } catch (error) {
    console.error('Unable to load index data', error);
    elements.publicationList.innerHTML = '<li class="error">Index unavailable</li>';
  }
}

function buildFilterOptions() {
  const organisms = new Set();
  const experiments = new Set();
  const years = new Set();
  const platforms = new Set();

  state.papers.forEach(paper => {
    if (paper.organism) organisms.add(paper.organism);
    if (paper.experiment_type) experiments.add(paper.experiment_type);
    if (paper.year) years.add(paper.year);
    if (paper.platform) platforms.add(paper.platform);
  });

  populateSelect(elements.filters.organism, [...organisms].sort());
  populateSelect(elements.filters.experiment, [...experiments].sort());
  populateSelect(elements.filters.year, [...years].sort((a, b) => b - a));
  populateSelect(elements.filters.platform, [...platforms].sort());
}

function populateSelect(select, values) {
  values.forEach(value => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });
}

function populateSearchSuggestions() {
  elements.searchSuggestions.innerHTML = '';
  const suggestions = new Set();

  state.papers.forEach(paper => {
    suggestions.add(paper.title);
    (paper.keywords || []).forEach(keyword => suggestions.add(keyword));
  });

  [...suggestions].sort().forEach(value => {
    const option = document.createElement('option');
    option.value = value;
    elements.searchSuggestions.appendChild(option);
  });
}

function applyFilters() {
  const query = elements.search.value.trim().toLowerCase();
  const organism = elements.filters.organism.value;
  const experiment = elements.filters.experiment.value;
  const year = elements.filters.year.value;
  const platform = elements.filters.platform.value;

  state.filtered = state.papers.filter(paper => {
    if (organism && paper.organism !== organism) return false;
    if (experiment && paper.experiment_type !== experiment) return false;
    if (year && String(paper.year) !== year) return false;
    if (platform && paper.platform !== platform) return false;

    if (query) {
      const content = [
        paper.title,
        paper.organism,
        paper.platform,
        paper.experiment_type,
        ...(paper.keywords || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return content.includes(query);
    }

    return true;
  });

  renderPublicationList();
}

function renderPublicationList() {
  elements.publicationList.innerHTML = '';
  if (!state.filtered.length) {
    elements.publicationList.innerHTML = '<li class="empty">No matches found.</li>';
    return;
  }

  state.filtered.forEach(paper => {
    const item = document.createElement('li');
    item.dataset.id = paper.id;
    item.innerHTML = `
      <strong>${paper.title}</strong>
      <div class="meta">${paper.year || 'Unknown'} &bull; ${paper.organism || 'Unspecified'}</div>
    `;
    if (state.selected && state.selected.id === paper.id) {
      item.classList.add('active');
    }
    item.addEventListener('click', () => selectPublication(paper.id));
    elements.publicationList.appendChild(item);
  });
}

async function selectPublication(id) {
  try {
    const paper = await loadPublication(id);
    state.selected = paper;
    updateMainNode(paper);
    updateModules(paper);
    updateMetadata(paper);
    updateLinks(paper);
    renderTrendGraph(paper);
    renderBranchLines();
    highlightSelection(id);
  } catch (error) {
    console.error('Unable to load publication', error);
  }
}

async function loadPublication(id) {
  for (const createUrl of PAPER_URLS) {
    const url = createUrl(id);
    try {
      return await fetchJSON(url);
    } catch (error) {
      // try next location
    }
  }
  throw new Error(`Publication ${id} unavailable`);
}

function updateMainNode(paper) {
  elements.publicationTitle.textContent = paper.title;
  elements.publicationMeta.textContent = [paper.year, paper.platform]
    .filter(Boolean)
    .join(' // ');
}

function updateModules(paper) {
  const sections = paper.sections || {};
  elements.abstract.textContent = sections.abstract || 'Abstract unavailable in data asset.';
  elements.methods.textContent = sections.methods || 'Methods unavailable in data asset.';
  elements.results.textContent = sections.results || 'Results unavailable in data asset.';
  elements.conclusion.textContent = sections.conclusion || 'Conclusion unavailable in data asset.';
  elements.aiSummary.textContent =
    'AI uplink placeholder: future LLM analysis will surface mission outcomes, anomalies, and actionable insights.';
}

function updateMetadata(paper) {
  const metadata = [
    ['Mission ID', paper.id],
    ['Authors', (paper.authors || []).join(', ') || 'Restricted'],
    ['Organism', paper.organism || 'N/A'],
    ['Experiment Type', paper.experiment_type || 'N/A'],
    ['Platform', paper.platform || 'N/A'],
    ['Year', paper.year || 'N/A'],
    ['Keywords', (paper.keywords || []).join(', ') || 'None'],
  ];

  elements.metadataList.innerHTML = '';
  metadata.forEach(([label, value]) => {
    const dt = document.createElement('dt');
    dt.textContent = label;
    const dd = document.createElement('dd');
    dd.textContent = value;
    elements.metadataList.append(dt, dd);
  });
}

function updateLinks(paper) {
  elements.externalLinks.innerHTML = '';
  const links = paper.links || {};
  const entries = Object.entries(links);
  if (!entries.length) {
    elements.externalLinks.innerHTML = '<li>No external channels registered.</li>';
    return;
  }

  entries.forEach(([key, url]) => {
    const li = document.createElement('li');
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.textContent = key.replace(/_/g, ' ');
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    li.appendChild(anchor);
    elements.externalLinks.appendChild(li);
  });
}

function renderBranchLines() {
  const svg = elements.branchLines;
  svg.innerHTML = '';
  const mainNode = document.getElementById('main-node');
  const modules = document.querySelectorAll('.module--data');

  const panelRect = svg.getBoundingClientRect();
  const mainRect = mainNode.getBoundingClientRect();

  modules.forEach(module => {
    const moduleRect = module.getBoundingClientRect();
    const startX = mainRect.left + mainRect.width / 2 - panelRect.left;
    const startY = mainRect.bottom - panelRect.top;
    const endX = moduleRect.left + moduleRect.width / 2 - panelRect.left;
    const endY = moduleRect.top - panelRect.top;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const midY = (startY + endY) / 2;
    const d = `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`;
    path.setAttribute('d', d);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'rgba(0, 246, 255, 0.35)');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('class', 'branch-line');

    const glow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    glow.setAttribute('d', d);
    glow.setAttribute('fill', 'none');
    glow.setAttribute('stroke', 'rgba(0, 246, 255, 0.12)');
    glow.setAttribute('stroke-width', '6');
    glow.setAttribute('stroke-linecap', 'round');

    svg.appendChild(glow);
    svg.appendChild(path);
  });
}

function renderTrendGraph(paper) {
  const svg = elements.trendGraph;
  svg.innerHTML = '';
  const width = 300;
  const height = 120;
  const padding = 20;
  const points = generateTrendValues(paper.keywords || []);
  if (!points.length) {
    svg.innerHTML = '<text x="50%" y="50%" fill="var(--muted)" text-anchor="middle">No telemetry</text>';
    return;
  }

  const maxValue = Math.max(...points.map(p => p.value));
  const step = (width - padding * 2) / (points.length - 1 || 1);

  const pathData = points
    .map((point, index) => {
      const x = padding + index * step;
      const y = height - padding - (point.value / maxValue) * (height - padding * 2);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', pathData);
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', 'var(--primary)');
  path.setAttribute('stroke-width', '2');
  path.setAttribute('stroke-linejoin', 'round');
  path.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.appendChild(path);

  points.forEach((point, index) => {
    const x = padding + index * step;
    const y = height - padding - (point.value / maxValue) * (height - padding * 2);
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x);
    circle.setAttribute('cy', y);
    circle.setAttribute('r', 4);
    circle.setAttribute('fill', 'var(--accent)');
    svg.appendChild(circle);
  });
}

function generateTrendValues(keywords) {
  const baseKeywords = keywords.length ? keywords : ['telemetry', 'signal', 'payload'];
  return baseKeywords.map((keyword, index) => ({
    label: keyword,
    value: 40 + ((keyword.length * 13 + index * 11) % 60),
  }));
}

function highlightSelection(id) {
  document.querySelectorAll('#publication-list li').forEach(item => {
    item.classList.toggle('active', item.dataset.id === id);
  });
}

elements.search.addEventListener('input', () => {
  applyFilters();
});

Object.values(elements.filters).forEach(select => {
  select.addEventListener('change', applyFilters);
});

window.addEventListener('resize', () => {
  requestAnimationFrame(renderBranchLines);
});

window.addEventListener('load', () => {
  requestAnimationFrame(renderBranchLines);
});

document.addEventListener('DOMContentLoaded', loadIndex);
