import { Rect, Group, Text, Line } from 'react-konva';
import { FloorObject } from '../../../types/schema';
import { useLayoutStore } from '../../../store/layoutStore';

interface ObjectShapeProps {
  entity: FloorObject;
  scale: number;
}

// Object type colors and styles
const OBJECT_STYLES: Record<string, { fill: string; stroke: string; pattern?: string }> = {
  desk: { fill: '#d4a574', stroke: '#8b6914' },
  chair: { fill: '#6b7280', stroke: '#374151' },
  shelf: { fill: '#a78bfa', stroke: '#6d28d9' },
  rack: { fill: '#1e293b', stroke: '#0f172a' },
  rect: { fill: '#9ca3af', stroke: '#4b5563' },
};

export function ObjectShape({ entity, scale }: ObjectShapeProps) {
  const selectedIds = useLayoutStore((state) => state.selectedIds);
  const selectEntity = useLayoutStore((state) => state.selectEntity);
  const updateEntity = useLayoutStore((state) => state.updateEntity);
  const toolMode = useLayoutStore((state) => state.toolMode);
  
  const isSelected = selectedIds.includes(entity.id);
  const objStyle = OBJECT_STYLES[entity.objectType] || OBJECT_STYLES.rect;
  
  const x = entity.x * scale;
  const y = entity.y * scale;
  const width = entity.width * scale;
  const height = entity.height * scale;
  
  const handleClick = (e: any) => {
    e.cancelBubble = true;
    if (toolMode === 'select') {
      selectEntity(entity.id, e.evt.shiftKey);
    }
  };
  
  const handleMouseDown = (e: any) => {
    e.cancelBubble = true;
  };
  
  const handleDragStart = (e: any) => {
    e.cancelBubble = true;
    // Select the entity when starting to drag
    if (!selectedIds.includes(entity.id)) {
      selectEntity(entity.id, false);
    }
  };
  
  const handleDragEnd = (e: any) => {
    e.cancelBubble = true;
    updateEntity(entity.id, {
      x: e.target.x() / scale,
      y: e.target.y() / scale,
    });
  };
  
  const handleTransformEnd = (e: any) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    
    // Reset scale and update dimensions
    node.scaleX(1);
    node.scaleY(1);
    
    updateEntity(entity.id, {
      x: node.x() / scale,
      y: node.y() / scale,
      width: Math.max(5, (entity.width * scaleX)),
      height: Math.max(5, (entity.height * scaleY)),
      rotation: node.rotation(),
    });
  };
  
  // Server rack pattern (horizontal lines)
  const renderRackPattern = () => {
    if (entity.objectType !== 'rack') return null;
    
    const lines = [];
    const lineSpacing = height / 10;
    
    for (let i = 1; i < 10; i++) {
      lines.push(
        <Line
          key={i}
          points={[2, i * lineSpacing, width - 2, i * lineSpacing]}
          stroke="rgba(255,255,255,0.3)"
          strokeWidth={1}
        />
      );
    }
    
    return lines;
  };
  
  return (
    <Group
      x={x}
      y={y}
      rotation={entity.rotation || 0}
      draggable={toolMode === 'select'}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onTransformEnd={handleTransformEnd}
    >
      {/* Main shape */}
      <Rect
        width={width}
        height={height}
        fill={objStyle.fill}
        stroke={isSelected ? '#e94560' : objStyle.stroke}
        strokeWidth={isSelected ? 2 : 1}
        cornerRadius={entity.objectType === 'chair' ? width / 4 : 2}
      />
      
      {/* Rack pattern */}
      {renderRackPattern()}
      
      {/* Chair circle indicator */}
      {entity.objectType === 'chair' && (
        <Rect
          x={width * 0.2}
          y={height * 0.6}
          width={width * 0.6}
          height={height * 0.3}
          fill="rgba(0,0,0,0.2)"
          cornerRadius={4}
        />
      )}
      
      {/* Desk keyboard area */}
      {entity.objectType === 'desk' && (
        <Rect
          x={width * 0.3}
          y={height * 0.6}
          width={width * 0.4}
          height={height * 0.2}
          fill="rgba(0,0,0,0.1)"
          cornerRadius={2}
        />
      )}
      
      {/* Label */}
      {entity.label && (
        <Text
          x={0}
          y={height / 2 - 6}
          width={width}
          text={entity.label}
          fontSize={11}
          fill="#333"
          align="center"
        />
      )}
      
      {/* Object type indicator when selected */}
      {isSelected && (
        <Text
          x={0}
          y={-16}
          width={width}
          text={entity.objectType.toUpperCase()}
          fontSize={9}
          fill="#e94560"
          align="center"
        />
      )}
    </Group>
  );
}
