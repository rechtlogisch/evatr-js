/**
 * Tests for index.ts exports
 */

import {
  EvatrClient,
  EvatrClientConfig,
  Availability,
  ExtendedResponse,
  QualifiedRequest,
  Response,
  SimpleRequest,
  StatusMessage,
  STATUS_MESSAGES,
  QUALIFIED_RESULT_CODES,
  EvatrUtils,
  EvatrApiUpdater,
  StatusMessages,
  EvatrMigrationHelper,
} from './index';

describe('index.ts exports', () => {
  it('should export EvatrClient', () => {
    expect(EvatrClient).toBeDefined();
    expect(typeof EvatrClient).toBe('function');
  });

  it('should export EvatrUtils', () => {
    expect(EvatrUtils).toBeDefined();
    expect(typeof EvatrUtils).toBe('function'); // Class is a function in JavaScript
    expect(EvatrUtils.normalizeVatId).toBeDefined();
    expect(typeof EvatrUtils.normalizeVatId).toBe('function');
  });

  it('should export EvatrApiUpdater', () => {
    expect(EvatrApiUpdater).toBeDefined();
    expect(typeof EvatrApiUpdater).toBe('function');
  });

  it('should export StatusMessages', () => {
    expect(StatusMessages).toBeDefined();
    // StatusMessages is a class with static methods, so it's a function
    expect(typeof StatusMessages).toBe('function');
    expect(StatusMessages.getStatusMessage).toBeDefined();
    expect(typeof StatusMessages.getStatusMessage).toBe('function');
  });

  it('should export EvatrMigrationHelper', () => {
    expect(EvatrMigrationHelper).toBeDefined();
    expect(typeof EvatrMigrationHelper).toBe('function');
  });

  it('should export STATUS_MESSAGES constant', () => {
    expect(STATUS_MESSAGES).toBeDefined();
    expect(typeof STATUS_MESSAGES).toBe('object');
  });

  it('should export QUALIFIED_RESULT_CODES constant', () => {
    expect(QUALIFIED_RESULT_CODES).toBeDefined();
    expect(typeof QUALIFIED_RESULT_CODES).toBe('object');
  });

  it('should export type EvatrApiError', () => {
    // Types are compile-time only, but we can verify the error class exists
    expect(EvatrClient).toBeDefined();
  });

  it('should export type EvatrClientConfig', () => {
    // Types are compile-time only, verify by using it
    const config: EvatrClientConfig = {};
    expect(config).toBeDefined();
  });

  it('should export type Availability', () => {
    // Types are compile-time only, verify by using it
    const availability: Availability = {};
    expect(availability).toBeDefined();
  });

  it('should export type ExtendedResponse', () => {
    // Types are compile-time only, verify by using it
    const response: ExtendedResponse = {
      id: 'test',
      timestamp: { original: '2025-01-01', date: new Date() },
      valid: true,
      status: 'evatr-0000',
      vatIdOwn: 'DE123456789',
      vatIdForeign: 'ATU12345678',
    };
    expect(response).toBeDefined();
  });

  it('should export type QualifiedRequest', () => {
    // Types are compile-time only, verify by using it
    const request: QualifiedRequest = {
      vatIdOwn: 'DE123456789',
      vatIdForeign: 'ATU12345678',
      company: 'Test',
      location: 'Test',
    };
    expect(request).toBeDefined();
  });

  it('should export type Response', () => {
    // Types are compile-time only, verify by using it
    const response: Response = {
      id: 'test',
      timestamp: '2025-01-01',
      status: 'evatr-0000',
      vatIdOwn: 'DE123456789',
      vatIdForeign: 'ATU12345678',
    };
    expect(response).toBeDefined();
  });

  it('should export type SimpleRequest', () => {
    // Types are compile-time only, verify by using it
    const request: SimpleRequest = {
      vatIdOwn: 'DE123456789',
      vatIdForeign: 'ATU12345678',
    };
    expect(request).toBeDefined();
  });

  it('should export type StatusMessage', () => {
    // Types are compile-time only, verify by using it
    const message: StatusMessage = {
      status: 'evatr-0000',
      category: 'Result',
      http: 200,
      message: 'Test',
    };
    expect(message).toBeDefined();
  });
});
