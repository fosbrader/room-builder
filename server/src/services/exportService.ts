import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import PDFDocument from 'pdfkit';
import { Layout, ExportOptions, Entity, Wall, FloorObject, Door, Window, TextLabel } from '../types/schema.js';

const EXPORTS_DIR = process.env.EXPORTS_DIR || './exports';

async function ensureExportDir(slug: string): Promise<string> {
  const dir = path.join(EXPORTS_DIR, slug);
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

// Convert layout to SVG
function layoutToSvg(layout: Layout, options: ExportOptions): string {
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
  const includeLabels = options.includeLabels !== false; // Default to true
  for (const entity of entities) {
    svg += entityToSvg(entity, scale, includeLabels);
  }

  // Draw dimensions if requested
  if (options.includeDimensions) {
    svg += generateDimensionsSvg(entities, scale, settings.units);
  }

  svg += '\n</svg>';
  return svg;
}

function entityToSvg(entity: Entity, scale: number, includeLabels: boolean = true): string {
  const style = entity.style || {};
  const fill = style.fill || '#ffffff';
  const stroke = style.stroke || '#333333';
  const strokeWidth = (style.strokeWidth || 1) * scale / 4;

  switch (entity.type) {
    case 'wall':
      return wallToSvg(entity as Wall, scale, stroke, strokeWidth);
    case 'object':
      return objectToSvg(entity as FloorObject, scale, fill, stroke, strokeWidth, includeLabels);
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

function wallToSvg(wall: Wall, scale: number, stroke: string, strokeWidth: number): string {
  if (wall.points.length < 2) return '';
  
  const thickness = wall.thickness * scale;
  const points = wall.points.map(p => `${(wall.x + p.x) * scale},${(wall.y + p.y) * scale}`).join(' ');
  
  return `
  <polyline points="${points}" fill="none" stroke="${stroke}" stroke-width="${thickness}" stroke-linecap="square" stroke-linejoin="miter"/>`;
}

function objectToSvg(obj: FloorObject, scale: number, fill: string, stroke: string, strokeWidth: number, includeLabels: boolean = true): string {
  const x = obj.x * scale;
  const y = obj.y * scale;
  const w = obj.width * scale;
  const h = obj.height * scale;
  const rotation = obj.rotation || 0;
  
  const cx = x + w / 2;
  const cy = y + h / 2;
  const transform = rotation ? ` transform="rotate(${rotation} ${cx} ${cy})"` : '';
  
  // Different fills for different object types
  let objFill = fill;
  switch (obj.objectType) {
    case 'desk': objFill = '#d4a574'; break;
    case 'chair': objFill = '#6b7280'; break;
    case 'shelf': objFill = '#a78bfa'; break;
    case 'rack': objFill = '#1e293b'; break;
  }
  
  let svg = `
  <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${objFill}" stroke="${stroke}" stroke-width="${strokeWidth}"${transform}/>`;
  
  // Add label if present and includeLabels is true
  if (obj.label && includeLabels) {
    svg += `
  <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" font-size="${12 * scale / 4}" font-family="Arial, Helvetica, sans-serif" fill="#333"${transform}>${obj.label}</text>`;
  }
  
  return svg;
}

function doorToSvg(door: Door, scale: number, stroke: string, strokeWidth: number): string {
  const x = door.x * scale;
  const y = door.y * scale;
  const w = door.width * scale;
  const rotation = door.rotation || 0;
  
  // Door opening arc
  const arcRadius = w;
  const startAngle = door.hingeSide === 'left' ? 0 : 180;
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
  <text x="${x}" y="${y}" font-size="${fontSize}" font-family="Arial, Helvetica, sans-serif" fill="#333"${transform}>${text.text}</text>`;
}

function generateDimensionsSvg(entities: Entity[], scale: number, units: string): string {
  let svg = '';
  
  // Add dimension lines for walls
  for (const entity of entities) {
    if (entity.type === 'wall') {
      const wall = entity as Wall;
      if (wall.points.length >= 2) {
        for (let i = 0; i < wall.points.length - 1; i++) {
          const p1 = wall.points[i];
          const p2 = wall.points[i + 1];
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const length = Math.sqrt(dx * dx + dy * dy);
          
          const midX = (wall.x + (p1.x + p2.x) / 2) * scale;
          const midY = (wall.y + (p1.y + p2.y) / 2) * scale - 10;
          
          const label = formatDimension(length, units as 'ft-in' | 'meters');
          svg += `
  <text x="${midX}" y="${midY}" text-anchor="middle" font-size="10" fill="#666">${label}</text>`;
        }
      }
    }
  }
  
  return svg;
}

function formatDimension(inches: number, units: 'ft-in' | 'meters'): string {
  if (units === 'ft-in') {
    const feet = Math.floor(inches / 12);
    const remainingInches = Math.round(inches % 12);
    if (feet === 0) return `${remainingInches}"`;
    if (remainingInches === 0) return `${feet}'`;
    return `${feet}'-${remainingInches}"`;
  }
  return `${(inches * 0.0254).toFixed(2)}m`;
}

async function exportToPng(layout: Layout, options: ExportOptions, outputPath: string): Promise<string> {
  const svg = layoutToSvg(layout, options);
  const dpi = options.dpi || 150;
  const scale = dpi / 96; // 96 is the default SVG DPI
  
  const buffer = Buffer.from(svg);
  await sharp(buffer, { density: dpi })
    .png()
    .toFile(outputPath);
  
  return outputPath;
}

async function exportToSvg(layout: Layout, options: ExportOptions, outputPath: string): Promise<string> {
  const svg = layoutToSvg(layout, options);
  await fs.writeFile(outputPath, svg, 'utf-8');
  return outputPath;
}

async function exportToPdf(layout: Layout, options: ExportOptions, outputPath: string): Promise<string> {
  const { settings } = layout;
  const scale = settings.scale;
  const width = settings.pageWidth * scale;
  const height = settings.pageHeight * scale;
  
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: [width, height],
      margin: 0,
    });
    
    const stream = require('fs').createWriteStream(outputPath);
    doc.pipe(stream);
    
    // White background
    doc.rect(0, 0, width, height).fill('white');
    
    // Draw grid if requested
    if (options.includeGrid) {
      const gridSize = settings.gridSize * scale;
      doc.strokeColor('#e0e0e0').lineWidth(0.5);
      
      for (let x = 0; x <= width; x += gridSize) {
        doc.moveTo(x, 0).lineTo(x, height).stroke();
      }
      for (let y = 0; y <= height; y += gridSize) {
        doc.moveTo(0, y).lineTo(width, y).stroke();
      }
    }
    
    // Draw entities
    for (const entity of layout.entities) {
      drawEntityToPdf(doc, entity, scale);
    }
    
    // Add scale label
    if (options.scaleLabel) {
      doc.fontSize(10).fillColor('#666').text(options.scaleLabel, 10, height - 20);
    }
    
    doc.end();
    
    stream.on('finish', () => resolve(outputPath));
    stream.on('error', reject);
  });
}

function drawEntityToPdf(doc: PDFKit.PDFDocument, entity: Entity, scale: number): void {
  const style = entity.style || {};
  const stroke = style.stroke || '#333333';
  
  switch (entity.type) {
    case 'wall': {
      const wall = entity as Wall;
      if (wall.points.length < 2) return;
      
      doc.strokeColor(stroke).lineWidth(wall.thickness * scale);
      doc.moveTo((wall.x + wall.points[0].x) * scale, (wall.y + wall.points[0].y) * scale);
      
      for (let i = 1; i < wall.points.length; i++) {
        doc.lineTo((wall.x + wall.points[i].x) * scale, (wall.y + wall.points[i].y) * scale);
      }
      doc.stroke();
      break;
    }
    case 'object': {
      const obj = entity as FloorObject;
      let fill = '#d4a574';
      switch (obj.objectType) {
        case 'desk': fill = '#d4a574'; break;
        case 'chair': fill = '#6b7280'; break;
        case 'shelf': fill = '#a78bfa'; break;
        case 'rack': fill = '#1e293b'; break;
      }
      
      doc.save();
      if (obj.rotation) {
        const cx = (obj.x + obj.width / 2) * scale;
        const cy = (obj.y + obj.height / 2) * scale;
        doc.translate(cx, cy).rotate(obj.rotation).translate(-cx, -cy);
      }
      
      doc.rect(obj.x * scale, obj.y * scale, obj.width * scale, obj.height * scale)
        .fillAndStroke(fill, stroke);
      
      if (obj.label) {
        doc.fontSize(10).fillColor('#333')
          .text(obj.label, obj.x * scale, obj.y * scale + obj.height * scale / 2 - 5, {
            width: obj.width * scale,
            align: 'center',
          });
      }
      
      doc.restore();
      break;
    }
    case 'text': {
      const text = entity as TextLabel;
      doc.fontSize(text.fontSize).fillColor('#333')
        .text(text.text, text.x * scale, text.y * scale);
      break;
    }
  }
}

async function exportLayout(layout: Layout, options: ExportOptions): Promise<string[]> {
  const exportDir = await ensureExportDir(layout.slug);
  const results: string[] = [];
  
  for (const format of options.formats) {
    const filename = `${layout.slug}.${format}`;
    const outputPath = path.join(exportDir, filename);
    
    switch (format) {
      case 'png':
        await exportToPng(layout, options, outputPath);
        results.push(filename);
        break;
      case 'svg':
        await exportToSvg(layout, options, outputPath);
        results.push(filename);
        break;
      case 'pdf':
        await exportToPdf(layout, options, outputPath);
        results.push(filename);
        break;
      case 'dxf':
        // DXF export is a stretch goal - placeholder
        console.log('DXF export not yet implemented');
        break;
    }
  }
  
  return results;
}

async function listExports(slug: string): Promise<string[]> {
  const exportDir = path.join(EXPORTS_DIR, slug);
  try {
    const files = await fs.readdir(exportDir);
    return files;
  } catch {
    return [];
  }
}

export const exportService = {
  exportLayout,
  listExports,
  layoutToSvg,
};
