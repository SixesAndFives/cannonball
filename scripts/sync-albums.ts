import { syncAlbums } from '../lib/b2-client.js';

async function main() {
  try {
    console.log('Starting album sync...');
    await syncAlbums();
    console.log('Album sync completed successfully');
  } catch (error) {
    console.error('Error during sync:', error);
    process.exit(1);
  }
}

main();
