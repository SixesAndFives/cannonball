import { getFolders, getTracksFromB2 } from '../lib/b2-client.js';


async function main() {
  try {
    console.log('Getting folders...');
    const folders = await getFolders();
    console.log('Found folders:', folders);

    for (const folder of folders) {
      console.log('\n=== Album:', folder, '===');
      const { tracks, coverImage } = await getTracksFromB2(folder);
      console.log('Cover image:', coverImage);
      console.log('Tracks:');
      tracks.forEach(track => {
        console.log(`- ${track.title}`);
        console.log(`  URL: ${track.audio_url}`);
      });
    }
  } catch (error: any) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received');
      console.error('Request:', error.request);
    }
    process.exit(1);
  }
}

main();
