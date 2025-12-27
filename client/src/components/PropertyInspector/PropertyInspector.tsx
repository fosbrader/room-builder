import { useState, useEffect } from 'react';
import { useLayoutStore } from '../../store/layoutStore';
import { Entity, Wall, FloorObject, Door, Window, TextLabel } from '../../types/schema';
import { formatDimension, parseDimension } from '../../utils/units';
import './PropertyInspector.css';

export function PropertyInspector() {
  const layout = useLayoutStore((state) => state.layout);
  const selectedIds = useLayoutStore((state) => state.selectedIds);
  const updateEntity = useLayoutStore((state) => state.updateEntity);
  const deleteSelected = useLayoutStore((state) => state.deleteSelected);
  
  const selectedEntities = layout?.entities.filter(e => selectedIds.includes(e.id)) ?? [];
  const selectedEntity = selectedEntities.length === 1 ? selectedEntities[0] : null;
  
  if (!layout) {
    return (
      <div className="property-inspector panel">
        <div className="panel-title">Properties</div>
        <p className="empty-text">No layout open</p>
      </div>
    );
  }
  
  if (selectedEntities.length === 0) {
    return (
      <div className="property-inspector panel">
        <div className="panel-title">Properties</div>
        <LayoutProperties />
      </div>
    );
  }
  
  if (selectedEntities.length > 1) {
    return (
      <div className="property-inspector panel">
        <div className="panel-title">Properties</div>
        <p className="selection-info">{selectedEntities.length} objects selected</p>
        <button className="delete-button" onClick={deleteSelected}>
          Delete Selected
        </button>
      </div>
    );
  }
  
  return (
    <div className="property-inspector panel">
      <div className="panel-title">Properties</div>
      <EntityProperties entity={selectedEntity!} />
    </div>
  );
}

function LayoutProperties() {
  const layout = useLayoutStore((state) => state.layout);
  const updateSettings = useLayoutStore((state) => state.updateSettings);
  
  if (!layout) return null;
  
  const { settings } = layout;
  
  return (
    <div className="property-section">
      <div className="section-title">Layout Settings</div>
      
      <div className="property-row">
        <label>Units</label>
        <select
          value={settings.units}
          onChange={(e) => updateSettings({ units: e.target.value as 'ft-in' | 'meters' })}
        >
          <option value="ft-in">Feet & Inches</option>
          <option value="meters">Meters</option>
        </select>
      </div>
      
      <div className="property-row">
        <label>Grid Size</label>
        <select
          value={settings.gridSize}
          onChange={(e) => updateSettings({ gridSize: Number(e.target.value) })}
        >
          <option value="3">3"</option>
          <option value="6">6"</option>
          <option value="12">1'</option>
          <option value="24">2'</option>
        </select>
      </div>
      
      <div className="property-row">
        <label>Page Width</label>
        <input
          type="number"
          value={Math.round(settings.pageWidth / 12)}
          onChange={(e) => updateSettings({ pageWidth: Number(e.target.value) * 12 })}
          min={10}
          max={100}
        />
        <span className="unit-label">ft</span>
      </div>
      
      <div className="property-row">
        <label>Page Height</label>
        <input
          type="number"
          value={Math.round(settings.pageHeight / 12)}
          onChange={(e) => updateSettings({ pageHeight: Number(e.target.value) * 12 })}
          min={10}
          max={100}
        />
        <span className="unit-label">ft</span>
      </div>
    </div>
  );
}

interface EntityPropertiesProps {
  entity: Entity;
}

function EntityProperties({ entity }: EntityPropertiesProps) {
  const updateEntity = useLayoutStore((state) => state.updateEntity);
  const deleteSelected = useLayoutStore((state) => state.deleteSelected);
  const layout = useLayoutStore((state) => state.layout);
  
  const units = layout?.settings.units || 'ft-in';
  
  const handleUpdate = (updates: Partial<Entity>) => {
    updateEntity(entity.id, updates);
  };
  
  return (
    <div className="entity-properties">
      <div className="entity-type">{entity.type.toUpperCase()}</div>
      
      {/* Common properties */}
      <div className="property-section">
        <div className="section-title">Position</div>
        <div className="property-row">
          <label>X</label>
          <input
            type="number"
            value={Math.round(entity.x)}
            onChange={(e) => handleUpdate({ x: Number(e.target.value) })}
          />
        </div>
        <div className="property-row">
          <label>Y</label>
          <input
            type="number"
            value={Math.round(entity.y)}
            onChange={(e) => handleUpdate({ y: Number(e.target.value) })}
          />
        </div>
        <div className="property-row">
          <label>Rotation</label>
          <input
            type="number"
            value={entity.rotation || 0}
            onChange={(e) => handleUpdate({ rotation: Number(e.target.value) })}
            min={0}
            max={360}
          />
          <span className="unit-label">°</span>
        </div>
      </div>
      
      {/* Type-specific properties */}
      {entity.type === 'wall' && <WallProperties entity={entity as Wall} />}
      {entity.type === 'object' && <ObjectProperties entity={entity as FloorObject} />}
      {entity.type === 'door' && <DoorProperties entity={entity as Door} />}
      {entity.type === 'window' && <WindowProperties entity={entity as Window} />}
      {entity.type === 'text' && <TextProperties entity={entity as TextLabel} />}
      
      {/* Label */}
      <div className="property-section">
        <div className="section-title">Label</div>
        <div className="property-row">
          <input
            type="text"
            value={entity.label || ''}
            onChange={(e) => handleUpdate({ label: e.target.value })}
            placeholder="Add label..."
            className="full-width"
          />
        </div>
      </div>
      
      {/* Delete button */}
      <button className="delete-button" onClick={deleteSelected}>
        Delete
      </button>
    </div>
  );
}

function WallProperties({ entity }: { entity: Wall }) {
  const updateEntity = useLayoutStore((state) => state.updateEntity);
  
  return (
    <div className="property-section">
      <div className="section-title">Wall</div>
      <div className="property-row">
        <label>Thickness</label>
        <input
          type="number"
          value={entity.thickness}
          onChange={(e) => updateEntity(entity.id, { thickness: Number(e.target.value) })}
          min={1}
          max={24}
        />
        <span className="unit-label">"</span>
      </div>
      <div className="property-row">
        <label>Points</label>
        <span className="value-display">{entity.points.length}</span>
      </div>
    </div>
  );
}

function ObjectProperties({ entity }: { entity: FloorObject }) {
  const updateEntity = useLayoutStore((state) => state.updateEntity);
  
  return (
    <div className="property-section">
      <div className="section-title">Dimensions</div>
      <div className="property-row">
        <label>Width</label>
        <input
          type="number"
          value={entity.width}
          onChange={(e) => updateEntity(entity.id, { width: Number(e.target.value) })}
          min={1}
        />
        <span className="unit-label">"</span>
      </div>
      <div className="property-row">
        <label>Height</label>
        <input
          type="number"
          value={entity.height}
          onChange={(e) => updateEntity(entity.id, { height: Number(e.target.value) })}
          min={1}
        />
        <span className="unit-label">"</span>
      </div>
      <div className="property-row">
        <label>Type</label>
        <select
          value={entity.objectType}
          onChange={(e) => updateEntity(entity.id, { objectType: e.target.value as any })}
        >
          <option value="desk">Desk</option>
          <option value="chair">Chair</option>
          <option value="shelf">Shelf</option>
          <option value="rack">Rack</option>
          <option value="rect">Rectangle</option>
        </select>
      </div>
    </div>
  );
}

function DoorProperties({ entity }: { entity: Door }) {
  const updateEntity = useLayoutStore((state) => state.updateEntity);
  
  return (
    <div className="property-section">
      <div className="section-title">Door</div>
      <div className="property-row">
        <label>Width</label>
        <input
          type="number"
          value={entity.width}
          onChange={(e) => updateEntity(entity.id, { width: Number(e.target.value) })}
          min={24}
          max={72}
        />
        <span className="unit-label">"</span>
      </div>
      <div className="property-row">
        <label>Swing</label>
        <select
          value={entity.swingDirection}
          onChange={(e) => updateEntity(entity.id, { swingDirection: e.target.value as any })}
        >
          <option value="inward">Inward</option>
          <option value="outward">Outward</option>
        </select>
      </div>
      <div className="property-row">
        <label>Hinge</label>
        <select
          value={entity.hingeSide}
          onChange={(e) => updateEntity(entity.id, { hingeSide: e.target.value as any })}
        >
          <option value="left">Left</option>
          <option value="right">Right</option>
        </select>
      </div>
      <div className="property-row">
        <label>Open Angle</label>
        <input
          type="number"
          value={entity.openAngle}
          onChange={(e) => updateEntity(entity.id, { openAngle: Number(e.target.value) })}
          min={0}
          max={180}
        />
        <span className="unit-label">°</span>
      </div>
    </div>
  );
}

function WindowProperties({ entity }: { entity: Window }) {
  const updateEntity = useLayoutStore((state) => state.updateEntity);
  
  return (
    <div className="property-section">
      <div className="section-title">Window</div>
      <div className="property-row">
        <label>Width</label>
        <input
          type="number"
          value={entity.width}
          onChange={(e) => updateEntity(entity.id, { width: Number(e.target.value) })}
          min={12}
          max={120}
        />
        <span className="unit-label">"</span>
      </div>
      <div className="property-row">
        <label>Sill Height</label>
        <input
          type="number"
          value={entity.sillHeight || 36}
          onChange={(e) => updateEntity(entity.id, { sillHeight: Number(e.target.value) })}
          min={0}
          max={60}
        />
        <span className="unit-label">"</span>
      </div>
    </div>
  );
}

function TextProperties({ entity }: { entity: TextLabel }) {
  const updateEntity = useLayoutStore((state) => state.updateEntity);
  
  return (
    <div className="property-section">
      <div className="section-title">Text</div>
      <div className="property-row">
        <label>Content</label>
        <input
          type="text"
          value={entity.text}
          onChange={(e) => updateEntity(entity.id, { text: e.target.value })}
          className="full-width"
        />
      </div>
      <div className="property-row">
        <label>Font Size</label>
        <input
          type="number"
          value={entity.fontSize}
          onChange={(e) => updateEntity(entity.id, { fontSize: Number(e.target.value) })}
          min={8}
          max={72}
        />
        <span className="unit-label">px</span>
      </div>
    </div>
  );
}
