# Floorplan Builder

A local-only, Docker-based floorplan builder web app for designing office and tech spaces. Draw to-scale floorplans with real unit systems, place and resize objects, and export to multiple formats.

## Features

- **Scale-accurate floorplans** with feet/inches or metric units
- **Object library** with desks, chairs, shelves, and server racks
- **Wall drawing** with polyline support and adjustable thickness
- **Doors and windows** that attach to walls
- **Snapping** to grid, wall endpoints, and object edges
- **Measurement tool** for quick distance checks
- **Pan and zoom** with trackpad-friendly controls
- **Undo/redo** for all operations
- **Export** to PNG, SVG, and PDF
- **GitHub Pages gallery** for sharing layouts

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 20+ (for local development without Docker)

### Run with Docker

```bash
# Start the application
docker compose up

# Or build and start
docker compose up --build
```

The app will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

### Local Development (without Docker)

```bash
# Install dependencies
cd client && npm install && cd ..
cd server && npm install && cd ..

# Start the server (in one terminal)
cd server && npm run dev

# Start the client (in another terminal)
cd client && npm run dev
```

## Usage

### Creating a Layout

1. Click **New** to create a new layout
2. Enter a name (e.g., "My Office")
3. Start drawing!

### Drawing Walls

1. Select the **Wall** tool (W)
2. Click to place wall points
3. Press **Enter** or double-click to finish the wall
4. Press **Escape** to cancel

### Placing Objects

1. Open the **Library** panel on the right
2. Click a preset (e.g., "Medium Desk")
3. Click on the canvas to place the object
4. Use the **Property Inspector** to adjust dimensions

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| V | Select tool |
| W | Wall tool |
| D | Door tool |
| N | Window tool |
| O | Object tool |
| M | Measure tool |
| T | Text tool |
| G | Toggle grid |
| Space (hold) | Pan mode |
| Scroll | Zoom |
| ⌘/Ctrl + Z | Undo |
| ⌘/Ctrl + Shift + Z | Redo |
| ⌘/Ctrl + S | Save |
| Delete/Backspace | Delete selected |
| Escape | Cancel current operation |

### Snapping

The editor supports three types of snapping (toggle in the toolbar):
- **Grid**: Snap to the grid intersections
- **Walls**: Snap to wall endpoints and midpoints
- **Objects**: Snap to object corners, edges, and centers

### Exporting

1. Click **Export** in the header
2. Choose format(s): PNG, SVG, PDF, or All
3. Files are saved to `/exports/<layout-slug>/`

### Building the Gallery

The gallery creates a static site for GitHub Pages:

```bash
# Via Docker
docker compose exec server npm run build:gallery

# Or from root
npm run build:gallery
```

This generates:
- `/docs/index.html` - Gallery page
- `/docs/index.json` - Layout metadata
- `/docs/previews/` - PNG previews

Enable GitHub Pages on the `/docs` folder to host your gallery.

## Project Structure

```
├── docker-compose.yml    # Docker configuration
├── client/               # React + Vite frontend
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── hooks/        # React hooks
│   │   ├── store/        # Zustand store
│   │   ├── types/        # TypeScript types
│   │   └── utils/        # Utilities
│   └── Dockerfile
├── server/               # Express backend
│   ├── src/
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   └── types/        # TypeScript types
│   └── Dockerfile
├── layouts/              # Saved layouts (JSON)
│   ├── presets.json      # Object presets
│   └── .autosave/        # Auto-save backups
├── exports/              # Generated exports
└── docs/                 # GitHub Pages gallery
```

## Data Model

Layouts are saved as human-readable JSON with versioned schemas:

```typescript
interface Layout {
  schemaVersion: number;
  id: string;
  name: string;
  slug: string;
  settings: LayoutSettings;
  entities: Entity[];
}
```

### Entity Types

- **Wall**: Polyline with thickness
- **Door**: Attached to wall with swing direction
- **Window**: Attached to wall
- **Object**: Desk, chair, shelf, rack, or custom rectangle
- **Text**: Label or annotation
- **Dimension**: Measurement line

## Adding Custom Presets

Edit `/layouts/presets.json` to add custom object presets:

```json
{
  "presets": {
    "custom": [
      {
        "name": "My Custom Object",
        "objectType": "rect",
        "width": 36,
        "height": 24
      }
    ]
  }
}
```

Dimensions are in inches.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/layouts | List all layouts |
| GET | /api/layouts/:slug | Get a layout |
| POST | /api/layouts/:slug | Save a layout |
| DELETE | /api/layouts/:slug | Delete a layout |
| GET | /api/layouts/presets | Get presets |
| POST | /api/layouts/presets | Save presets |
| POST | /api/export/:slug | Export a layout |
| GET | /api/export/:slug | List exports |
| POST | /api/gallery/build | Build the gallery |

## Sample Layouts

The project includes sample layouts to get you started:

- **sample-office.json** - A basic office with workstations
- **server-room.json** - A server room with rack rows
- **edit-bay.json** - A video editing suite

## Troubleshooting

### Docker Issues

If containers fail to start:

```bash
# Rebuild containers
docker compose build --no-cache

# Check logs
docker compose logs -f
```

### Port Conflicts

If ports 5173 or 3001 are in use, modify `docker-compose.yml`:

```yaml
ports:
  - "5174:5173"  # Change host port
```

### File Permissions

If layouts aren't saving on macOS:

```bash
# Ensure directories exist and are writable
mkdir -p layouts exports docs/previews
chmod -R 755 layouts exports docs
```

## License

MIT
