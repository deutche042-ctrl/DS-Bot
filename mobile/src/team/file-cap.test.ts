import assert from 'node:assert/strict'
import { test } from 'node:test'
import { fileRouteOf } from './file-cap.ts'

test('a web-linked file saves from the web, a host file over the chat endpoints', () => {
  assert.equal(fileRouteOf({ url: 'https://example.com/report.pdf' }), 'url')
  assert.equal(fileRouteOf({ url: '' }), 'host')
  assert.equal(fileRouteOf({}), 'host')
})
