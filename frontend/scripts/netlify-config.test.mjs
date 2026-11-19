import test from 'node:test';
import assert from 'node:assert/strict';
import { redirectRules } from './netlify-config.mjs';
test('API proxy precedes SPA fallback', () => {
 assert.equal(redirectRules('https://cuidados-api.onrender.com/'), '/api/* https://cuidados-api.onrender.com/api/:splat 200\n/* /index.html 200\n');
});
test('rejects absent, insecure, credentialed and malformed backend addresses', () => {
 for(const value of ['',undefined,'http://example.com','https://user:secret@example.com','https://example.com/api','https://example.com/?token=secret','https://example.com/#fragment']) assert.throws(()=>redirectRules(value));
});
