import { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Stage, Layer, Rect } from 'react-konva';
import Konva from 'konva';
import { Layout, Entity } from './types/schema';
import { WallShape } from './components/shapes/WallShape';
import { ObjectShape } from './components/shapes/ObjectShape';
import { DoorShape } from './components/shapes/DoorShape';
import { WindowShape } from './components/shapes/WindowShape';
import { TextShape } from './components/shapes/TextShape';
import { GridLayer } from './components/shapes/GridLayer';
import { layoutToSvg } from './utils/svgExport';

export function Viewer() {
  const { slug } = useParams<{ slug: string }>();
  const [layout, setLayout] = useState<Layout | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });

  useEffect(() => {
    async function loadLayout() {
      if (!slug) return;
      
      try {
        const response = await fetch(`./layouts/${slug}.json`);
        if (!response.ok) {
          throw new Error('Layout not found');
        }
        const data = await response.json();
        setLayout(data);
      } catch (err) {
        console.error('Failed to load layout:', err);
        setError('Failed to load layout');
      } finally {
        setLoading(false);
      }
    }

    loadLayout();
  }, [slug]);

  // Handle container resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setContainerSize({ width, height });
        }
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Handle wheel zoom
  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    
    const stage = stageRef.current;
    if (!stage) return;
    
    const oldScale = zoom;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    
    const scaleBy = 1.1;
    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    const clampedScale = Math.max(0.1, Math.min(5, newScale));
    
    const mousePointTo = {
      x: (pointer.x - position.x) / oldScale,
      y: (pointer.y - position.y) / oldScale,
    };
    
    const newPos = {
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    };
    
    setZoom(clampedScale);
    setPosition(newPos);
  }, [zoom, position]);

  const handleDragEnd = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    setPosition({
      x: e.target.x(),
      y: e.target.y(),
    });
  }, []);

  const zoomIn = () => setZoom(z => Math.min(5, z * 1.2));
  const zoomOut = () => setZoom(z => Math.max(0.1, z / 1.2));
  const resetZoom = () => {
    setZoom(1);
    setPosition({ x: 50, y: 50 });
  };

  // Export functions
  const exportPng = useCallback(() => {
    const stage = stageRef.current;
    if (!stage || !layout) return;

    const dataUrl = stage.toDataURL({ 
      pixelRatio: 2,
      mimeType: 'image/png'
    });
    downloadDataUrl(dataUrl, `${layout.slug}.png`);
  }, [layout]);

  const exportJpg = useCallback(() => {
    const stage = stageRef.current;
    if (!stage || !layout) return;

    const dataUrl = stage.toDataURL({ 
      pixelRatio: 2,
      mimeType: 'image/jpeg',
      quality: 0.95
    });
    downloadDataUrl(dataUrl, `${layout.slug}.jpg`);
  }, [layout]);

  const exportSvg = useCallback(() => {
    if (!layout) return;
    
    const svg = layoutToSvg(layout, { includeGrid: showGrid });
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    downloadDataUrl(url, `${layout.slug}.svg`);
    URL.revokeObjectURL(url);
  }, [layout, showGrid]);

  function downloadDataUrl(dataUrl: string, filename: string) {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Render entity based on type
  const renderEntity = (entity: Entity, scale: number) => {
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
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="viewer">
        <div className="loading-state">
          <div className="loading-spinner" />
          <p>Loading layout...</p>
        </div>
      </div>
    );
  }

  if (error || !layout) {
    return (
      <div className="viewer">
        <header className="viewer-header">
          <Link to="/" className="back-link">← Back to Gallery</Link>
        </header>
        <div className="empty-state">
          <p>{error || 'Layout not found'}</p>
        </div>
      </div>
    );
  }

  const scale = layout.settings.scale;
  const canvasWidth = layout.settings.pageWidth * scale;
  const canvasHeight = layout.settings.pageHeight * scale;

  // Sort entities for proper layering
  const sortedEntities = [...layout.entities].sort((a, b) => {
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
    <div className="viewer">
      <header className="viewer-header">
        <div className="viewer-title">
          <Link to="/" className="back-link">← Back</Link>
          <h1>{layout.name}</h1>
        </div>
        <div className="export-panel">
          <button 
            className="export-btn" 
            onClick={() => setShowGrid(!showGrid)}
          >
            {showGrid ? 'Hide Grid' : 'Show Grid'}
          </button>
          <button className="export-btn" onClick={exportPng}>
            PNG
          </button>
          <button className="export-btn" onClick={exportJpg}>
            JPG
          </button>
          <button className="export-btn primary" onClick={exportSvg}>
            SVG
          </button>
        </div>
      </header>

      <div ref={containerRef} className="viewer-canvas">
        <Stage
          ref={stageRef}
          width={containerSize.width}
          height={containerSize.height}
          x={position.x}
          y={position.y}
          scaleX={zoom}
          scaleY={zoom}
          draggable
          onDragEnd={handleDragEnd}
          onWheel={handleWheel}
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
          <Layer>
            {sortedEntities.map(entity => renderEntity(entity, scale))}
          </Layer>
        </Stage>

        {/* Zoom controls */}
        <div className="zoom-controls">
          <button className="zoom-btn" onClick={zoomOut}>−</button>
          <span className="zoom-level">{Math.round(zoom * 100)}%</span>
          <button className="zoom-btn" onClick={zoomIn}>+</button>
          <button className="zoom-btn" onClick={resetZoom}>⟲</button>
        </div>
      </div>
    </div>
  );
}

