import { Layout, LayoutSummary, PresetsFile, ExportOptions } from '../types/schema';

const API_BASE = '/api';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }
  return response.json();
}

// Layouts
export async function getLayouts(): Promise<LayoutSummary[]> {
  const response = await fetch(`${API_BASE}/layouts`);
  const data = await handleResponse<{ layouts: LayoutSummary[] }>(response);
  return data.layouts;
}

export async function getLayout(slug: string): Promise<Layout> {
  const response = await fetch(`${API_BASE}/layouts/${slug}`);
  return handleResponse<Layout>(response);
}

export async function saveLayout(slug: string, layout: Layout, autoSave = false): Promise<void> {
  const url = `${API_BASE}/layouts/${slug}${autoSave ? '?autoSave=true' : ''}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(layout),
  });
  await handleResponse(response);
}

export async function deleteLayout(slug: string): Promise<void> {
  const response = await fetch(`${API_BASE}/layouts/${slug}`, {
    method: 'DELETE',
  });
  await handleResponse(response);
}

// Presets
export async function getPresets(): Promise<PresetsFile> {
  const response = await fetch(`${API_BASE}/layouts/presets`);
  return handleResponse<PresetsFile>(response);
}

export async function savePresets(presets: PresetsFile): Promise<void> {
  const response = await fetch(`${API_BASE}/layouts/presets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(presets),
  });
  await handleResponse(response);
}

// Export
export async function exportLayout(slug: string, options: ExportOptions): Promise<string[]> {
  const response = await fetch(`${API_BASE}/export/${slug}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(options),
  });
  const data = await handleResponse<{ success: boolean; files: string[] }>(response);
  return data.files;
}

export async function getExports(slug: string): Promise<string[]> {
  const response = await fetch(`${API_BASE}/export/${slug}`);
  const data = await handleResponse<{ exports: string[] }>(response);
  return data.exports;
}

// Gallery
export async function buildGallery(): Promise<void> {
  const response = await fetch(`${API_BASE}/gallery/build`, {
    method: 'POST',
  });
  await handleResponse(response);
}
