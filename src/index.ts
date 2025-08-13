/**
 * evatr-api
 *
 * Checks a VAT-ID using the eVatR REST-API of the German Federal Central Tax Office (Bundeszentralamt für Steuern, BZSt)
 *
 * @author Krzysztof Tomasz Zembrowski <open-source@rechtlogisch.de>
 */

// Export main client
export { EvatrClient } from './client';

// Export types and interfaces
export type {
  EvatrApiError,
  EvatrClientConfig,
  EUMemberState,
  ExtendedResponse,
  QualifiedRequest,
  Response,
  SimpleRequest,
  StatusMessage,
} from './types';

// Export constants
export { STATUS_MESSAGES, QUALIFIED_RESULT_CODES } from './constants';

// Export utilities
export { EvatrUtils } from './utils';
export { EvatrApiUpdater } from './api-updater';
export { StatusMessages } from './status-loader';

// Export migration helper for backward compatibility
export { EvatrMigrationHelper } from './migration-helper';
