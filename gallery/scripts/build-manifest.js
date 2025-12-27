#!/usr/bin/env node

/**
 * Build manifest script
 * Generates a manifest.json file from layout JSON files for the gallery
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const layoutsDir = path.resolve(__dirname, '../../layouts');
const publicLayoutsDir = path.resolve(__dirname, '../public/layouts');

// Ensure output directory exists
if (!fs.existsSync(publicLayoutsDir)) {
  fs.mkdirSync(publicLayoutsDir, { recursive: true });
}

// Read all layout files
const layoutFiles = fs.readdirSync(layoutsDir).filter(f => 
  f.endsWith('.json') && f !== 'presets.json'
);

const layouts = [];

for (const file of layoutFiles) {
  const filePath = path.join(layoutsDir, file);
  const content = fs.readFileSync(filePath, 'utf-8');
  
  try {
    const layout = JSON.parse(content);
    
    // Copy layout to public folder
    fs.copyFileSync(filePath, path.join(publicLayoutsDir, file));
    
    // Add to manifest
    layouts.push({
      slug: layout.slug,
      name: layout.name,
      entityCount: layout.entities?.length || 0,
      updatedAt: layout.updatedAt || new Date().toISOString(),
    });
    
    console.log(`✓ Processed: ${layout.name} (${layout.slug})`);
  } catch (err) {
    console.error(`✗ Failed to parse ${file}:`, err.message);
  }
}

// Sort by name
layouts.sort((a, b) => a.name.localeCompare(b.name));

// Write manifest
const manifest = {
  generatedAt: new Date().toISOString(),
  layouts,
};

fs.writeFileSync(
  path.join(publicLayoutsDir, 'manifest.json'),
  JSON.stringify(manifest, null, 2)
);

console.log(`\n✓ Generated manifest with ${layouts.length} layouts`);

