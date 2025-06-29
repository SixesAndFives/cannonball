export async function generateVideoThumbnail(videoFile: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Clean up function
    const cleanup = () => {
      URL.revokeObjectURL(video.src);
      video.removeEventListener('loadeddata', onLoad);
      video.removeEventListener('error', onError);
    };

    // Error handler
    const onError = () => {
      cleanup();
      reject(new Error('Failed to load video'));
    };

    // Load handler
    const onLoad = () => {
      try {
        // Set canvas size to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw the first frame
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert to JPEG data URL with 0.7 quality
        const thumbnail = canvas.toDataURL('image/jpeg', 0.7);
        cleanup();
        resolve(thumbnail);
      } catch (error) {
        cleanup();
        reject(error);
      }
    };

    // Set up video element
    video.addEventListener('loadeddata', onLoad);
    video.addEventListener('error', onError);
    video.preload = 'auto';
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
