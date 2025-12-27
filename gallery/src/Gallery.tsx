import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface LayoutFile {
  slug: string;
  name: string;
  entityCount: number;
  updatedAt: string;
}

export function Gallery() {
  const [layouts, setLayouts] = useState<LayoutFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadLayouts() {
      try {
        // Load manifest of available layouts
        const response = await fetch('./layouts/manifest.json');
        if (!response.ok) {
          throw new Error('Failed to load layouts manifest');
        }
        const manifest = await response.json();
        setLayouts(manifest.layouts || []);
      } catch (err) {
        console.error('Failed to load layouts:', err);
        setError('Failed to load layouts. Make sure the gallery has been built correctly.');
      } finally {
        setLoading(false);
      }
    }

    loadLayouts();
  }, []);

  return (
    <>
      <header className="header">
        <div className="header-title">
          <h1>Floorplan Gallery</h1>
          <span className="header-subtitle">Browse and export layout designs</span>
        </div>
      </header>

      <main>
        {loading && (
          <div className="loading-state">
            <div className="loading-spinner" />
            <p>Loading layouts...</p>
          </div>
        )}

        {error && (
          <div className="empty-state">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && layouts.length === 0 && (
          <div className="empty-state">
            <p>No layouts found. Create some layouts in the editor first!</p>
          </div>
        )}

        {!loading && !error && layouts.length > 0 && (
          <div className="gallery-grid">
            {layouts.map((layout) => (
              <Link 
                key={layout.slug} 
                to={`/view/${layout.slug}`} 
                className="layout-card"
              >
                <div className="card-preview">
                  <span className="no-preview">Click to view</span>
                </div>
                <div className="card-content">
                  <h2>{layout.name}</h2>
                  <p className="card-meta">
                    {layout.entityCount} entities &bull; 
                    Updated {new Date(layout.updatedAt).toLocaleDateString()}
                  </p>
                  <div className="card-actions">
                    <span className="view-btn">View Layout →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <footer>
        <p>Floorplan Gallery &bull; View-only mode</p>
      </footer>
    </>
  );
}

