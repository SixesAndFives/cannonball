import { listFiles } from '../lib/b2-client';

async function test() {
  try {
    const files = await listFiles('Bighorn Studios/');
    console.log('Files found:', files);
  } catch (error) {
    console.error('Error:', error);
  }
}

test();
