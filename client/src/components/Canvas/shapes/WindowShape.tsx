import { Group, Line, Rect } from 'react-konva';
import { Window } from '../../../types/schema';
import { useLayoutStore } from '../../../store/layoutStore';

interface WindowShapeProps {
  entity: Window;
  scale: number;
}

export function WindowShape({ entity, scale }: WindowShapeProps) {
  const selectedIds = useLayoutStore((state) => state.selectedIds);
  const selectEntity = useLayoutStore((state) => state.selectEntity);
  const toolMode = useLayoutStore((state) => state.toolMode);
  
  const isSelected = selectedIds.includes(entity.id);
  
  const x = entity.x * scale;
  const y = entity.y * scale;
  const windowWidth = entity.width * scale;
  const windowHeight = 8; // Window thickness on plan view
  
  const handleClick = (e: any) => {
    e.cancelBubble = true;
    if (toolMode === 'select') {
      selectEntity(entity.id, e.evt.shiftKey);
    }
  };
  
  return (
    <Group
      x={x}
      y={y}
      rotation={entity.rotation || 0}
      onClick={handleClick}
    >
      {/* Window frame */}
      <Rect
        x={0}
        y={-windowHeight / 2}
        width={windowWidth}
        height={windowHeight}
        fill="#bfdbfe"
        stroke={isSelected ? '#e94560' : '#3b82f6'}
        strokeWidth={isSelected ? 2 : 1}
      />
      
      {/* Glass panes - center divider */}
      <Line
        points={[windowWidth / 2, -windowHeight / 2, windowWidth / 2, windowHeight / 2]}
        stroke="#3b82f6"
        strokeWidth={1}
      />
      
      {/* Cross pattern for glass */}
      <Line
        points={[windowWidth * 0.25, 0, windowWidth * 0.75, 0]}
        stroke="rgba(59, 130, 246, 0.5)"
        strokeWidth={1}
      />
      
      {/* Sill indicators on sides */}
      <Line
        points={[0, -windowHeight / 2 - 2, 0, windowHeight / 2 + 2]}
        stroke={isSelected ? '#e94560' : '#374151'}
        strokeWidth={2}
      />
      <Line
        points={[windowWidth, -windowHeight / 2 - 2, windowWidth, windowHeight / 2 + 2]}
        stroke={isSelected ? '#e94560' : '#374151'}
        strokeWidth={2}
      />
      
      {/* Label */}
      {entity.label && (
        <Rect
          x={windowWidth / 2}
          y={-20}
          width={0}
          height={0}
        />
      )}
    </Group>
  );
}
