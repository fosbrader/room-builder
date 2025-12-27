(async function() {
  const gallery = document.getElementById('gallery');
  
  try {
    const response = await fetch('index.json');
    const data = await response.json();
    
    if (data.layouts.length === 0) {
      gallery.innerHTML = '<p class="empty-state">No layouts found. Create some layouts in the editor!</p>';
      return;
    }
    
    gallery.innerHTML = data.layouts.map(layout => `
      <article class="layout-card">
        <div class="preview-container">
          ${layout.preview 
            ? `<img src="${layout.preview}" alt="${layout.name} preview">`
            : '<span class="no-preview">No preview available</span>'
          }
        </div>
        <div class="card-content">
          <h2>${layout.name}</h2>
          <p class="card-meta">
            ${layout.entityCount} entities &bull; 
            Updated ${new Date(layout.updatedAt).toLocaleDateString()}
          </p>
          <div class="exports-list">
            ${layout.exports.map(exp => `
              <a href="../exports/${layout.slug}/${exp}" class="export-link" download>
                ${exp.split('.').pop().toUpperCase()}
              </a>
            `).join('')}
          </div>
        </div>
      </article>
    `).join('');
  } catch (error) {
    gallery.innerHTML = '<p class="empty-state">No gallery data yet. Run "npm run build:gallery" to generate previews.</p>';
    console.log('Gallery not yet built:', error);
  }
})();
