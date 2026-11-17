import { Directory, File, FileMode, Paths } from 'expo-file-system'
import { fileChunks } from '../../../ds-bot/src/shared/file-chunks.js'

// Mime types a web-linked file shares as, by extension; anything else shares as a
// plain binary the receiving app still opens.
const URL_MIMES: Record<string, string> = {
  pdf: 'application/pdf', txt: 'text/plain', md: 'text/markdown', csv: 'text/csv',
  zip: 'application/zip', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', json: 'application/json',
}
const mimeOfName = (name: string): string => URL_MIMES[(name.split('.').pop() ?? '').toLowerCase()] ?? 'application/octet-stream'

// Host files travel in chunks, so `hello.maxFileBytes` (the limit of one whole-file
// answer) does not apply here: a 5 MiB file is ten chunks, not one oversized message.
export async function downloadFile(call: (endpoint: string, payload: object) => Promise<unknown>, target: object) {
  const dir = new Directory(Paths.cache, 'downloads', `${Date.now()}-${Math.random().toString(36).slice(2)}`)
  dir.create({ intermediates: true })
  let file: File | undefined
  let handle: ReturnType<File['open']> | undefined
  let saved: { uri: string; name: string; mime: string; size: number } | undefined
  try {
    for await (const part of fileChunks(call, target)) {
      if (file === undefined) {
        const name = String(part.name || 'file').replace(/[\\/\u0000-\u001f]/g, '_')
        file = new File(dir, name === '.' || name === '..' ? 'file' : name)
        file.create()
        handle = file.open(FileMode.Truncate)
        saved = { uri: file.uri, name: file.name, mime: part.mime || 'application/octet-stream', size: part.size }
      }
      await handle!.writeBytes(part.data)
    }
    return saved!
  } catch (error) {
    handle?.close()
    handle = undefined
    dir.delete()
    throw error
  } finally { handle?.close() }
}

// A file the chat hands over as a web link saves from the web into the same cache
// folder the chat's own files land in, then shares the same way.
export async function downloadUrlFile(url: string, name: string): Promise<{ uri: string; name: string; mime: string; size: number }> {
  const dir = new Directory(Paths.cache, 'downloads', `url-${Date.now()}-${Math.random().toString(36).slice(2)}`)
  dir.create({ intermediates: true })
  const safe = String(name || 'file').replace(/[\\/\u0000-\u001f]/g, '_')
  const file = new File(dir, safe === '.' || safe === '..' ? 'file' : safe)
  try {
    const saved = await File.downloadFileAsync(url, file)
    return { uri: saved.uri, name: saved.name, mime: mimeOfName(safe), size: saved.size }
  } catch (error) {
    // A failed transfer can leave a partial file behind; its folder would stay in the
    // cache for good, so drop it before the error goes on.
    dir.delete()
    throw error
  }
}
