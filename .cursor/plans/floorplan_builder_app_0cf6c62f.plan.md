---
name: Floorplan Builder App
overview: Build a local-only, Docker-based floorplan builder web app using React/Vite + Konva for the frontend and Node/Express for the backend. The app supports scale-accurate drawing, object placement, snapping, export to multiple formats, and generates a static GitHub Pages gallery.
todos:
  - id: setup-docker
    content: Create docker-compose.yml with client/server services, volume mounts, and hot reload
    status: completed
  - id: setup-client
    content: Initialize React/Vite client with TypeScript, Konva, Zustand, and Dockerfile
    status: completed
  - id: setup-server
    content: Initialize Express server with TypeScript, routes structure, and Dockerfile
    status: completed
  - id: schema-types
    content: Define Layout schema types in both client and server
    status: completed
  - id: canvas-core
    content: Build Konva canvas with grid overlay, pan/zoom, and layer system
    status: completed
  - id: tool-system
    content: "Implement tool modes: Select, Draw Wall, Place Door/Window, Place Object, Measure, Text"
    status: completed
  - id: entity-rendering
    content: Create Konva components for walls, doors, windows, objects, labels
    status: completed
  - id: snapping
    content: Implement snapping to grid, wall endpoints/midpoints, object edges/centers
    status: completed
  - id: ui-panels
    content: Build Toolbar, Library sidebar, Property Inspector, and Header components
    status: completed
  - id: api-routes
    content: Implement layout CRUD and file I/O endpoints
    status: completed
  - id: undo-redo
    content: Add history stack with undo/redo support
    status: completed
  - id: keyboard-shortcuts
    content: Wire up all keyboard shortcuts (save, undo, delete, grid toggle, etc.)
    status: completed
  - id: export-service
    content: Build export pipeline for PNG, SVG, PDF using sharp/pdfkit
    status: completed
  - id: gallery-generator
    content: Create gallery build script and static /docs site
    status: completed
  - id: sample-data
    content: Add sample layouts and presets.json
    status: completed
  - id: readme
    content: Write comprehensive README with setup and usage instructions
    status: completed
---

# Floorplan Builder Web App

## Architecture Overview

```mermaid
graph TB
    subgraph docker [Docker Compose]
        subgraph client_container [Client Container]
            Vite[Vite Dev Server]
            React[React + Konva]
        end
        subgraph server_container [Server Container]
            Express[Express API]
            ExportEngine[Export Engine]
        end
    end
    
    React -->|HTTP API| Express
    Express -->|Read/Write| Layouts[/layouts/*.json]
    Express -->|Generate| Exports[/exports/]
    Express -->|Build| Docs[/docs/ Gallery]
    
    Layouts -->|Volume Mount| HostFS[Host Filesystem]
    Exports -->|Volume Mount| HostFS
    Docs -->|Volume Mount| HostFS
```



## Project Structure

```javascript
/kto
├── docker-compose.yml
├── package.json                 # Root workspace config
├── README.md
├── client/
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── components/
│       │   ├── Canvas/           # Konva canvas, grid, layers
│       │   ├── Toolbar/          # Left tool panel
│       │   ├── Library/          # Right sidebar presets
│       │   ├── PropertyInspector/# Selection properties
│       │   └── Header/           # Save, export, settings
│       ├── hooks/
│       │   ├── useLayout.ts      # Layout state management
│       │   ├── useHistory.ts     # Undo/redo
│       │   ├── useSnapping.ts    # Snap logic
│       │   └── useKeyboard.ts    # Keyboard shortcuts
│       ├── types/
│       │   └── schema.ts         # TypeScript types for layout
│       ├── utils/
│       │   ├── units.ts          # Unit conversion
│       │   ├── geometry.ts       # Math helpers
│       │   └── api.ts            # API client
│       └── store/
│           └── layoutStore.ts    # Zustand store
├── server/
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts
│       ├── routes/
│       │   ├── layouts.ts
│       │   ├── export.ts
│       │   └── gallery.ts
│       ├── services/
│       │   ├── layoutService.ts
│       │   ├── exportService.ts  # PNG/SVG/PDF generation
│       │   └── galleryService.ts
│       └── types/
│           └── schema.ts         # Shared schema types
├── layouts/
│   ├── presets.json              # Custom object presets
│   ├── sample-office.json        # Example layout
│   └── .autosave/                # Auto-save backups
├── exports/                      # Generated exports
└── docs/                         # GitHub Pages gallery
    ├── index.html
    ├── index.json
    ├── gallery.js
    ├── gallery.css
    └── previews/
```



## Data Model Schema

```typescript
// /client/src/types/schema.ts and /server/src/types/schema.ts

interface Layout {
  schemaVersion: 1;
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  settings: LayoutSettings;
  entities: Entity[];
}

interface LayoutSettings {
  units: 'ft-in' | 'meters';
  gridSize: number;           // In current units
  snapToGrid: boolean;
  snapToObjects: boolean;
  snapToWalls: boolean;
  scale: number;              // 1 unit = X inches internally
  pageSize: 'letter' | 'a4' | 'arch-d' | 'custom';
  pageWidth: number;
  pageHeight: number;
}

type Entity = Wall | Door | Window | FloorObject | TextLabel;

interface BaseEntity {
  id: string;
  type: string;
  x: number;
  y: number;
  rotation: number;
  label?: string;
  metadata?: Record<string, string>;
  style?: EntityStyle;
}

interface Wall extends BaseEntity {
  type: 'wall';
  points: { x: number; y: number }[];  // Polyline
  thickness: number;
}

interface Door extends BaseEntity {
  type: 'door';
  wallId: string;
  width: number;
  swingDirection: 'left' | 'right';
  hingeSide: 'left' | 'right';
  openAngle: number;  // 0-180
}

interface Window extends BaseEntity {
  type: 'window';
  wallId: string;
  width: number;
  sillHeight?: number;
}

interface FloorObject extends BaseEntity {
  type: 'object';
  objectType: 'desk' | 'chair' | 'shelf' | 'rack' | 'rect';
  width: number;
  height: number;
  depth?: number;
}

interface TextLabel extends BaseEntity {
  type: 'text';
  text: string;
  fontSize: number;
}
```



## Docker Setup

**docker-compose.yml**:

- Two services: `client` (Vite on port 5173) and `server` (Express on port 3001)
- Volume mounts: `./layouts`, `./exports`, `./docs` mapped into server container
- Hot reload enabled via volume mounts for source code
- Node 20 Alpine base images

## Frontend Implementation

### State Management (Zustand)

- `layoutStore.ts`: Current layout, entities, selection, tool mode
- `useHistory.ts`: Undo/redo stack with action snapshots (limit 100 actions)

### Canvas Component (Konva)

Layers (bottom to top):

1. **Grid Layer**: Dynamic grid based on zoom, toggleable
2. **Structural Layer**: Walls, doors, windows
3. **Furniture Layer**: Objects (desks, chairs, racks)
4. **Annotation Layer**: Dimension lines, labels
5. **Selection Layer**: Transform handles, selection box

Key behaviors:

- Pan: Scroll/drag with space held, or two-finger trackpad
- Zoom: Pinch or scroll with ctrl/cmd, centered on cursor
- Grid: Calculated dynamically based on zoom level

### Tools Implementation

| Tool | Behavior ||------|----------|| Select | Click to select, shift+click multi-select, drag for box select, transform handles || Draw Wall | Click to add points, double-click or Enter to finish, Esc to cancel || Place Door | Hover wall to preview, click to attach, drag to position along wall || Place Window | Same as door || Place Object | Click to place from library selection, drag to position || Measure | Click two points, show distance tooltip in current units || Text | Click to place, inline edit |

### Snapping System

```typescript
// useSnapping.ts
function findSnapPoints(pos: Point, entities: Entity[], settings: LayoutSettings): SnapResult {
  const candidates: SnapCandidate[] = [];
  
  if (settings.snapToGrid) {
    candidates.push(snapToGrid(pos, settings.gridSize));
  }
  if (settings.snapToWalls) {
    candidates.push(...snapToWallEndpoints(pos, entities));
    candidates.push(...snapToWallMidpoints(pos, entities));
  }
  if (settings.snapToObjects) {
    candidates.push(...snapToObjectEdges(pos, entities));
    candidates.push(...snapToObjectCenters(pos, entities));
  }
  
  return findNearest(candidates, SNAP_THRESHOLD);
}
```



### Unit Conversion

```typescript
// utils/units.ts
const INCHES_PER_FOOT = 12;
const INCHES_PER_METER = 39.3701;

function formatDimension(inches: number, units: 'ft-in' | 'meters'): string {
  if (units === 'ft-in') {
    const feet = Math.floor(inches / 12);
    const remainingInches = inches % 12;
    return `${feet}'-${remainingInches}"`;
  }
  return `${(inches / INCHES_PER_METER).toFixed(2)}m`;
}
```



## Backend Implementation

### API Routes

```typescript
// GET /api/layouts
// Returns: { layouts: LayoutSummary[] }

// GET /api/layouts/:slug
// Returns: Layout

// POST /api/layouts/:slug
// Body: Layout
// Creates backup if auto-save, writes to /layouts/:slug.json

// POST /api/export/:slug
// Body: { formats: ['png', 'svg', 'pdf'], options: ExportOptions }
// Generates files to /exports/:slug/

// POST /api/gallery/build
// Scans /layouts, generates previews, builds /docs
```



### Export Pipeline

- **PNG**: Use `sharp` + `canvas` to render layout at specified DPI
- **SVG**: Generate SVG markup from entities (vector-native)
- **PDF**: Use `pdfkit` with SVG content or `puppeteer` for pixel-perfect rendering
- **DXF**: Use `dxf-writer` library (stretch goal)

Export options:

- `includeGrid: boolean`
- `includeDimensions: boolean`
- `paperSize: string`
- `orientation: 'portrait' | 'landscape'`
- `scale: string` (e.g., "1/4 inch = 1 foot")
- `dpi: number` (for PNG)

### Gallery Generator

```typescript
// galleryService.ts
async function buildGallery(): Promise<void> {
  const layouts = await scanLayouts();
  
  for (const layout of layouts) {
    await generatePreview(layout, '/docs/previews');
  }
  
  await writeIndexJson(layouts, '/docs/index.json');
  await copyStaticAssets('/docs');
}
```

Static gallery files:

- `index.html`: Simple HTML shell
- `gallery.js`: Vanilla JS to fetch index.json and render cards
- `gallery.css`: Minimal responsive grid styles

## Key Files to Create

### Phase 1: Project Setup

- `docker-compose.yml`
- `client/package.json`, `client/vite.config.ts`, `client/Dockerfile`
- `server/package.json`, `server/tsconfig.json`, `server/Dockerfile`
- Shared types in both client and server

### Phase 2: Core Editor

- Canvas component with grid and pan/zoom
- Tool system with Select and Draw Wall
- Entity rendering for walls
- Basic save/load API

### Phase 3: Full Entity Support

- Door and Window placement (wall-attached)
- Object placement from library
- Property inspector
- Snapping system

### Phase 4: Export and Gallery

- Export service (PNG, SVG, PDF)
- Gallery generator script
- Static gallery site

### Phase 5: Polish

- Undo/redo
- Keyboard shortcuts
- Sample layouts and presets
- README documentation

## Sample Presets (presets.json)

```json
{
  "schemaVersion": 1,
  "presets": {
    "desks": [
      { "name": "Small Desk", "width": 48, "height": 24 },
      { "name": "Medium Desk", "width": 60, "height": 30 },
      { "name": "Large Desk", "width": 72, "height": 30 }
    ],
    "chairs": [
      { "name": "Office Chair", "width": 24, "height": 24 }
    ],
    "shelves": [
      { "name": "Small Shelf", "width": 36, "height": 18 },
      { "name": "Large Shelf", "width": 48, "height": 18 }
    ],
    "racks": [
      { "name": "Server Rack 42U", "width": 24, "height": 42 },
      { "name": "Server Rack 48U", "width": 24, "height": 48 }
    ]
  }
}
```



## Commands

```bash
# Start development environment
docker compose up

# Build gallery (run from host or via docker exec)
npm run build:gallery

# Add new preset: Edit /layouts/presets.json directly







```