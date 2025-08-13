/**
 * evatr-api
 *
 * Checks a VAT-ID using the eVatR REST-API of the German Federal Central Tax Office (Bundeszentralamt für Steuern, BZSt)
 *
 * @author Krzysztof Tomasz Zembrowski <open-source@rechtlogisch.de>
 */
export { EvatrClient } from './client';
export type { EvatrApiError, EvatrClientConfig, Availability, ExtendedResponse, QualifiedRequest, Response, SimpleRequest, StatusMessage, } from './types';
export { STATUS_MESSAGES, QUALIFIED_RESULT_CODES } from './constants';
export { EvatrUtils } from './utils';
export { EvatrApiUpdater } from './api-updater';
export { StatusMessages } from './status-loader';
export { EvatrMigrationHelper } from './migration-helper';
//# sourceMappingURL=index.d.ts.map