#!/usr/bin/env node
// Copies the three pure engine files from src/engine/ into
// supabase/functions/_shared/engine/, prepending a generated-file banner.
// Run: npm run sync-engine
// CI re-runs this then fails on git diff to catch drift.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const FILES = ['types.ts', 'placement.ts', 'generator.ts', 'replay.ts', 'parSolver.ts'];
const SRC_DIR = join(root, 'src', 'engine');
const DST_DIR = join(root, 'supabase', 'functions', '_shared', 'engine');

mkdirSync(DST_DIR, { recursive: true });

for (const file of FILES) {
  const src = join(SRC_DIR, file);
  const dst = join(DST_DIR, file);
  const banner = `// GENERATED — do not edit. Source: src/engine/${file}. Regenerate: npm run sync-engine\n`;
  const body = readFileSync(src, 'utf8');
  writeFileSync(dst, banner + body, 'utf8');
}
