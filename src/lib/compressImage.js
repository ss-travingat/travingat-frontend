import imageCompression from 'browser-image-compression';

export async function compressImage(file) {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 2000,
    useWebWorker: true,
    fileType: 'image/webp',
    initialQuality: 0.88,
    onProgress: (progress) => {
      console.log(`Compression progress: ${progress}%`);
    },
  };

  try {
    const compressed = await imageCompression(file, options);
    console.log(
      `Compressed: ${(file.size / 1024 / 1024).toFixed(2)}MB -> ${(compressed.size / 1024 / 1024).toFixed(2)}MB`
    );
    return compressed;
  } catch (err) {
    console.error('Compression failed, using original:', err);
    return file;
  }
}
