import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const outDir = path.join(rootDir, '.site');
const distDir = path.join(rootDir, 'dist');

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function copyDir(sourceDir, targetDir) {
  ensureDir(targetDir);

  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      copyDir(sourcePath, targetPath);
      continue;
    }

    fs.copyFileSync(sourcePath, targetPath);
  }
}

function writeFile(relativePath, content) {
  const targetPath = path.join(outDir, relativePath);
  ensureDir(path.dirname(targetPath));
  fs.writeFileSync(targetPath, content);
}

if (!fs.existsSync(distDir)) {
  throw new Error('dist/ does not exist. Run `npm run build` first.');
}

fs.rmSync(outDir, { recursive: true, force: true });
ensureDir(outDir);

copyDir(distDir, path.join(outDir, 'dist'));

writeFile(
  'styles.css',
  fs.readFileSync(path.join(rootDir, 'demo', 'styles.css'), 'utf8')
);

writeFile(
  'app.js',
  fs
    .readFileSync(path.join(rootDir, 'demo', 'app.js'), 'utf8')
    .replace("../dist/index.js", './dist/index.js')
);

writeFile(
  'index.html',
  `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>favicon-extract demo</title>
  <link rel="stylesheet" href="./styles.css" />
</head>
<body>
  <main class="app-shell">
    <header class="hero">
      <p class="eyebrow">GitHub Pages Demo</p>
      <h1>favicon-extract</h1>
      <p class="subtitle">Inspect normalization, selected source, and ordered candidates directly from the published repo.</p>
    </header>

    <section class="panel controls">
      <label for="url-input">URL to test</label>
      <div class="row">
        <input id="url-input" type="text" value="https://docs.google.com/document/d/abc123/edit" />
        <button id="resolve-btn" type="button">Resolve</button>
      </div>
      <div class="row compact">
        <label class="checkbox">
          <input id="probe-checkbox" type="checkbox" />
          <span>Probe with fetch</span>
        </label>
      </div>
    </section>

    <section class="panel results">
      <h2>Result</h2>
      <div id="summary" class="summary empty">Run a test to see resolution details.</div>
      <div class="preview-wrap">
        <img id="resolved-favicon" alt="Resolved favicon preview" width="32" height="32" />
        <span id="resolved-favicon-label">No favicon selected yet</span>
      </div>
    </section>

    <section class="panel candidates">
      <h2>Candidates</h2>
      <ol id="candidate-list"></ol>
    </section>
  </main>

  <script type="module" src="./app.js"></script>
</body>
</html>
`
);

console.log(`Prepared static site in ${outDir}`);