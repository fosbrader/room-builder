import { Layer, Line, Text, Circle } from 'react-konva';
import { useLayoutStore } from '../../store/layoutStore';
import { distance } from '../../utils/geometry';
import { formatDimension } from '../../utils/units';
import { UnitSystem } from '../../types/schema';

interface MeasureLayerProps {
  scale: number;
  units: UnitSystem;
}

export function MeasureLayer({ scale, units }: MeasureLayerProps) {
  const measureStart = useLayoutStore((state) => state.measureStart);
  const measureEnd = useLayoutStore((state) => state.measureEnd);
  
  if (!measureStart || !measureEnd) {
    return null;
  }
  
  const startX = measureStart.x * scale;
  const startY = measureStart.y * scale;
  const endX = measureEnd.x * scale;
  const endY = measureEnd.y * scale;
  
  // Calculate distance in inches (internal unit)
  const dist = distance(measureStart, measureEnd);
  const label = formatDimension(dist, units);
  
  // Calculate midpoint for label
  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;
  
  // Calculate angle for label rotation
  const angle = Math.atan2(endY - startY, endX - startX) * (180 / Math.PI);
  const labelAngle = angle > 90 || angle < -90 ? angle + 180 : angle;
  
  return (
    <Layer listening={false}>
      {/* Measurement line */}
      <Line
        points={[startX, startY, endX, endY]}
        stroke="#fbbf24"
        strokeWidth={2}
        dash={[8, 4]}
      />
      
      {/* Start point */}
      <Circle
        x={startX}
        y={startY}
        radius={5}
        fill="#fbbf24"
        stroke="white"
        strokeWidth={2}
      />
      
      {/* End point */}
      <Circle
        x={endX}
        y={endY}
        radius={5}
        fill="#fbbf24"
        stroke="white"
        strokeWidth={2}
      />
      
      {/* Distance label */}
      <Text
        x={midX}
        y={midY - 20}
        text={label}
        fontSize={14}
        fontStyle="bold"
        fill="#fbbf24"
        stroke="white"
        strokeWidth={3}
        fillAfterStrokeEnabled
        align="center"
        offsetX={30}
      />
    </Layer>
  );
}
