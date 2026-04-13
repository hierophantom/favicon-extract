import { resolveFavicon } from '../dist/index.js';

const input = document.getElementById('url-input');
const resolveBtn = document.getElementById('resolve-btn');
const probeCheckbox = document.getElementById('probe-checkbox');
const summary = document.getElementById('summary');
const resolvedFavicon = document.getElementById('resolved-favicon');
const resolvedFaviconLabel = document.getElementById('resolved-favicon-label');
const candidateList = document.getElementById('candidate-list');

function renderSummary(result) {
  summary.classList.remove('empty');
  summary.textContent = [
    `inputUrl: ${result.inputUrl || '(empty)'}`,
    `normalizedUrl: ${result.normalizedUrl || '(none)'}`,
    `faviconUrl: ${result.faviconUrl || '(none)'}`,
    `source: ${result.source}`,
    `candidateCount: ${result.candidates.length}`
  ].join('\n');
}

function renderResolved(result) {
  if (!result.faviconUrl) {
    resolvedFavicon.removeAttribute('src');
    resolvedFaviconLabel.textContent = 'No favicon selected';
    return;
  }

  resolvedFavicon.src = result.faviconUrl;
  resolvedFaviconLabel.textContent = `${result.source}: ${result.faviconUrl}`;
}

function renderCandidates(candidates) {
  candidateList.innerHTML = '';

  if (!candidates.length) {
    const empty = document.createElement('li');
    empty.textContent = 'No candidates generated.';
    empty.className = 'warn';
    candidateList.appendChild(empty);
    return;
  }

  candidates.forEach((url, index) => {
    const item = document.createElement('li');
    item.className = 'candidate-item';

    const icon = document.createElement('img');
    icon.width = 32;
    icon.height = 32;
    icon.loading = 'lazy';
    icon.alt = `Candidate ${index + 1}`;
    icon.src = url;

    const text = document.createElement('div');
    text.className = 'meta';
    text.textContent = `${index + 1}. ${url}`;

    item.appendChild(icon);
    item.appendChild(text);
    candidateList.appendChild(item);
  });
}

async function runResolve() {
  resolveBtn.disabled = true;
  resolveBtn.textContent = 'Resolving...';

  try {
    const result = await resolveFavicon(input.value, {
      probe: probeCheckbox.checked,
      fetchImpl: (resource, init) => fetch(resource, init)
    });

    renderSummary(result);
    renderResolved(result);
    renderCandidates(result.candidates);
  } catch (error) {
    summary.classList.remove('empty');
    summary.textContent = `Error: ${error instanceof Error ? error.message : String(error)}`;
  } finally {
    resolveBtn.disabled = false;
    resolveBtn.textContent = 'Resolve';
  }
}

resolveBtn.addEventListener('click', runResolve);
input.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    runResolve();
  }
});

runResolve();