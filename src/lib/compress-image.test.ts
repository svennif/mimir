// @vitest-environment node
// sharp is a native module working on Node Buffers; jsdom's globals only get in the way.
import { describe, expect, test } from 'vitest';
import sharp from 'sharp';
import { compressImage } from './compress-image';

// Random pixels don't compress, so a "photo" of noise is a realistic worst case
// for size, and big enough that re-encoding clearly pays off.
async function noiseImage(width: number, height: number, format: 'png' | 'jpeg', withOrientation?: number) {
  const raw = Buffer.alloc(width * height * 3);
  for (let i = 0; i < raw.length; i++) raw[i] = (i * 7919) % 251; // deterministic, not compressible as runs
  let img = sharp(raw, { raw: { width, height, channels: 3 } });
  if (withOrientation) img = img.withMetadata({ orientation: withOrientation });
  return format === 'png' ? img.png().toBuffer() : img.jpeg({ quality: 95 }).toBuffer();
}

describe('compressImage', () => {
  test('downscales the long edge to 2560 and re-encodes as WebP', async () => {
    const input = await noiseImage(4000, 1000, 'jpeg');
    const out = await compressImage(input, 'image/jpeg');

    expect(out.mimeType).toBe('image/webp');
    expect(out.data.length).toBeLessThan(input.length);
    const meta = await sharp(out.data).metadata();
    expect(meta.format).toBe('webp');
    expect([meta.width, meta.height]).toEqual([2560, 640]); // aspect ratio kept
  });

  test('bakes EXIF orientation into the pixels before stripping metadata', async () => {
    // Orientation 6 = "rotate 90° clockwise to display": stored 300×100, shown 100×300.
    const input = await noiseImage(300, 100, 'jpeg', 6);
    const out = await compressImage(input, 'image/jpeg');

    const meta = await sharp(out.data).metadata();
    expect([meta.width, meta.height]).toEqual([100, 300]);
    expect(meta.orientation).toBeUndefined();
  });

  test('keeps the original when re-encoding would make it bigger', async () => {
    // Already squeezed to quality 1: re-encoding at quality 80 can only add bytes.
    const input = await sharp(await noiseImage(200, 200, 'png')).webp({ quality: 1 }).toBuffer();
    const out = await compressImage(input, 'image/webp');

    expect(out.mimeType).toBe('image/webp');
    expect(out.data).toBe(input);
  });

  test('rejects bytes that only claim to be an image', async () => {
    await expect(compressImage(Buffer.from('<html><script>alert(1)</script>'), 'image/png')).rejects.toThrow();
  });
});
