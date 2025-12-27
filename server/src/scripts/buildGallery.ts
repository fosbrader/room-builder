import { galleryService } from '../services/galleryService.js';

async function main() {
  console.log('Building gallery...');
  
  try {
    await galleryService.buildGallery();
    console.log('Gallery built successfully!');
    console.log('Output directory: /docs');
    console.log('- index.html');
    console.log('- index.json');
    console.log('- gallery.css');
    console.log('- gallery.js');
    console.log('- previews/');
  } catch (error) {
    console.error('Failed to build gallery:', error);
    process.exit(1);
  }
}

main();
