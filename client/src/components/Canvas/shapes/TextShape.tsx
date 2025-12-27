import { Text, Group, Rect } from 'react-konva';
import { TextLabel } from '../../../types/schema';
import { useLayoutStore } from '../../../store/layoutStore';

interface TextShapeProps {
  entity: TextLabel;
  scale: number;
}

export function TextShape({ entity, scale }: TextShapeProps) {
  const selectedIds = useLayoutStore((state) => state.selectedIds);
  const selectEntity = useLayoutStore((state) => state.selectEntity);
  const updateEntity = useLayoutStore((state) => state.updateEntity);
  const toolMode = useLayoutStore((state) => state.toolMode);
  
  const isSelected = selectedIds.includes(entity.id);
  
  const x = entity.x * scale;
  const y = entity.y * scale;
  const fontSize = entity.fontSize * scale / 4;
  
  const handleClick = (e: any) => {
    e.cancelBubble = true;
    if (toolMode === 'select') {
      selectEntity(entity.id, e.evt.shiftKey);
    }
  };
  
  const handleDragEnd = (e: any) => {
    updateEntity(entity.id, {
      x: e.target.x() / scale,
      y: e.target.y() / scale,
    });
  };
  
  const style = entity.style || {};
  
  return (
    <Group
      x={x}
      y={y}
      rotation={entity.rotation || 0}
      draggable={toolMode === 'select'}
      onClick={handleClick}
      onDragEnd={handleDragEnd}
    >
      {/* Selection background */}
      {isSelected && (
        <Rect
          x={-4}
          y={-4}
          width={entity.text.length * fontSize * 0.6 + 8}
          height={fontSize + 8}
          fill="rgba(233, 69, 96, 0.1)"
          stroke="#e94560"
          strokeWidth={1}
          dash={[3, 3]}
        />
      )}
      
      {/* Text */}
      <Text
        text={entity.text}
        fontSize={fontSize}
        fill={style.fill || '#333333'}
        fontFamily="Arial, sans-serif"
      />
    </Group>
  );
}
