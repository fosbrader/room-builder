import { Group, Line, Arc, Rect } from 'react-konva';
import { Door } from '../../../types/schema';
import { useLayoutStore } from '../../../store/layoutStore';

interface DoorShapeProps {
  entity: Door;
  scale: number;
}

export function DoorShape({ entity, scale }: DoorShapeProps) {
  const selectedIds = useLayoutStore((state) => state.selectedIds);
  const selectEntity = useLayoutStore((state) => state.selectEntity);
  const toolMode = useLayoutStore((state) => state.toolMode);
  
  const isSelected = selectedIds.includes(entity.id);
  
  const x = entity.x * scale;
  const y = entity.y * scale;
  const doorWidth = entity.width * scale;
  
  const handleClick = (e: any) => {
    e.cancelBubble = true;
    if (toolMode === 'select') {
      selectEntity(entity.id, e.evt.shiftKey);
    }
  };
  
  // Calculate swing arc
  const arcRadius = doorWidth;
  const arcAngle = entity.openAngle || 90;
  const startAngle = entity.hingeSide === 'left' ? 0 : 180 - arcAngle;
  
  // Flip arc direction based on swing direction
  const arcRotation = entity.swingDirection === 'inward' ? 0 : 180;
  
  return (
    <Group
      x={x}
      y={y}
      rotation={entity.rotation || 0}
      onClick={handleClick}
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
        stroke={isSelected ? '#e94560' : '#374151'}
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
        stroke={isSelected ? '#e94560' : '#9ca3af'}
        strokeWidth={1}
        dash={[4, 4]}
      />
      
      {/* Hinge indicator */}
      <Rect
        x={entity.hingeSide === 'left' ? -3 : doorWidth - 3}
        y={-3}
        width={6}
        height={6}
        fill={isSelected ? '#e94560' : '#374151'}
        cornerRadius={3}
      />
      
      {/* Label */}
      {entity.label && (
        <Line
          x={doorWidth / 2}
          y={-20}
          points={[0, 0]}
        />
      )}
    </Group>
  );
}
