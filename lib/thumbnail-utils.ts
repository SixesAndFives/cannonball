export async function generateVideoThumbnail(videoFile: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    console.log('Created video element for thumbnail generation');

    // Clean up function
    const cleanup = () => {
      URL.revokeObjectURL(video.src);
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('error', onError);
    };

    // Error handler
    const onError = () => {
      console.error('Error loading video for thumbnail');
      cleanup();
      reject(new Error('Failed to load video'));
    };

    // Handle seek completion
    const onSeeked = () => {
      try {
        console.log(`Video seeked to 1s, dimensions: ${video.videoWidth}x${video.videoHeight}`);
        
        // Set canvas size to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw the current frame
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert to JPEG data URL with 0.7 quality
        const thumbnail = canvas.toDataURL('image/jpeg', 0.7);
        console.log(`Generated thumbnail, size: ${thumbnail.length} bytes`);
        
        cleanup();
        resolve(thumbnail);
      } catch (error) {
        console.error('Error generating thumbnail:', error);
        cleanup();
        reject(error);
      }
    };

    // Handle video ready to play
    const onCanPlay = () => {
      console.log('Video ready to play, seeking to 1s...');
      video.currentTime = 1.0; // Seek to 1 second
    };

    // Set up video element
    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('seeked', onSeeked);
    video.addEventListener('error', onError);
    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;
    video.src = URL.createObjectURL(videoFile);
  });
}

export function dataURLtoFile(dataUrl: string, filename: string): File {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
}
