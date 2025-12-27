import fs from 'fs/promises';
import path from 'path';
import { Layout, LayoutSummary, PresetsFile, CURRENT_SCHEMA_VERSION } from '../types/schema.js';

const LAYOUTS_DIR = process.env.LAYOUTS_DIR || './layouts';
const AUTOSAVE_DIR = path.join(LAYOUTS_DIR, '.autosave');

// Default presets
const DEFAULT_PRESETS: PresetsFile = {
  schemaVersion: CURRENT_SCHEMA_VERSION,
  presets: {
    desks: [
      { name: 'Small Desk (48x24)', objectType: 'desk', width: 48, height: 24 },
      { name: 'Medium Desk (60x30)', objectType: 'desk', width: 60, height: 30 },
      { name: 'Large Desk (72x30)', objectType: 'desk', width: 72, height: 30 },
    ],
    chairs: [
      { name: 'Office Chair', objectType: 'chair', width: 24, height: 24 },
      { name: 'Task Chair', objectType: 'chair', width: 20, height: 20 },
    ],
    shelves: [
      { name: 'Small Shelf (36x18)', objectType: 'shelf', width: 36, height: 18 },
      { name: 'Large Shelf (48x18)', objectType: 'shelf', width: 48, height: 18 },
      { name: 'Wide Shelf (72x24)', objectType: 'shelf', width: 72, height: 24 },
    ],
    racks: [
      { name: 'Server Rack 42U (24x42)', objectType: 'rack', width: 24, height: 42 },
      { name: 'Server Rack 48U (24x48)', objectType: 'rack', width: 24, height: 48 },
      { name: 'Network Rack (24x36)', objectType: 'rack', width: 24, height: 36 },
    ],
    custom: [],
  },
};

async function ensureDirectories() {
  await fs.mkdir(LAYOUTS_DIR, { recursive: true });
  await fs.mkdir(AUTOSAVE_DIR, { recursive: true });
}

async function listLayouts(): Promise<LayoutSummary[]> {
  await ensureDirectories();
  
  try {
    const files = await fs.readdir(LAYOUTS_DIR);
    const jsonFiles = files.filter(f => f.endsWith('.json') && f !== 'presets.json');
    
    const layouts: LayoutSummary[] = [];
    for (const file of jsonFiles) {
      try {
        const content = await fs.readFile(path.join(LAYOUTS_DIR, file), 'utf-8');
        const layout: Layout = JSON.parse(content);
        layouts.push({
          id: layout.id,
          name: layout.name,
          slug: layout.slug,
          updatedAt: layout.updatedAt,
          entityCount: layout.entities.length,
        });
      } catch {
        console.warn(`Failed to parse layout file: ${file}`);
      }
    }
    
    return layouts.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  } catch {
    return [];
  }
}

async function getLayout(slug: string): Promise<Layout | null> {
  await ensureDirectories();
  
  const filePath = path.join(LAYOUTS_DIR, `${slug}.json`);
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

async function saveLayout(slug: string, layout: Layout, createBackup: boolean = false): Promise<void> {
  await ensureDirectories();
  
  const filePath = path.join(LAYOUTS_DIR, `${slug}.json`);
  
  // Create backup if requested
  if (createBackup) {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 16);
    const backupPath = path.join(AUTOSAVE_DIR, `${slug}-${timestamp}.json`);
    
    try {
      const existing = await fs.readFile(filePath, 'utf-8');
      await fs.writeFile(backupPath, existing, 'utf-8');
    } catch {
      // No existing file to backup
    }
  }
  
  // Update timestamp
  layout.updatedAt = new Date().toISOString();
  
  // Write the layout
  await fs.writeFile(filePath, JSON.stringify(layout, null, 2), 'utf-8');
}

async function deleteLayout(slug: string): Promise<void> {
  const filePath = path.join(LAYOUTS_DIR, `${slug}.json`);
  await fs.unlink(filePath);
}

async function getPresets(): Promise<PresetsFile> {
  await ensureDirectories();
  
  const filePath = path.join(LAYOUTS_DIR, 'presets.json');
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch {
    // Return default presets and save them
    await fs.writeFile(filePath, JSON.stringify(DEFAULT_PRESETS, null, 2), 'utf-8');
    return DEFAULT_PRESETS;
  }
}

async function savePresets(presets: PresetsFile): Promise<void> {
  await ensureDirectories();
  
  const filePath = path.join(LAYOUTS_DIR, 'presets.json');
  await fs.writeFile(filePath, JSON.stringify(presets, null, 2), 'utf-8');
}

export const layoutService = {
  listLayouts,
  getLayout,
  saveLayout,
  deleteLayout,
  getPresets,
  savePresets,
};
