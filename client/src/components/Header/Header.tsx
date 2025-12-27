import { useState } from 'react';
import { useLayoutStore } from '../../store/layoutStore';
import * as api from '../../utils/api';
import './Header.css';

export function Header() {
  const [showNewModal, setShowNewModal] = useState(false);
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSaveAsModal, setShowSaveAsModal] = useState(false);
  const [newLayoutName, setNewLayoutName] = useState('');
  const [saveAsName, setSaveAsName] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  
  const layout = useLayoutStore((state) => state.layout);
  const layouts = useLayoutStore((state) => state.layouts);
  const isDirty = useLayoutStore((state) => state.isDirty);
  const newLayout = useLayoutStore((state) => state.newLayout);
  const loadLayout = useLayoutStore((state) => state.loadLayout);
  const saveLayout = useLayoutStore((state) => state.saveLayout);
  const saveLayoutAs = useLayoutStore((state) => state.saveLayoutAs);
  const loadLayouts = useLayoutStore((state) => state.loadLayouts);
  
  const handleNew = () => {
    if (newLayoutName.trim()) {
      newLayout(newLayoutName.trim());
      setNewLayoutName('');
      setShowNewModal(false);
    }
  };
  
  const handleOpen = (slug: string) => {
    loadLayout(slug);
    setShowOpenModal(false);
  };
  
  const handleSave = () => {
    if (layout) {
      saveLayout();
    }
  };
  
  const handleSaveAs = () => {
    if (saveAsName.trim()) {
      saveLayoutAs(saveAsName.trim());
      setSaveAsName('');
      setShowSaveAsModal(false);
    }
  };
  
  const handleExport = async (formats: string[]) => {
    if (!layout) return;
    
    setIsExporting(true);
    try {
      await api.exportLayout(layout.slug, {
        formats: formats as any,
        includeGrid: true,
        includeDimensions: true,
        paperSize: layout.settings.pageSize,
        orientation: 'landscape',
        scaleLabel: '1/4" = 1\'',
        dpi: 150,
      });
      alert('Export complete! Files saved to /exports/' + layout.slug);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. See console for details.');
    } finally {
      setIsExporting(false);
      setShowExportModal(false);
    }
  };
  
  const handleBuildGallery = async () => {
    try {
      await api.buildGallery();
      alert('Gallery built successfully! Check /docs folder.');
    } catch (error) {
      console.error('Gallery build failed:', error);
      alert('Gallery build failed. See console for details.');
    }
  };
  
  return (
    <header className="header">
      <div className="header-left">
        <h1 className="logo">Floorplan Builder</h1>
        {layout && (
          <span className="layout-name">
            {layout.name}
            {isDirty && <span className="dirty-indicator">*</span>}
          </span>
        )}
      </div>
      
      <div className="header-actions">
        <button onClick={() => setShowNewModal(true)}>New</button>
        <button onClick={() => { loadLayouts(); setShowOpenModal(true); }}>Open</button>
        <button onClick={handleSave} disabled={!layout}>Save</button>
        <button onClick={() => { setSaveAsName(layout?.name || ''); setShowSaveAsModal(true); }} disabled={!layout}>
          Save As
        </button>
        <button onClick={() => setShowExportModal(true)} disabled={!layout}>Export</button>
        <button onClick={handleBuildGallery}>Build Gallery</button>
      </div>
      
      {/* New Layout Modal */}
      {showNewModal && (
        <div className="modal-overlay" onClick={() => setShowNewModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>New Layout</h2>
            <input
              type="text"
              placeholder="Layout name"
              value={newLayoutName}
              onChange={e => setNewLayoutName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleNew()}
              autoFocus
            />
            <div className="modal-actions">
              <button onClick={() => setShowNewModal(false)}>Cancel</button>
              <button onClick={handleNew} disabled={!newLayoutName.trim()}>Create</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Open Layout Modal */}
      {showOpenModal && (
        <div className="modal-overlay" onClick={() => setShowOpenModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Open Layout</h2>
            {layouts.length === 0 ? (
              <p className="empty-message">No saved layouts found.</p>
            ) : (
              <ul className="layout-list">
                {layouts.map(l => (
                  <li key={l.slug} onClick={() => handleOpen(l.slug)}>
                    <span className="layout-list-name">{l.name}</span>
                    <span className="layout-list-meta">
                      {l.entityCount} entities · {new Date(l.updatedAt).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <div className="modal-actions">
              <button onClick={() => setShowOpenModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Save As Modal */}
      {showSaveAsModal && (
        <div className="modal-overlay" onClick={() => setShowSaveAsModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Save As</h2>
            <input
              type="text"
              placeholder="New layout name"
              value={saveAsName}
              onChange={e => setSaveAsName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSaveAs()}
              autoFocus
            />
            <div className="modal-actions">
              <button onClick={() => setShowSaveAsModal(false)}>Cancel</button>
              <button onClick={handleSaveAs} disabled={!saveAsName.trim()}>Save</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Export Modal */}
      {showExportModal && (
        <div className="modal-overlay" onClick={() => setShowExportModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Export Layout</h2>
            <p>Select export formats:</p>
            <div className="export-options">
              <button 
                onClick={() => handleExport(['png'])} 
                disabled={isExporting}
              >
                PNG
              </button>
              <button 
                onClick={() => handleExport(['svg'])} 
                disabled={isExporting}
              >
                SVG
              </button>
              <button 
                onClick={() => handleExport(['pdf'])} 
                disabled={isExporting}
              >
                PDF
              </button>
              <button 
                onClick={() => handleExport(['png', 'svg', 'pdf'])} 
                disabled={isExporting}
              >
                All
              </button>
            </div>
            {isExporting && <p className="exporting-message">Exporting...</p>}
            <div className="modal-actions">
              <button onClick={() => setShowExportModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
