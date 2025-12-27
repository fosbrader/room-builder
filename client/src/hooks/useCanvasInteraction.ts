import { useCallback, RefObject } from 'react';
import Konva from 'konva';
import { nanoid } from 'nanoid';
import { useLayoutStore } from '../store/layoutStore';
import { useSnapping } from './useSnapping';
import { FloorObject } from '../types/schema';

export function useCanvasInteraction(stageRef: RefObject<Konva.Stage>) {
  const toolMode = useLayoutStore((state) => state.toolMode);
  const layout = useLayoutStore((state) => state.layout);
  const stageScale = useLayoutStore((state) => state.stageScale);
  const stagePosition = useLayoutStore((state) => state.stagePosition);
  const placingObject = useLayoutStore((state) => state.placingObject);
  
  const startWallDrawing = useLayoutStore((state) => state.startWallDrawing);
  const addWallPoint = useLayoutStore((state) => state.addWallPoint);
  const finishWallDrawing = useLayoutStore((state) => state.finishWallDrawing);
  const isDrawingWall = useLayoutStore((state) => state.isDrawingWall);
  
  const startMeasure = useLayoutStore((state) => state.startMeasure);
  const updateMeasure = useLayoutStore((state) => state.updateMeasure);
  const measureStart = useLayoutStore((state) => state.measureStart);
  
  const addEntity = useLayoutStore((state) => state.addEntity);
  const clearSelection = useLayoutStore((state) => state.clearSelection);
  const cancelPlacingObject = useLayoutStore((state) => state.cancelPlacingObject);
  
  const { snapPoint } = useSnapping();
  
  // Convert stage coordinates to layout coordinates
  const stageToLayout = useCallback((stageX: number, stageY: number) => {
    if (!layout) return { x: 0, y: 0 };
    
    const scale = layout.settings.scale;
    return {
      x: (stageX - stagePosition.x) / stageScale / scale,
      y: (stageY - stagePosition.y) / stageScale / scale,
    };
  }, [layout, stagePosition, stageScale]);
  
  const handleMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    // Only handle clicks on the stage background
    if (e.target !== e.target.getStage()) return;
    
    const stage = stageRef.current;
    if (!stage) return;
    
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    
    const point = stageToLayout(pointer.x, pointer.y);
    const snappedPoint = snapPoint(point);
    
    switch (toolMode) {
      case 'wall':
        if (isDrawingWall) {
          addWallPoint(snappedPoint);
        } else {
          startWallDrawing(snappedPoint);
        }
        break;
        
      case 'measure':
        startMeasure(snappedPoint);
        break;
        
      case 'select':
        // Clicking on empty space clears selection
        clearSelection();
        break;
    }
  }, [toolMode, isDrawingWall, stageRef, stageToLayout, snapPoint, startWallDrawing, addWallPoint, startMeasure, clearSelection]);
  
  const handleMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = stageRef.current;
    if (!stage) return;
    
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    
    const point = stageToLayout(pointer.x, pointer.y);
    const snappedPoint = snapPoint(point);
    
    switch (toolMode) {
      case 'measure':
        if (measureStart) {
          updateMeasure(snappedPoint);
        }
        break;
    }
  }, [toolMode, measureStart, stageRef, stageToLayout, snapPoint, updateMeasure]);
  
  const handleMouseUp = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    // Handle mouse up events if needed
  }, []);
  
  const handleClick = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    // Only handle clicks on the stage background
    if (e.target !== e.target.getStage()) return;
    
    const stage = stageRef.current;
    if (!stage || !layout) return;
    
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    
    const point = stageToLayout(pointer.x, pointer.y);
    const snappedPoint = snapPoint(point);
    
    switch (toolMode) {
      case 'object':
        if (placingObject) {
          const newObject: FloorObject = {
            id: nanoid(),
            type: 'object',
            objectType: placingObject.objectType,
            x: snappedPoint.x - placingObject.width / 2,
            y: snappedPoint.y - placingObject.height / 2,
            width: placingObject.width,
            height: placingObject.height,
            depth: placingObject.depth,
            rotation: 0,
          };
          addEntity(newObject);
        }
        break;
        
      case 'door':
        // TODO: Find nearest wall and attach door
        break;
        
      case 'window':
        // TODO: Find nearest wall and attach window
        break;
        
      case 'text':
        const newText = {
          id: nanoid(),
          type: 'text' as const,
          x: snappedPoint.x,
          y: snappedPoint.y,
          rotation: 0,
          text: 'Text',
          fontSize: 14,
        };
        addEntity(newText);
        break;
    }
  }, [toolMode, placingObject, layout, stageRef, stageToLayout, snapPoint, addEntity]);
  
  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleClick,
  };
}
