import { useCallback } from 'react';
import { useLayoutStore } from '../store/layoutStore';
import { Point, Wall, FloorObject } from '../types/schema';
import { distance, snapPointToGrid, midpoint } from '../utils/geometry';

const SNAP_THRESHOLD = 12; // Snap within 12 inches

interface SnapCandidate {
  point: Point;
  type: 'grid' | 'endpoint' | 'midpoint' | 'edge' | 'center';
  distance: number;
}

export function useSnapping() {
  const layout = useLayoutStore((state) => state.layout);
  
  const snapPoint = useCallback((point: Point): Point => {
    if (!layout) return point;
    
    const settings = layout.settings;
    const candidates: SnapCandidate[] = [];
    
    // Snap to grid
    if (settings.snapToGrid) {
      const gridPoint = snapPointToGrid(point, settings.gridSize);
      candidates.push({
        point: gridPoint,
        type: 'grid',
        distance: distance(point, gridPoint),
      });
    }
    
    // Snap to wall endpoints and midpoints
    if (settings.snapToWalls) {
      for (const entity of layout.entities) {
        if (entity.type === 'wall') {
          const wall = entity as Wall;
          
          // Endpoints
          for (const p of wall.points) {
            const worldPoint = { x: wall.x + p.x, y: wall.y + p.y };
            candidates.push({
              point: worldPoint,
              type: 'endpoint',
              distance: distance(point, worldPoint),
            });
          }
          
          // Midpoints between consecutive points
          for (let i = 0; i < wall.points.length - 1; i++) {
            const p1 = { x: wall.x + wall.points[i].x, y: wall.y + wall.points[i].y };
            const p2 = { x: wall.x + wall.points[i + 1].x, y: wall.y + wall.points[i + 1].y };
            const mid = midpoint(p1, p2);
            candidates.push({
              point: mid,
              type: 'midpoint',
              distance: distance(point, mid),
            });
          }
        }
      }
    }
    
    // Snap to object edges and centers
    if (settings.snapToObjects) {
      for (const entity of layout.entities) {
        if (entity.type === 'object') {
          const obj = entity as FloorObject;
          
          // Center
          const center = {
            x: obj.x + obj.width / 2,
            y: obj.y + obj.height / 2,
          };
          candidates.push({
            point: center,
            type: 'center',
            distance: distance(point, center),
          });
          
          // Corners
          const corners = [
            { x: obj.x, y: obj.y },
            { x: obj.x + obj.width, y: obj.y },
            { x: obj.x, y: obj.y + obj.height },
            { x: obj.x + obj.width, y: obj.y + obj.height },
          ];
          
          for (const corner of corners) {
            candidates.push({
              point: corner,
              type: 'edge',
              distance: distance(point, corner),
            });
          }
          
          // Edge midpoints
          const edgeMids = [
            { x: obj.x + obj.width / 2, y: obj.y },
            { x: obj.x + obj.width / 2, y: obj.y + obj.height },
            { x: obj.x, y: obj.y + obj.height / 2 },
            { x: obj.x + obj.width, y: obj.y + obj.height / 2 },
          ];
          
          for (const mid of edgeMids) {
            candidates.push({
              point: mid,
              type: 'edge',
              distance: distance(point, mid),
            });
          }
        }
      }
    }
    
    // Find the nearest candidate within threshold
    const validCandidates = candidates.filter(c => c.distance <= SNAP_THRESHOLD);
    
    if (validCandidates.length === 0) {
      // If no snap candidates, still snap to grid if enabled
      if (settings.snapToGrid) {
        return snapPointToGrid(point, settings.gridSize);
      }
      return point;
    }
    
    // Sort by distance and return the nearest
    validCandidates.sort((a, b) => a.distance - b.distance);
    return validCandidates[0].point;
  }, [layout]);
  
  return { snapPoint };
}
