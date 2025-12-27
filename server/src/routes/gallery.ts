import { Router } from 'express';
import { galleryService } from '../services/galleryService.js';

export const galleryRouter = Router();

// Build the gallery
galleryRouter.post('/build', async (_req, res) => {
  try {
    await galleryService.buildGallery();
    res.json({ success: true, message: 'Gallery built successfully' });
  } catch (error) {
    console.error('Error building gallery:', error);
    res.status(500).json({ error: 'Failed to build gallery' });
  }
});

// Get gallery index
galleryRouter.get('/index', async (_req, res) => {
  try {
    const index = await galleryService.getGalleryIndex();
    res.json(index);
  } catch (error) {
    console.error('Error getting gallery index:', error);
    res.status(500).json({ error: 'Failed to get gallery index' });
  }
});
