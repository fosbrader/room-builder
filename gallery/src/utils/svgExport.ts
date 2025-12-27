import { Layout, Entity, Wall, FloorObject, Door, Window, TextLabel } from '../types/schema';

interface SvgOptions {
  includeGrid?: boolean;
  includeDimensions?: boolean;
  includeLabels?: boolean;
}

export function layoutToSvg(layout: Layout, options: SvgOptions = {}): string {
  const { settings, entities } = layout;
  const scale = settings.scale;
  const width = settings.pageWidth * scale;
  const height = settings.pageHeight * scale;

  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <rect width="100%" height="100%" fill="white"/>`;

  // Draw grid if requested
  if (options.includeGrid) {
    const gridSize = settings.gridSize * scale;
    svg += `
  <defs>
    <pattern id="grid" width="${gridSize}" height="${gridSize}" patternUnits="userSpaceOnUse">
      <path d="M ${gridSize} 0 L 0 0 0 ${gridSize}" fill="none" stroke="#e0e0e0" stroke-width="0.5"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#grid)"/>`;
  }

  // Draw entities
  const includeLabels = options.includeLabels !== false;
  for (const entity of entities) {
    svg += entityToSvg(entity, scale, includeLabels);
  }

  svg += '\n</svg>';
  return svg;
}

function entityToSvg(entity: Entity, scale: number, includeLabels: boolean = true): string {
  const style = entity.style || {};
  const stroke = style.stroke || '#333333';
  const strokeWidth = (style.strokeWidth || 1) * scale / 4;

  switch (entity.type) {
    case 'wall':
      return wallToSvg(entity as Wall, scale, stroke, strokeWidth);
    case 'object':
      return objectToSvg(entity as FloorObject, scale, stroke, strokeWidth, includeLabels);
    case 'door':
      return doorToSvg(entity as Door, scale, stroke, strokeWidth);
    case 'window':
      return windowToSvg(entity as Window, scale, stroke, strokeWidth);
    case 'text':
      return includeLabels ? textToSvg(entity as TextLabel, scale) : '';
    default:
      return '';
  }
}

function wallToSvg(wall: Wall, scale: number, stroke: string, _strokeWidth: number): string {
  if (wall.points.length < 2) return '';
  
  const thickness = wall.thickness * scale;
  const points = wall.points.map(p => `${(wall.x + p.x) * scale},${(wall.y + p.y) * scale}`).join(' ');
  
  return `
  <polyline points="${points}" fill="none" stroke="${stroke}" stroke-width="${thickness}" stroke-linecap="square" stroke-linejoin="miter"/>`;
}

function objectToSvg(obj: FloorObject, scale: number, stroke: string, strokeWidth: number, includeLabels: boolean = true): string {
  const x = obj.x * scale;
  const y = obj.y * scale;
  const w = obj.width * scale;
  const h = obj.height * scale;
  const rotation = obj.rotation || 0;
  
  const cx = x + w / 2;
  const cy = y + h / 2;
  const transform = rotation ? ` transform="rotate(${rotation} ${cx} ${cy})"` : '';
  
  // Different fills for different object types
  let objFill = '#ffffff';
  switch (obj.objectType) {
    case 'desk': objFill = '#d4a574'; break;
    case 'chair': objFill = '#6b7280'; break;
    case 'shelf': objFill = '#a78bfa'; break;
    case 'rack': objFill = '#1e293b'; break;
  }
  
  let svg = `
  <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${objFill}" stroke="${stroke}" stroke-width="${strokeWidth}"${transform}/>`;
  
  if (obj.label && includeLabels) {
    svg += `
  <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" font-size="${12 * scale / 4}" font-family="Arial, Helvetica, sans-serif" fill="#333"${transform}>${escapeXml(obj.label)}</text>`;
  }
  
  return svg;
}

function doorToSvg(door: Door, scale: number, stroke: string, strokeWidth: number): string {
  const x = door.x * scale;
  const y = door.y * scale;
  const w = door.width * scale;
  const rotation = door.rotation || 0;
  
  const arcRadius = w;
  const sweepFlag = door.swingDirection === 'inward' ? 1 : 0;
  
  return `
  <g transform="rotate(${rotation} ${x} ${y})">
    <line x1="${x}" y1="${y}" x2="${x + w}" y2="${y}" stroke="${stroke}" stroke-width="${strokeWidth * 2}"/>
    <path d="M ${x} ${y} A ${arcRadius} ${arcRadius} 0 0 ${sweepFlag} ${x + w} ${y - arcRadius}" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-dasharray="4,4"/>
  </g>`;
}

function windowToSvg(window: Window, scale: number, stroke: string, strokeWidth: number): string {
  const x = window.x * scale;
  const y = window.y * scale;
  const w = window.width * scale;
  const rotation = window.rotation || 0;
  
  return `
  <g transform="rotate(${rotation} ${x + w/2} ${y})">
    <line x1="${x}" y1="${y}" x2="${x + w}" y2="${y}" stroke="#60a5fa" stroke-width="${strokeWidth * 3}"/>
    <line x1="${x + w * 0.3}" y1="${y - 3}" x2="${x + w * 0.3}" y2="${y + 3}" stroke="${stroke}" stroke-width="${strokeWidth}"/>
    <line x1="${x + w * 0.7}" y1="${y - 3}" x2="${x + w * 0.7}" y2="${y + 3}" stroke="${stroke}" stroke-width="${strokeWidth}"/>
  </g>`;
}

function textToSvg(text: TextLabel, scale: number): string {
  const x = text.x * scale;
  const y = text.y * scale;
  const fontSize = text.fontSize * scale / 4;
  const rotation = text.rotation || 0;
  
  const transform = rotation ? ` transform="rotate(${rotation} ${x} ${y})"` : '';
  
  return `
  <text x="${x}" y="${y}" font-size="${fontSize}" font-family="Arial, Helvetica, sans-serif" fill="#333"${transform}>${escapeXml(text.text)}</text>`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

