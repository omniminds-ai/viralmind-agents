import sharp from 'sharp';

export async function resizeImage(imagePath: string): Promise<Buffer> {
  const image = sharp(imagePath);
  const metadata = await image.metadata();
  
  if (!metadata.width || !metadata.height) {
    throw new Error('Could not get image dimensions');
  }

  const currentPixels = metadata.width * metadata.height;
  let maxPixels = 6000 * 28 * 28;

  if (currentPixels > maxPixels) {
    maxPixels = 2700 * 28 * 28;
  } else {
    maxPixels = 1340 * 28 * 28;
  }

  const resizeFactor = Math.sqrt(maxPixels / currentPixels);
  const width = Math.floor(metadata.width * resizeFactor);
  const height = Math.floor(metadata.height * resizeFactor);

  return image
    .resize(width, height, {
      fit: 'fill'
    })
    .jpeg()
    .toBuffer();
}
