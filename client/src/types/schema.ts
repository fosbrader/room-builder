// Schema version for migrations
export const CURRENT_SCHEMA_VERSION = 1;

// Unit types
export type UnitSystem = 'ft-in' | 'meters';

// Page size presets
export type PageSize = 'letter' | 'a4' | 'arch-d' | 'custom';

// Layout settings
export interface LayoutSettings {
  units: UnitSystem;
  gridSize: number; // In inches (internal unit)
  snapToGrid: boolean;
  snapToObjects: boolean;
  snapToWalls: boolean;
  scale: number; // Pixels per inch for display
  pageSize: PageSize;
  pageWidth: number; // In inches
  pageHeight: number; // In inches
}

// Entity style
export interface EntityStyle {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
}

// Point type
export interface Point {
  x: number;
  y: number;
}

// Base entity interface
export interface BaseEntity {
  id: string;
  type: string;
  x: number;
  y: number;
  rotation: number;
  label?: string;
  metadata?: Record<string, string>;
  style?: EntityStyle;
}

// Wall entity (polyline-based)
export interface Wall extends BaseEntity {
  type: 'wall';
  points: Point[];
  thickness: number; // In inches
}

// Door entity (attached to wall)
export interface Door extends BaseEntity {
  type: 'door';
  wallId: string;
  wallPosition: number; // 0-1 position along wall segment
  width: number; // In inches
  swingDirection: 'inward' | 'outward';
  hingeSide: 'left' | 'right';
  openAngle: number; // 0-180 degrees
}

// Window entity (attached to wall)
export interface Window extends BaseEntity {
  type: 'window';
  wallId: string;
  wallPosition: number; // 0-1 position along wall segment
  width: number; // In inches
  sillHeight?: number; // In inches
}

// Floor object types
export type ObjectType = 'desk' | 'chair' | 'shelf' | 'rack' | 'rect';

// Floor object entity
export interface FloorObject extends BaseEntity {
  type: 'object';
  objectType: ObjectType;
  width: number; // In inches
  height: number; // In inches (depth on floor)
  depth?: number; // Vertical height (for 3D reference)
}

// Text label entity
export interface TextLabel extends BaseEntity {
  type: 'text';
  text: string;
  fontSize: number;
}

// Dimension line entity
export interface DimensionLine extends BaseEntity {
  type: 'dimension';
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

// Union of all entity types
export type Entity = Wall | Door | Window | FloorObject | TextLabel | DimensionLine;

// Full layout document
export interface Layout {
  schemaVersion: number;
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  settings: LayoutSettings;
  entities: Entity[];
}

// Layout summary (for list views)
export interface LayoutSummary {
  id: string;
  name: string;
  slug: string;
  updatedAt: string;
  entityCount: number;
}

// Preset object definition
export interface PresetObject {
  name: string;
  objectType: ObjectType;
  width: number;
  height: number;
  depth?: number;
}

// Presets file structure
export interface PresetsFile {
  schemaVersion: number;
  presets: {
    desks: PresetObject[];
    chairs: PresetObject[];
    shelves: PresetObject[];
    racks: PresetObject[];
    custom: PresetObject[];
  };
}

// Tool modes
export type ToolMode = 
  | 'select'
  | 'wall'
  | 'door'
  | 'window'
  | 'object'
  | 'measure'
  | 'text';

// Export options
export interface ExportOptions {
  formats: ('png' | 'svg' | 'pdf' | 'dxf')[];
  includeGrid: boolean;
  includeDimensions: boolean;
  paperSize: PageSize;
  orientation: 'portrait' | 'landscape';
  scaleLabel: string;
  dpi: number;
}

// Default layout settings
export const DEFAULT_SETTINGS: LayoutSettings = {
  units: 'ft-in',
  gridSize: 12, // 1 foot grid
  snapToGrid: true,
  snapToObjects: true,
  snapToWalls: true,
  scale: 4, // 4 pixels per inch
  pageSize: 'letter',
  pageWidth: 11 * 12, // 11 feet in inches
  pageHeight: 8.5 * 12, // 8.5 feet in inches
};

// Create a new empty layout
export function createEmptyLayout(name: string, slug: string): Layout {
  const now = new Date().toISOString();
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    id: crypto.randomUUID(),
    name,
    slug,
    createdAt: now,
    updatedAt: now,
    settings: { ...DEFAULT_SETTINGS },
    entities: [],
  };
}
