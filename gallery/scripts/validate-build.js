#!/usr/bin/env node

/**
 * Validate build script
 * Checks that the gallery build completed successfully
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../dist');

let errors = 0;

function check(condition, message) {
  if (condition) {
    console.log(`✓ ${message}`);
  } else {
    console.error(`✗ ${message}`);
    errors++;
  }
}

console.log('Validating gallery build...\n');

// Check dist directory exists
check(fs.existsSync(distDir), 'dist/ directory exists');

// Check index.html exists
const indexPath = path.join(distDir, 'index.html');
check(fs.existsSync(indexPath), 'index.html exists');

// Check index.html is valid HTML
if (fs.existsSync(indexPath)) {
  const html = fs.readFileSync(indexPath, 'utf-8');
  check(html.includes('<!DOCTYPE html>'), 'index.html has DOCTYPE');
  check(html.includes('<div id="root">'), 'index.html has root element');
  check(html.includes('<script'), 'index.html includes scripts');
}

// Check layouts directory exists
const layoutsDir = path.join(distDir, 'layouts');
check(fs.existsSync(layoutsDir), 'layouts/ directory exists');

// Check manifest.json exists and is valid
const manifestPath = path.join(layoutsDir, 'manifest.json');
check(fs.existsSync(manifestPath), 'manifest.json exists');

if (fs.existsSync(manifestPath)) {
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    check(Array.isArray(manifest.layouts), 'manifest.json has layouts array');
    check(typeof manifest.generatedAt === 'string', 'manifest.json has generatedAt timestamp');
    console.log(`  → Found ${manifest.layouts.length} layouts`);
    
    // Validate each layout file exists
    for (const layout of manifest.layouts) {
      const layoutPath = path.join(layoutsDir, `${layout.slug}.json`);
      check(fs.existsSync(layoutPath), `Layout file exists: ${layout.slug}.json`);
    }
  } catch (err) {
    console.error(`✗ manifest.json is not valid JSON: ${err.message}`);
    errors++;
  }
}

// Check assets directory
const assetsDir = path.join(distDir, 'assets');
if (fs.existsSync(assetsDir)) {
  const assets = fs.readdirSync(assetsDir);
  check(assets.some(f => f.endsWith('.js')), 'JavaScript bundle exists');
  check(assets.some(f => f.endsWith('.css')), 'CSS bundle exists');
}

// Summary
console.log('\n' + '='.repeat(40));
if (errors === 0) {
  console.log('✓ All validation checks passed!');
  process.exit(0);
} else {
  console.error(`✗ ${errors} validation error(s) found`);
  process.exit(1);
}

