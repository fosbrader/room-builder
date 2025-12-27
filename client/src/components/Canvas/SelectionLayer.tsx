import { Layer, Rect, Transformer } from 'react-konva';
import { useRef, useEffect } from 'react';
import Konva from 'konva';
import { useLayoutStore } from '../../store/layoutStore';
import { Entity, FloorObject, Wall } from '../../types/schema';
import { getBoundingBox } from '../../utils/geometry';

interface SelectionLayerProps {
  scale: number;
}

export function SelectionLayer({ scale }: SelectionLayerProps) {
  const transformerRef = useRef<Konva.Transformer>(null);
  
  const layout = useLayoutStore((state) => state.layout);
  const selectedIds = useLayoutStore((state) => state.selectedIds);
  const updateEntity = useLayoutStore((state) => state.updateEntity);
  
  const selectedEntities = layout?.entities.filter(e => selectedIds.includes(e.id)) ?? [];
  
  // Get selection bounds
  const getSelectionBounds = () => {
    if (selectedEntities.length === 0) return null;
    
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    for (const entity of selectedEntities) {
      if (entity.type === 'wall') {
        const wall = entity as Wall;
        for (const p of wall.points) {
          minX = Math.min(minX, (wall.x + p.x) * scale);
          minY = Math.min(minY, (wall.y + p.y) * scale);
          maxX = Math.max(maxX, (wall.x + p.x) * scale);
          maxY = Math.max(maxY, (wall.y + p.y) * scale);
        }
      } else if (entity.type === 'object') {
        const obj = entity as FloorObject;
        minX = Math.min(minX, obj.x * scale);
        minY = Math.min(minY, obj.y * scale);
        maxX = Math.max(maxX, (obj.x + obj.width) * scale);
        maxY = Math.max(maxY, (obj.y + obj.height) * scale);
      } else {
        minX = Math.min(minX, entity.x * scale);
        minY = Math.min(minY, entity.y * scale);
        maxX = Math.max(maxX, entity.x * scale + 50);
        maxY = Math.max(maxY, entity.y * scale + 50);
      }
    }
    
    const padding = 4;
    return {
      x: minX - padding,
      y: minY - padding,
      width: maxX - minX + padding * 2,
      height: maxY - minY + padding * 2,
    };
  };
  
  const bounds = getSelectionBounds();
  
  if (!bounds || selectedEntities.length === 0) {
    return null;
  }
  
  return (
    <Layer listening={false}>
      {/* Selection rectangle */}
      <Rect
        x={bounds.x}
        y={bounds.y}
        width={bounds.width}
        height={bounds.height}
        stroke="#e94560"
        strokeWidth={2}
        dash={[5, 5]}
        fill="rgba(233, 69, 96, 0.1)"
      />
      
      {/* Corner handles */}
      {[
        { x: bounds.x, y: bounds.y },
        { x: bounds.x + bounds.width, y: bounds.y },
        { x: bounds.x, y: bounds.y + bounds.height },
        { x: bounds.x + bounds.width, y: bounds.y + bounds.height },
      ].map((pos, i) => (
        <Rect
          key={i}
          x={pos.x - 4}
          y={pos.y - 4}
          width={8}
          height={8}
          fill="white"
          stroke="#e94560"
          strokeWidth={2}
        />
      ))}
    </Layer>
  );
}
