import { useEffect } from 'react';
import { useLayoutStore } from '../../store/layoutStore';
import { PresetObject } from '../../types/schema';
import './Library.css';

export function Library() {
  const presets = useLayoutStore((state) => state.presets);
  const loadPresets = useLayoutStore((state) => state.loadPresets);
  const startPlacingObject = useLayoutStore((state) => state.startPlacingObject);
  const placingObject = useLayoutStore((state) => state.placingObject);
  const layout = useLayoutStore((state) => state.layout);
  
  useEffect(() => {
    loadPresets();
  }, [loadPresets]);
  
  const handlePresetClick = (preset: PresetObject) => {
    startPlacingObject(preset);
  };
  
  if (!layout) {
    return (
      <div className="library panel">
        <div className="panel-title">Library</div>
        <p className="empty-text">Open a layout to access the library</p>
      </div>
    );
  }
  
  if (!presets) {
    return (
      <div className="library panel">
        <div className="panel-title">Library</div>
        <p className="empty-text">Loading presets...</p>
      </div>
    );
  }
  
  const categories = [
    { key: 'desks', label: 'Desks', items: presets.presets.desks },
    { key: 'chairs', label: 'Chairs', items: presets.presets.chairs },
    { key: 'shelves', label: 'Shelves', items: presets.presets.shelves },
    { key: 'racks', label: 'Server Racks', items: presets.presets.racks },
    { key: 'custom', label: 'Custom', items: presets.presets.custom },
  ];
  
  return (
    <div className="library panel">
      <div className="panel-title">Library</div>
      
      {placingObject && (
        <div className="placing-indicator">
          Click on canvas to place: <strong>{placingObject.name}</strong>
        </div>
      )}
      
      {categories.map(category => (
        category.items.length > 0 && (
          <div key={category.key} className="library-category">
            <div className="category-title">{category.label}</div>
            <div className="preset-grid">
              {category.items.map((preset, index) => (
                <button
                  key={index}
                  className={`preset-button ${placingObject === preset ? 'active' : ''}`}
                  onClick={() => handlePresetClick(preset)}
                  title={`${preset.width}" × ${preset.height}"`}
                >
                  <div className="preset-icon">
                    {getPresetIcon(preset.objectType)}
                  </div>
                  <div className="preset-name">{preset.name}</div>
                  <div className="preset-size">
                    {preset.width}" × {preset.height}"
                  </div>
                </button>
              ))}
            </div>
          </div>
        )
      ))}
      
      <div className="library-footer">
        <p className="hint">Click to select, then click on canvas to place</p>
      </div>
    </div>
  );
}

function getPresetIcon(objectType: string): string {
  switch (objectType) {
    case 'desk': return '🖥️';
    case 'chair': return '🪑';
    case 'shelf': return '📚';
    case 'rack': return '🖲️';
    default: return '▢';
  }
}
