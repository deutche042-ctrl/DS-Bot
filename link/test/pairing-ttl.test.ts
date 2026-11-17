import assert from 'node:assert/strict'
import { test } from 'node:test'
import { DeviceRegistry } from '../src/index.ts'

// The QR code on the computer is valid for five minutes. A test at the boundary,
// with an injected clock, keeps the limit from drifting or disappearing.
test('a pairing code is good for five minutes and then admits nobody', () => {
  let now = 1_000_000
  const registry = new DeviceRegistry([], undefined, () => now)
  const { code, expiresAt } = registry.openPairing()
  assert.equal(expiresAt - now, 5 * 60_000)
  assert.equal(registry.pairingOpen(), true)

  now = expiresAt - 1
  assert.equal(registry.authorize('phone', 'key', { name: 'Tablet', pairingCode: code }), true)
  assert.equal(registry.list().length, 1)
  // A code works once.
  assert.equal(registry.authorize('other', 'key2', { pairingCode: code }), false)
})

test('an expired code admits nobody, even with the right text', () => {
  let now = 2_000_000
  const registry = new DeviceRegistry([], undefined, () => now)
  const { code, expiresAt } = registry.openPairing()
  now = expiresAt
  // Ask authorization first: pairingOpen() clears the expired code, and would hide a
  // missing expiry check inside authorize().
  assert.equal(registry.authorize('phone', 'key', { pairingCode: code }), false)
  assert.equal(registry.pairingOpen(), false)
  assert.equal(registry.list().length, 0)
})

test('five wrong codes close the open pairing', () => {
  const registry = new DeviceRegistry()
  registry.openPairing()
  for (let attempt = 0; attempt < 5; attempt += 1) {
    // The first four misses leave the code open; only the fifth closes it.
    if (attempt < 4) assert.equal(registry.pairingOpen(), true)
    assert.equal(registry.authorize('phone', 'key', { pairingCode: 'wrong' }), false)
  }
  assert.equal(registry.pairingOpen(), false)
})
