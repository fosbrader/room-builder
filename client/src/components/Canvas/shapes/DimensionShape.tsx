import { Group, Line, Text, Arrow } from 'react-konva';
import { DimensionLine } from '../../../types/schema';
import { useLayoutStore } from '../../../store/layoutStore';
import { distance } from '../../../utils/geometry';
import { formatDimension } from '../../../utils/units';

interface DimensionShapeProps {
  entity: DimensionLine;
  scale: number;
}

export function DimensionShape({ entity, scale }: DimensionShapeProps) {
  const selectedIds = useLayoutStore((state) => state.selectedIds);
  const selectEntity = useLayoutStore((state) => state.selectEntity);
  const layout = useLayoutStore((state) => state.layout);
  const toolMode = useLayoutStore((state) => state.toolMode);
  
  const isSelected = selectedIds.includes(entity.id);
  const units = layout?.settings.units || 'ft-in';
  
  const startX = entity.startX * scale;
  const startY = entity.startY * scale;
  const endX = entity.endX * scale;
  const endY = entity.endY * scale;
  
  // Calculate distance
  const dist = distance(
    { x: entity.startX, y: entity.startY },
    { x: entity.endX, y: entity.endY }
  );
  const label = formatDimension(dist, units);
  
  // Calculate midpoint and angle
  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;
  const angle = Math.atan2(endY - startY, endX - startX) * (180 / Math.PI);
  
  // Calculate perpendicular offset for dimension line
  const dx = endX - startX;
  const dy = endY - startY;
  const length = Math.sqrt(dx * dx + dy * dy);
  const offsetX = (-dy / length) * 20;
  const offsetY = (dx / length) * 20;
  
  const handleClick = (e: any) => {
    e.cancelBubble = true;
    if (toolMode === 'select') {
      selectEntity(entity.id, e.evt.shiftKey);
    }
  };
  
  const stroke = isSelected ? '#e94560' : '#666666';
  
  return (
    <Group onClick={handleClick}>
      {/* Extension lines */}
      <Line
        points={[startX, startY, startX + offsetX, startY + offsetY]}
        stroke={stroke}
        strokeWidth={1}
      />
      <Line
        points={[endX, endY, endX + offsetX, endY + offsetY]}
        stroke={stroke}
        strokeWidth={1}
      />
      
      {/* Dimension line with arrows */}
      <Arrow
        points={[
          startX + offsetX, startY + offsetY,
          endX + offsetX, endY + offsetY,
        ]}
        stroke={stroke}
        strokeWidth={1}
        pointerLength={6}
        pointerWidth={4}
        pointerAtBeginning
        pointerAtEnding
      />
      
      {/* Dimension text */}
      <Text
        x={midX + offsetX}
        y={midY + offsetY - 8}
        text={label}
        fontSize={11}
        fill={stroke}
        rotation={angle > 90 || angle < -90 ? angle + 180 : angle}
        offsetX={label.length * 3}
      />
    </Group>
  );
}
