import assert from 'node:assert/strict'
import { test } from 'node:test'
import { resetCopiedPhoneIdentity } from '../src/host/phone.js'

const ours = () => ({
  identity: { deviceId: 'd-1', publicKey: 'public', privateKey: 'private' },
  accessToken: 'token',
  devices: [{ deviceId: 'phone-1' }],
  on: true,
  server: 'wss://relay.example/v1/link',
})

test('an imported copy of the source identity is replaced by this home', () => {
  const data = ours()
  assert.equal(resetCopiedPhoneIdentity(data, { identity: { deviceId: 'd-1' } }), true)
  assert.equal(data.identity, undefined)
  assert.equal(data.accessToken, undefined)
  assert.deepEqual(data.devices, [])
  assert.equal(data.on, false)
  // Everything else the user chose stays.
  assert.equal(data.server, 'wss://relay.example/v1/link')
})

test('a different identity, or a source without one, is left alone', () => {
  const different = ours()
  assert.equal(resetCopiedPhoneIdentity(different, { identity: { deviceId: 'd-2' } }), false)
  assert.ok(different.identity)
  assert.equal(different.on, true)

  const noSource = ours()
  assert.equal(resetCopiedPhoneIdentity(noSource, {}), false)
  assert.ok(noSource.identity)

  const noIdentity = {}
  assert.equal(resetCopiedPhoneIdentity(noIdentity, { identity: { deviceId: 'd-1' } }), false)
})
