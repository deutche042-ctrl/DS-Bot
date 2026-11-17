// The handshake answer names a protocol version both sides share, or null when they
// share none. Which side is behind follows from apiMax alone: a computer that speaks a
// newer protocol asks for a newer app here; anything else means the computer is older.
export type HelloProblem = 'update-phone' | 'update-host'

export function helloProblem(api: number | null, apiMax: number | null | undefined, phoneApi: number): HelloProblem | null {
  if (api !== null) return null
  return typeof apiMax === 'number' && apiMax > phoneApi ? 'update-phone' : 'update-host'
}
