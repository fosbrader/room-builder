import { Router } from 'express';
import { layoutService } from '../services/layoutService.js';

export const layoutsRouter = Router();

// List all layouts
layoutsRouter.get('/', async (_req, res) => {
  try {
    const layouts = await layoutService.listLayouts();
    res.json({ layouts });
  } catch (error) {
    console.error('Error listing layouts:', error);
    res.status(500).json({ error: 'Failed to list layouts' });
  }
});

// Get presets
layoutsRouter.get('/presets', async (_req, res) => {
  try {
    const presets = await layoutService.getPresets();
    res.json(presets);
  } catch (error) {
    console.error('Error getting presets:', error);
    res.status(500).json({ error: 'Failed to get presets' });
  }
});

// Save presets
layoutsRouter.post('/presets', async (req, res) => {
  try {
    await layoutService.savePresets(req.body);
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving presets:', error);
    res.status(500).json({ error: 'Failed to save presets' });
  }
});

// Get a specific layout
layoutsRouter.get('/:slug', async (req, res) => {
  try {
    const layout = await layoutService.getLayout(req.params.slug);
    if (!layout) {
      return res.status(404).json({ error: 'Layout not found' });
    }
    res.json(layout);
  } catch (error) {
    console.error('Error getting layout:', error);
    res.status(500).json({ error: 'Failed to get layout' });
  }
});

// Save a layout
layoutsRouter.post('/:slug', async (req, res) => {
  try {
    const { autoSave } = req.query;
    await layoutService.saveLayout(req.params.slug, req.body, autoSave === 'true');
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving layout:', error);
    res.status(500).json({ error: 'Failed to save layout' });
  }
});

// Delete a layout
layoutsRouter.delete('/:slug', async (req, res) => {
  try {
    await layoutService.deleteLayout(req.params.slug);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting layout:', error);
    res.status(500).json({ error: 'Failed to delete layout' });
  }
});
