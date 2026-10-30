/* global localStorage, sessionStorage */
import assert from 'node:assert/strict';
import {test, beforeEach} from 'node:test';
import {MemoryStorage} from './helpers.mjs';
const {emptySettings, loadModelSettings, rememberModel} = await import('../../src/studio/storage.ts');
const language = {baseUrl: 'https://language.invalid/v1', apiKey: 'language-only', model: 'llm'};
const tts = {baseUrl: 'https://speech.invalid/v1', apiKey: 'tts-only', model: 'speech', voice: 'warm', speed: 1.2};
beforeEach(() => {
  globalThis.localStorage = new MemoryStorage();
  globalThis.sessionStorage = new MemoryStorage();
});

test('new language and TTS settings are independent objects with no credentials', () => {
  const a = emptySettings();
  a.language.apiKey = 'changed';
  assert.equal(a.tts.apiKey, '');
  assert.equal(emptySettings().language.apiKey, '');
  assert.equal(a.tts.speed, 1);
});
test('session-only language settings do not overwrite remembered TTS settings', () => {
  rememberModel('tts', tts, true);
  rememberModel('language', language, false);
  assert.equal(localStorage.getItem('studio-config-language'), null);
  assert.equal(sessionStorage.getItem('studio-config-tts'), null);
  assert.deepEqual(loadModelSettings(), {language, tts});
});
test('switching persistence removes the prior copy in either direction', () => {
  rememberModel('language', language, true);
  rememberModel('language', {...language, apiKey: 'session'}, false);
  assert.equal(localStorage.getItem('studio-config-language'), null);
  assert.equal(loadModelSettings().language.apiKey, 'session');
  rememberModel('language', {...language, apiKey: 'remembered'}, true);
  assert.equal(sessionStorage.getItem('studio-config-language'), null);
  assert.equal(loadModelSettings().language.apiKey, 'remembered');
});
test('session storage wins when an older local copy remains', () => {
  localStorage.setItem('studio-config-language', JSON.stringify(language));
  sessionStorage.setItem('studio-config-language', JSON.stringify({...language, apiKey: 'session'}));
  assert.equal(loadModelSettings().language.apiKey, 'session');
});
test('malformed language configuration does not block valid TTS restoration', () => {
  localStorage.setItem('studio-config-language', '{broken');
  rememberModel('tts', tts, true);
  assert.deepEqual(loadModelSettings(), {language: emptySettings().language, tts});
});
test('unexpected property types and out-of-range speed fall back safely', () => {
  sessionStorage.setItem('studio-config-tts', JSON.stringify({baseUrl: 1, apiKey: [], model: {}, voice: false, speed: 9, code: 'unexpected'}));
  assert.deepEqual(loadModelSettings(), emptySettings());
});
test('unavailable browser storage does not prevent opening the editor', () => {
  globalThis.sessionStorage = {getItem() { throw new Error('blocked'); }};
  assert.deepEqual(loadModelSettings(), emptySettings());
});
test('failed settings writes surface an error instead of claiming success', () => {
  globalThis.localStorage = {...localStorage, removeItem() {}, setItem() { throw new Error('quota'); }};
  assert.throws(() => rememberModel('language', language, true), /quota/);
});
