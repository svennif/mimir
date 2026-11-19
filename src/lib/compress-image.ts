import sharp from 'sharp';

// Long edge, in pixels. The editor column is ~700px wide, so this is well past
// retina sharpness there, while still being big enough to open on its own.
const MAX_DIMENSION = 2560;

/**
 * Re-encodes an upload as WebP: downscaled to MAX_DIMENSION, EXIF stripped.
 * Throws if `input` isn't a decodable image, whatever its claimed type, so this
 * doubles as content validation.
 */
export async function compressImage(input: Buffer, mimeType: string): Promise<{ data: Buffer; mimeType: string }> {
  // `animated` keeps every frame of a GIF/WebP/AVIF; for a still image it's a no-op.
  const { data } = await sharp(input, { animated: true })
    // Phones store "rotate me" as an EXIF flag rather than rotating the pixels.
    // sharp drops all metadata on output (incl. GPS, a privacy win), so the
    // rotation has to be baked into the pixels first or photos come out sideways.
    .autoOrient()
    .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: 'inside', withoutEnlargement: true })
    .webp(
      // PNGs are mostly screenshots: lossy WebP smears text edges, while
      // near-lossless stays crisp and is still much smaller than PNG.
      // Everything else is mostly photos, where lossy at 80 is visually transparent.
      mimeType === 'image/png' ? { nearLossless: true, quality: 60 } : { quality: 80 },
    )
    .toBuffer({ resolveWithObject: true });

  // An already-optimised small image can come out bigger after re-encoding. It
  // decoded fine above, so it's a real image — keep the original then.
  if (data.length >= input.length) return { data: input, mimeType };

  return { data, mimeType: 'image/webp' };
}
