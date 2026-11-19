// Shared by the upload route (which enforces these) and the editor (which checks
// them first, so a too-big paste fails fast instead of uploading for nothing).

// The proxy buffers request bodies up to 10MB and silently truncates anything
// longer (experimental.proxyClientMaxBodySize). 8MB leaves headroom for the
// multipart framing around the file, so a body we accept is never cut short.
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

// An allowlist rather than `image/*`: SVG is an image type too, but it can carry
// <script>, and we serve uploads from our own origin.
export const ALLOWED_IMAGE_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'image/avif',
]);
