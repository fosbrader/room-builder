import { Layer } from 'react-konva';
import { Entity } from '../../types/schema';
import { WallShape } from './shapes/WallShape';
import { ObjectShape } from './shapes/ObjectShape';
import { DoorShape } from './shapes/DoorShape';
import { WindowShape } from './shapes/WindowShape';
import { TextShape } from './shapes/TextShape';
import { DimensionShape } from './shapes/DimensionShape';

interface EntitiesLayerProps {
  entities: Entity[];
  scale: number;
}

export function EntitiesLayer({ entities, scale }: EntitiesLayerProps) {
  const renderEntity = (entity: Entity) => {
    switch (entity.type) {
      case 'wall':
        return <WallShape key={entity.id} entity={entity} scale={scale} />;
      case 'object':
        return <ObjectShape key={entity.id} entity={entity} scale={scale} />;
      case 'door':
        return <DoorShape key={entity.id} entity={entity} scale={scale} />;
      case 'window':
        return <WindowShape key={entity.id} entity={entity} scale={scale} />;
      case 'text':
        return <TextShape key={entity.id} entity={entity} scale={scale} />;
      case 'dimension':
        return <DimensionShape key={entity.id} entity={entity} scale={scale} />;
      default:
        return null;
    }
  };
  
  // Sort entities by type for proper layering
  const sortedEntities = [...entities].sort((a, b) => {
    const order: Record<string, number> = {
      wall: 0,
      window: 1,
      door: 2,
      object: 3,
      dimension: 4,
      text: 5,
    };
    return (order[a.type] ?? 10) - (order[b.type] ?? 10);
  });
  
  return (
    <Layer>
      {sortedEntities.map(renderEntity)}
    </Layer>
  );
}
