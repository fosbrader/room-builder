import { useLayoutStore } from '../../store/layoutStore';
import { ToolMode } from '../../types/schema';
import './Toolbar.css';

interface ToolButton {
  mode: ToolMode;
  icon: string;
  label: string;
  shortcut: string;
}

const tools: ToolButton[] = [
  { mode: 'select', icon: '↖', label: 'Select', shortcut: 'V' },
  { mode: 'wall', icon: '▭', label: 'Wall', shortcut: 'W' },
  { mode: 'door', icon: '🚪', label: 'Door', shortcut: 'D' },
  { mode: 'window', icon: '▢', label: 'Window', shortcut: 'N' },
  { mode: 'object', icon: '▣', label: 'Object', shortcut: 'O' },
  { mode: 'measure', icon: '📏', label: 'Measure', shortcut: 'M' },
  { mode: 'text', icon: 'T', label: 'Text', shortcut: 'T' },
];

export function Toolbar() {
  const toolMode = useLayoutStore((state) => state.toolMode);
  const setToolMode = useLayoutStore((state) => state.setToolMode);
  const showGrid = useLayoutStore((state) => state.showGrid);
  const toggleGrid = useLayoutStore((state) => state.toggleGrid);
  const layout = useLayoutStore((state) => state.layout);
  const updateSettings = useLayoutStore((state) => state.updateSettings);
  
  const handleToolClick = (mode: ToolMode) => {
    setToolMode(mode);
  };
  
  return (
    <div className="toolbar">
      <div className="toolbar-section">
        <div className="toolbar-title">Tools</div>
        {tools.map((tool) => (
          <button
            key={tool.mode}
            className={`tool-button ${toolMode === tool.mode ? 'active' : ''}`}
            onClick={() => handleToolClick(tool.mode)}
            title={`${tool.label} (${tool.shortcut})`}
          >
            <span className="tool-icon">{tool.icon}</span>
            <span className="tool-label">{tool.label}</span>
          </button>
        ))}
      </div>
      
      <div className="toolbar-section">
        <div className="toolbar-title">View</div>
        <button
          className={`tool-button ${showGrid ? 'active' : ''}`}
          onClick={toggleGrid}
          title="Toggle Grid (G)"
        >
          <span className="tool-icon">#</span>
          <span className="tool-label">Grid</span>
        </button>
      </div>
      
      {layout && (
        <div className="toolbar-section">
          <div className="toolbar-title">Snap</div>
          <button
            className={`tool-button small ${layout.settings.snapToGrid ? 'active' : ''}`}
            onClick={() => updateSettings({ snapToGrid: !layout.settings.snapToGrid })}
            title="Snap to Grid"
          >
            Grid
          </button>
          <button
            className={`tool-button small ${layout.settings.snapToWalls ? 'active' : ''}`}
            onClick={() => updateSettings({ snapToWalls: !layout.settings.snapToWalls })}
            title="Snap to Walls"
          >
            Walls
          </button>
          <button
            className={`tool-button small ${layout.settings.snapToObjects ? 'active' : ''}`}
            onClick={() => updateSettings({ snapToObjects: !layout.settings.snapToObjects })}
            title="Snap to Objects"
          >
            Objects
          </button>
        </div>
      )}
      
      <div className="toolbar-help">
        <div className="help-item">
          <kbd>Space</kbd> Pan
        </div>
        <div className="help-item">
          <kbd>Scroll</kbd> Zoom
        </div>
        <div className="help-item">
          <kbd>⌘Z</kbd> Undo
        </div>
        <div className="help-item">
          <kbd>Del</kbd> Delete
        </div>
      </div>
    </div>
  );
}
