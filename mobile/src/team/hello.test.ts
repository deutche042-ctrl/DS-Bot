import assert from 'node:assert/strict'
import { test } from 'node:test'
import { helloProblem } from './hello.ts'

const PHONE = 1

test('a shared protocol version is no problem', () => {
  assert.equal(helloProblem(1, 3, PHONE), null)
})

test('a computer ahead of this app asks for a newer app on the phone', () => {
  assert.equal(helloProblem(null, 2, PHONE), 'update-phone')
})

test('a computer behind this app asks for a newer computer build', () => {
  assert.equal(helloProblem(null, 1, PHONE), 'update-host')
  assert.equal(helloProblem(null, 0, PHONE), 'update-host')
})

test('a handshake answer without apiMax reads as an older computer, never as a broken link', () => {
  assert.equal(helloProblem(null, undefined, PHONE), 'update-host')
  assert.equal(helloProblem(null, null, PHONE), 'update-host')
})
