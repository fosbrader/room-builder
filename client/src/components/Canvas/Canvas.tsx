import { useRef, useCallback, useEffect, useState } from 'react';
import { Stage, Layer, Rect } from 'react-konva';
import Konva from 'konva';
import { useLayoutStore } from '../../store/layoutStore';
import { GridLayer } from './GridLayer';
import { EntitiesLayer } from './EntitiesLayer';
import { DrawingLayer } from './DrawingLayer';
import { SelectionLayer } from './SelectionLayer';
import { MeasureLayer } from './MeasureLayer';
import { useCanvasInteraction } from '../../hooks/useCanvasInteraction';
import './Canvas.css';

export function Canvas() {
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [stageDimensions, setStageDimensions] = useState({ width: 800, height: 600 });
  
  const layout = useLayoutStore((state) => state.layout);
  const showGrid = useLayoutStore((state) => state.showGrid);
  const stagePosition = useLayoutStore((state) => state.stagePosition);
  const stageScale = useLayoutStore((state) => state.stageScale);
  const setStagePosition = useLayoutStore((state) => state.setStagePosition);
  const setStageScale = useLayoutStore((state) => state.setStageScale);
  const isPanning = useLayoutStore((state) => state.isPanning);
  
  const { handleMouseDown, handleMouseMove, handleMouseUp, handleClick } = useCanvasInteraction(stageRef);
  
  // Handle wheel for zoom
  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    
    const stage = stageRef.current;
    if (!stage) return;
    
    const oldScale = stageScale;
    const pointer = stage.getPointerPosition();
    
    if (!pointer) return;
    
    // Determine zoom direction
    const scaleBy = 1.1;
    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    
    // Clamp scale
    const clampedScale = Math.max(0.1, Math.min(5, newScale));
    
    // Calculate new position to zoom towards pointer
    const mousePointTo = {
      x: (pointer.x - stagePosition.x) / oldScale,
      y: (pointer.y - stagePosition.y) / oldScale,
    };
    
    const newPos = {
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    };
    
    setStageScale(clampedScale);
    setStagePosition(newPos);
  }, [stageScale, stagePosition, setStageScale, setStagePosition]);
  
  // Handle drag for pan
  const handleDragEnd = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    setStagePosition({
      x: e.target.x(),
      y: e.target.y(),
    });
  }, [setStagePosition]);
  
  // Fit canvas to container using ResizeObserver for reliable sizing
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setStageDimensions({ width, height });
        }
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);
  
  if (!layout) {
    return (
      <div className="canvas-placeholder">
        <p>Create a new layout or load an existing one to start editing</p>
      </div>
    );
  }
  
  const scale = layout.settings.scale;
  const canvasWidth = layout.settings.pageWidth * scale;
  const canvasHeight = layout.settings.pageHeight * scale;
  
  return (
    <div ref={containerRef} className="canvas-wrapper">
      <Stage
        ref={stageRef}
        width={stageDimensions.width}
        height={stageDimensions.height}
        x={stagePosition.x}
        y={stagePosition.y}
        scaleX={stageScale}
        scaleY={stageScale}
        draggable={isPanning}
        onDragEnd={handleDragEnd}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleClick}
      >
        {/* Background */}
        <Layer>
          <Rect
            x={0}
            y={0}
            width={canvasWidth}
            height={canvasHeight}
            fill="#ffffff"
            shadowColor="#000"
            shadowBlur={10}
            shadowOpacity={0.1}
            shadowOffsetX={2}
            shadowOffsetY={2}
          />
        </Layer>
        
        {/* Grid */}
        {showGrid && (
          <GridLayer
            width={canvasWidth}
            height={canvasHeight}
            gridSize={layout.settings.gridSize * scale}
          />
        )}
        
        {/* Entities */}
        <EntitiesLayer
          entities={layout.entities}
          scale={scale}
        />
        
        {/* Drawing layer for walls in progress */}
        <DrawingLayer scale={scale} />
        
        {/* Selection layer */}
        <SelectionLayer scale={scale} />
        
        {/* Measurement layer */}
        <MeasureLayer scale={scale} units={layout.settings.units} />
      </Stage>
      
      {/* Zoom indicator */}
      <div className="zoom-indicator">
        {Math.round(stageScale * 100)}%
      </div>
    </div>
  );
}
