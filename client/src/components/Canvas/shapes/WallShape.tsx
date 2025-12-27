import { Line, Group, Text } from 'react-konva';
import { Wall } from '../../../types/schema';
import { useLayoutStore } from '../../../store/layoutStore';
import { distance } from '../../../utils/geometry';
import { formatDimension } from '../../../utils/units';

interface WallShapeProps {
  entity: Wall;
  scale: number;
}

export function WallShape({ entity, scale }: WallShapeProps) {
  const selectedIds = useLayoutStore((state) => state.selectedIds);
  const selectEntity = useLayoutStore((state) => state.selectEntity);
  const layout = useLayoutStore((state) => state.layout);
  
  const isSelected = selectedIds.includes(entity.id);
  const style = entity.style || {};
  const stroke = isSelected ? '#e94560' : (style.stroke || '#374151');
  
  // Convert points to screen coordinates
  const flatPoints = entity.points.flatMap(p => [
    (entity.x + p.x) * scale,
    (entity.y + p.y) * scale,
  ]);
  
  const handleClick = (e: any) => {
    e.cancelBubble = true;
    selectEntity(entity.id, e.evt.shiftKey);
  };
  
  // Calculate dimension labels for each segment
  const dimensionLabels = [];
  const units = layout?.settings.units || 'ft-in';
  
  for (let i = 0; i < entity.points.length - 1; i++) {
    const p1 = entity.points[i];
    const p2 = entity.points[i + 1];
    const segmentLength = distance(p1, p2);
    const label = formatDimension(segmentLength, units);
    
    const midX = (entity.x + (p1.x + p2.x) / 2) * scale;
    const midY = (entity.y + (p1.y + p2.y) / 2) * scale;
    
    // Calculate perpendicular offset for label
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const offsetX = (-dy / length) * 15;
    const offsetY = (dx / length) * 15;
    
    dimensionLabels.push({
      x: midX + offsetX,
      y: midY + offsetY,
      text: label,
    });
  }
  
  return (
    <Group onClick={handleClick}>
      {/* Wall line */}
      <Line
        points={flatPoints}
        stroke={stroke}
        strokeWidth={entity.thickness * scale}
        lineCap="square"
        lineJoin="miter"
        hitStrokeWidth={Math.max(entity.thickness * scale, 10)}
      />
      
      {/* Dimension labels when selected */}
      {isSelected && dimensionLabels.map((label, i) => (
        <Text
          key={i}
          x={label.x}
          y={label.y}
          text={label.text}
          fontSize={11}
          fill="#666"
          offsetX={20}
          offsetY={6}
        />
      ))}
      
      {/* Wall label */}
      {entity.label && (
        <Text
          x={(entity.x + entity.points[0].x) * scale}
          y={(entity.y + entity.points[0].y) * scale - 20}
          text={entity.label}
          fontSize={12}
          fill="#333"
        />
      )}
    </Group>
  );
}
