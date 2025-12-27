import { Line, Group } from 'react-konva';
import { Wall } from '../../types/schema';

interface WallShapeProps {
  entity: Wall;
  scale: number;
}

export function WallShape({ entity, scale }: WallShapeProps) {
  const style = entity.style || {};
  const stroke = style.stroke || '#374151';
  
  // Convert points to screen coordinates
  const flatPoints = entity.points.flatMap(p => [
    (entity.x + p.x) * scale,
    (entity.y + p.y) * scale,
  ]);
  
  return (
    <Group>
      <Line
        points={flatPoints}
        stroke={stroke}
        strokeWidth={entity.thickness * scale}
        lineCap="square"
        lineJoin="miter"
      />
    </Group>
  );
}

