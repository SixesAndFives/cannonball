import { config } from 'dotenv';
config(); // Load environment variables from .env file

import { listFiles } from '../lib/b2-client';

async function listAllFiles() {
  try {
    const response = await listFiles('Images/');
    console.log('Total files:', response.files.length);
    console.log('\nFiles:');
    response.files.forEach(file => {
      console.log(`${file.fileName} (${file.contentLength} bytes)`);
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

listAllFiles();
