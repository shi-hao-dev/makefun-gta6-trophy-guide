// Leonida Trophy Guide — the entrypoint (Node 22, standard library only).
// The guide itself is plain static files in app/: index.html, style.css, the
// app.js + roadmap.js modules, and app/data/trophies.json with all 55 trophies.
// No build step, no network at run time. This program hands the guide in: it
// copies app/ and screenshots/ from beside this file into the output directory
// and writes output/dossier.json with the kit's vendored library, which is the
// summary the judge reads (screenshots, first-load files and bytes, source).
// vendor/makefun-frontend.ts stays untouched: the scorer rebuilds the dossier
// with its own copy and requires the two to match byte for byte.
//
// Run it outside the grader with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Inside the grader MAKEFUN_OUTPUT_DIR is unset and the output goes to /output.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// The caps mirror the scorer's own: at most 4 screenshots, none over 256 KiB,
// at most 993 files and directories in app/ and 48 MiB of app files in all,
// and the dossier text capped at 160 KiB.
writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);
