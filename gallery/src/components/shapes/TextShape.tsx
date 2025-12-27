import { Text, Group } from 'react-konva';
import { TextLabel } from '../../types/schema';

interface TextShapeProps {
  entity: TextLabel;
  scale: number;
}

export function TextShape({ entity, scale }: TextShapeProps) {
  const x = entity.x * scale;
  const y = entity.y * scale;
  const fontSize = entity.fontSize * scale / 4;
  
  const style = entity.style || {};
  
  return (
    <Group
      x={x}
      y={y}
      rotation={entity.rotation || 0}
    >
      <Text
        text={entity.text}
        fontSize={fontSize}
        fill={style.fill || '#333333'}
        fontFamily="Arial, sans-serif"
      />
    </Group>
  );
}

