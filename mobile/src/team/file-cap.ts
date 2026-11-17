// A file the chat hands over as a web link saves from the web, not over the chat's
// own file endpoints. Host files travel in chunks and are not held to hello.maxFileBytes,
// which limits one whole-file answer (mobile.js file-read); a 5 MiB card saves as ten
// 512 KiB chunks.
export const fileRouteOf = (file: { url?: string }): 'url' | 'host' =>
  typeof file.url === 'string' && file.url !== '' ? 'url' : 'host'
