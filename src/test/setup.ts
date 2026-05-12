import '@testing-library/jest-dom';
// MSW server wiring is available in src/mocks/server.ts for Vitest / integration tests.
// Jest v30 + jsdom has ESM-interop issues with MSW v2; unit tests use jest.mock() instead.
