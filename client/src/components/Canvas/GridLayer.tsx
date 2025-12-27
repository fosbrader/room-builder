import { Layer, Line, Rect } from 'react-konva';

interface GridLayerProps {
  width: number;
  height: number;
  gridSize: number;
}

export function GridLayer({ width, height, gridSize }: GridLayerProps) {
  const lines = [];
  
  // Vertical lines
  for (let x = 0; x <= width; x += gridSize) {
    lines.push(
      <Line
        key={`v-${x}`}
        points={[x, 0, x, height]}
        stroke="rgba(100, 100, 100, 0.2)"
        strokeWidth={1}
      />
    );
  }
  
  // Horizontal lines
  for (let y = 0; y <= height; y += gridSize) {
    lines.push(
      <Line
        key={`h-${y}`}
        points={[0, y, width, y]}
        stroke="rgba(100, 100, 100, 0.2)"
        strokeWidth={1}
      />
    );
  }
  
  // Major grid lines (every 12 inches = 1 foot when gridSize is 12)
  const majorGridSize = gridSize * 4;
  
  for (let x = 0; x <= width; x += majorGridSize) {
    lines.push(
      <Line
        key={`mv-${x}`}
        points={[x, 0, x, height]}
        stroke="rgba(100, 100, 100, 0.4)"
        strokeWidth={1}
      />
    );
  }
  
  for (let y = 0; y <= height; y += majorGridSize) {
    lines.push(
      <Line
        key={`mh-${y}`}
        points={[0, y, width, y]}
        stroke="rgba(100, 100, 100, 0.4)"
        strokeWidth={1}
      />
    );
  }
  
  return (
    <Layer listening={false}>
      {lines}
    </Layer>
  );
}
