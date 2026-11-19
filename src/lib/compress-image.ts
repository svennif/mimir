import sharp, { type WebpOptions } from 'sharp';

// The most bytes one image may take up in the database. MAX_UPLOAD_BYTES (8MB)
// limits what the browser may send; this limits what we keep, which is what
// actually fills the disk. A typical photo or screenshot lands at 0.2–1MB after
// the first pass below, so in practice only outliers ever get near this.
export const MAX_STORED_BYTES = 2 * 1024 * 1024;

export class ImageTooLargeError extends Error {}

type Pass = { maxDimension: number; webp: WebpOptions };

// Tried in order; the first result that fits wins.
function passes(mimeType: string): Pass[] {
  return [
    {
      // Long edge, in pixels. The editor column is ~700px wide, so this is well
      // past retina sharpness there, while still being big enough to open on its own.
      maxDimension: 2560,
      // PNGs are mostly screenshots: lossy WebP smears text edges, while
      // near-lossless stays crisp and is still much smaller than PNG.
      // Everything else is mostly photos, where lossy at 80 is visually transparent.
      webp: mimeType === 'image/png' ? { nearLossless: true, quality: 60 } : { quality: 80 },
    },
    {
      // Only for what didn't fit: mostly animated GIFs (every frame costs bytes)
      // and very busy screenshots. Lossy even for screenshots — slightly soft
      // text beats refusing the image.
      maxDimension: 1920,
      webp: { quality: 60 },
    },
  ];
}

/**
 * Re-encodes an upload as WebP: downscaled, EXIF stripped, and at most
 * `maxBytes` long (`maxBytes` is a parameter only so tests can shrink it).
 * Throws ImageTooLargeError if no pass gets it under `maxBytes`, and some other
 * error if `input` isn't a decodable image, whatever its claimed type — so this
 * doubles as content validation.
 */
export async function compressImage(
  input: Buffer,
  mimeType: string,
  maxBytes = MAX_STORED_BYTES,
): Promise<{ data: Buffer; mimeType: string }> {
  for (const pass of passes(mimeType)) {
    // `animated` keeps every frame of a GIF/WebP/AVIF; for a still image it's a no-op.
    const { data } = await sharp(input, { animated: true })
      // Phones store "rotate me" as an EXIF flag rather than rotating the pixels.
      // sharp drops all metadata on output (incl. GPS, a privacy win), so the
      // rotation has to be baked into the pixels first or photos come out sideways.
      .autoOrient()
      .resize({ width: pass.maxDimension, height: pass.maxDimension, fit: 'inside', withoutEnlargement: true })
      .webp(pass.webp)
      .toBuffer({ resolveWithObject: true });

    // An already-optimised small image can come out bigger after re-encoding. It
    // decoded fine above, so it's a real image — keep the original then.
    const smaller = data.length < input.length ? { data, mimeType: 'image/webp' } : { data: input, mimeType };
    if (smaller.data.length <= maxBytes) return smaller;
  }

  throw new ImageTooLargeError(`Image is still over ${Math.round(maxBytes / 1024 / 1024)}MB after compression`);
}
