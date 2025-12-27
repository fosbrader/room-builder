import { Layer, Line, Circle } from 'react-konva';
import { useLayoutStore } from '../../store/layoutStore';

interface DrawingLayerProps {
  scale: number;
}

export function DrawingLayer({ scale }: DrawingLayerProps) {
  const wallDrawingPoints = useLayoutStore((state) => state.wallDrawingPoints);
  const isDrawingWall = useLayoutStore((state) => state.isDrawingWall);
  
  if (!isDrawingWall || wallDrawingPoints.length === 0) {
    return null;
  }
  
  // Convert points to flat array for Konva Line
  const flatPoints = wallDrawingPoints.flatMap(p => [p.x * scale, p.y * scale]);
  
  return (
    <Layer listening={false}>
      {/* Wall preview line */}
      <Line
        points={flatPoints}
        stroke="#e94560"
        strokeWidth={6 * scale}
        lineCap="square"
        lineJoin="miter"
        opacity={0.7}
      />
      
      {/* Points markers */}
      {wallDrawingPoints.map((point, index) => (
        <Circle
          key={index}
          x={point.x * scale}
          y={point.y * scale}
          radius={4}
          fill="#e94560"
          stroke="white"
          strokeWidth={2}
        />
      ))}
    </Layer>
  );
}
