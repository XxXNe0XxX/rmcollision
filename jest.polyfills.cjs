/**
 * Web API polyfills for MSW v2 + jest-environment-jsdom.
 *
 * jest-environment-jsdom's VM context does not expose all Node.js built-ins as
 * globals. We seed each one before undici (and therefore MSW) loads so that
 * @mswjs/interceptors can initialise without "X is not defined" errors.
 */

const { TextDecoder, TextEncoder } = require('node:util');
const { ReadableStream, TransformStream } = require('node:stream/web');
const { MessageChannel, MessagePort }     = require('node:worker_threads');
const { performance }                      = require('node:perf_hooks');
const { Blob }                             = require('node:buffer');

Object.defineProperties(globalThis, {
  TextDecoder:     { writable: true, enumerable: true, configurable: true, value: TextDecoder },
  TextEncoder:     { writable: true, enumerable: true, configurable: true, value: TextEncoder },
  ReadableStream:  { writable: true, enumerable: true, configurable: true, value: ReadableStream },
  TransformStream: { writable: true, enumerable: true, configurable: true, value: TransformStream },
  MessageChannel:  { writable: true, enumerable: true, configurable: true, value: MessageChannel },
  MessagePort:     { writable: true, enumerable: true, configurable: true, value: MessagePort },
  performance:     { writable: true, enumerable: true, configurable: true, value: performance },
  Blob:            { writable: true, enumerable: true, configurable: true, value: Blob },
});

const { fetch, Headers, Request, Response, FormData } = require('undici');

Object.defineProperties(globalThis, {
  fetch:    { writable: true, enumerable: true, configurable: true, value: fetch },
  Headers:  { writable: true, enumerable: true, configurable: true, value: Headers },
  Request:  { writable: true, enumerable: true, configurable: true, value: Request },
  Response: { writable: true, enumerable: true, configurable: true, value: Response },
  FormData: { writable: true, enumerable: true, configurable: true, value: FormData },
});
