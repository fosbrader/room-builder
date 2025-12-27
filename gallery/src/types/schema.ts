// Schema version for migrations
export const CURRENT_SCHEMA_VERSION = 1;

// Unit types
export type UnitSystem = 'ft-in' | 'meters';

// Page size presets
export type PageSize = 'letter' | 'a4' | 'arch-d' | 'custom';

// Layout settings
export interface LayoutSettings {
  units: UnitSystem;
  gridSize: number;
  snapToGrid: boolean;
  snapToObjects: boolean;
  snapToWalls: boolean;
  scale: number;
  pageSize: PageSize;
  pageWidth: number;
  pageHeight: number;
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

// Wall entity
export interface Wall extends BaseEntity {
  type: 'wall';
  points: Point[];
  thickness: number;
}

// Door entity
export interface Door extends BaseEntity {
  type: 'door';
  wallId: string;
  wallPosition: number;
  width: number;
  swingDirection: 'inward' | 'outward';
  hingeSide: 'left' | 'right';
  openAngle: number;
}

// Window entity
export interface Window extends BaseEntity {
  type: 'window';
  wallId: string;
  wallPosition: number;
  width: number;
  sillHeight?: number;
}

// Floor object types
export type ObjectType = 'desk' | 'chair' | 'shelf' | 'rack' | 'rect';

// Floor object entity
export interface FloorObject extends BaseEntity {
  type: 'object';
  objectType: ObjectType;
  width: number;
  height: number;
  depth?: number;
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

// Layout summary for gallery
export interface LayoutSummary {
  id: string;
  name: string;
  slug: string;
  updatedAt: string;
  entityCount: number;
}

