import { Router } from 'express';
import { exportService } from '../services/exportService.js';
import { layoutService } from '../services/layoutService.js';

export const exportRouter = Router();

// Export a layout to specified formats
exportRouter.post('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const options = req.body;

    const layout = await layoutService.getLayout(slug);
    if (!layout) {
      return res.status(404).json({ error: 'Layout not found' });
    }

    const results = await exportService.exportLayout(layout, options);
    res.json({ success: true, files: results });
  } catch (error) {
    console.error('Error exporting layout:', error);
    res.status(500).json({ error: 'Failed to export layout' });
  }
});

// Get list of exports for a layout
exportRouter.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const exports = await exportService.listExports(slug);
    res.json({ exports });
  } catch (error) {
    console.error('Error listing exports:', error);
    res.status(500).json({ error: 'Failed to list exports' });
  }
});
