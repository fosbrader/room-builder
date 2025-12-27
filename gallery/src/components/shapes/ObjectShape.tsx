import { Rect, Group, Text, Line } from 'react-konva';
import { FloorObject } from '../../types/schema';

interface ObjectShapeProps {
  entity: FloorObject;
  scale: number;
}

// Object type colors and styles
const OBJECT_STYLES: Record<string, { fill: string; stroke: string }> = {
  desk: { fill: '#d4a574', stroke: '#8b6914' },
  chair: { fill: '#6b7280', stroke: '#374151' },
  shelf: { fill: '#a78bfa', stroke: '#6d28d9' },
  rack: { fill: '#1e293b', stroke: '#0f172a' },
  rect: { fill: '#9ca3af', stroke: '#4b5563' },
};

export function ObjectShape({ entity, scale }: ObjectShapeProps) {
  const objStyle = OBJECT_STYLES[entity.objectType] || OBJECT_STYLES.rect;
  
  const x = entity.x * scale;
  const y = entity.y * scale;
  const width = entity.width * scale;
  const height = entity.height * scale;
  
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
    >
      {/* Main shape */}
      <Rect
        width={width}
        height={height}
        fill={objStyle.fill}
        stroke={objStyle.stroke}
        strokeWidth={1}
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
    </Group>
  );
}

