/**
 * Auto-build watcher — watches docs/ and blog/ for changes,
 * automatically runs `docusaurus build` when files change.
 *
 * Usage:
 *   node scripts/watch-and-build.js       # watch + auto-build
 *   node scripts/watch-and-build.js --once # build once and exit
 *
 * Controlled by static/docs-manifest.json -> autoBuild flag.
 * When autoBuild is false, this script does nothing.
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const MANIFEST_PATH = path.join(ROOT, 'static', 'docs-manifest.json');
const WATCH_DIRS = ['docs', 'blog', 'static', 'src/components/Portfolio/data'];
const DEBOUNCE_MS = 3000;

function readManifest() {
  try {
    return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
  } catch {
    return { autoBuild: true };
  }
}

function runBuild() {
  console.log('\n\x1b[36m[auto-build]\x1b[0m Building site...');
  try {
    execSync('npx docusaurus build', { cwd: ROOT, stdio: 'inherit' });
    console.log('\x1b[32m[auto-build]\x1b[0m Build complete.');
  } catch {
    console.error('\x1b[31m[auto-build]\x1b[0m Build failed. Check errors above.');
  }
}

function startWatcher() {
  let timer = null;

  WATCH_DIRS.forEach((dir) => {
    const fullDir = path.join(ROOT, dir);
    if (!fs.existsSync(fullDir)) return;

    console.log(`\x1b[36m[auto-build]\x1b[0m Watching ${dir}/`);

    fs.watch(fullDir, { recursive: true }, (eventType, filename) => {
      if (!filename) return;
      // Ignore hidden files and swap files
      if (filename.startsWith('.') || filename.endsWith('~') || filename.endsWith('.swp')) return;

      const manifest = readManifest();
      if (!manifest.autoBuild) return;

      clearTimeout(timer);
      console.log(`\x1b[36m[auto-build]\x1b[0m Change detected: ${filename}`);
      timer = setTimeout(runBuild, DEBOUNCE_MS);
    });
  });

  console.log('\x1b[36m[auto-build]\x1b[0m Watcher started. Set "autoBuild": true in docs-manifest.json to enable auto-build.');
  console.log('\x1b[36m[auto-build]\x1b[0m Press Ctrl+C to stop.\n');
}

// Main
const args = process.argv.slice(2);
if (args.includes('--once')) {
  runBuild();
} else {
  const manifest = readManifest();
  console.log(`\x1b[36m[auto-build]\x1b[0m Auto-build is ${manifest.autoBuild ? '\x1b[32mENABLED\x1b[0m' : '\x1b[33mDISABLED\x1b[0m'} (set in docs-manifest.json)`);
  startWatcher();
}
