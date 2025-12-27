import { Group, Line, Arc, Rect } from 'react-konva';
import { Door } from '../../types/schema';

interface DoorShapeProps {
  entity: Door;
  scale: number;
}

export function DoorShape({ entity, scale }: DoorShapeProps) {
  const x = entity.x * scale;
  const y = entity.y * scale;
  const doorWidth = entity.width * scale;
  
  // Calculate swing arc
  const arcRadius = doorWidth;
  const arcAngle = entity.openAngle || 90;
  
  return (
    <Group
      x={x}
      y={y}
      rotation={entity.rotation || 0}
    >
      {/* Door opening (gap in wall) */}
      <Rect
        x={0}
        y={-4}
        width={doorWidth}
        height={8}
        fill="white"
      />
      
      {/* Door panel */}
      <Line
        points={entity.hingeSide === 'left' 
          ? [0, 0, doorWidth, 0]
          : [doorWidth, 0, 0, 0]
        }
        stroke="#374151"
        strokeWidth={4}
      />
      
      {/* Swing arc */}
      <Arc
        x={entity.hingeSide === 'left' ? 0 : doorWidth}
        y={0}
        innerRadius={arcRadius - 1}
        outerRadius={arcRadius}
        angle={arcAngle}
        rotation={entity.hingeSide === 'left' 
          ? (entity.swingDirection === 'inward' ? -arcAngle : 0)
          : (entity.swingDirection === 'inward' ? 180 : 180 - arcAngle)
        }
        stroke="#9ca3af"
        strokeWidth={1}
        dash={[4, 4]}
      />
      
      {/* Hinge indicator */}
      <Rect
        x={entity.hingeSide === 'left' ? -3 : doorWidth - 3}
        y={-3}
        width={6}
        height={6}
        fill="#374151"
        cornerRadius={3}
      />
    </Group>
  );
}

