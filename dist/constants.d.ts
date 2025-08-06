/**
 * Constants and status messages for the eVatR API
 */
import { StatusMessage } from './types';
/**
 * Default API base URL
 */
export declare const DEFAULT_HOST = "https://api.evatr.vies.bzst.de";
export declare const DEFAULT_BASE_URL: string;
/**
 * API endpoints
 */
export declare const ENDPOINTS: {
    readonly VALIDATION: string;
    readonly STATUS_MESSAGES: string;
    readonly EU_MEMBER_STATES: string;
};
/**
 * VAT-ID syntax validation rules
 */
export declare const VATID_PATTERNS: Record<string, RegExp>;
/**
 * Status messages from the eVatR API
 */
export declare const STATUS_MESSAGES: Record<string, StatusMessage>;
/**
 * Qualified result codes explanations
 */
export declare const QUALIFIED_RESULT_CODES: {
    readonly A: "Die Angaben stimmen mit den registrierten Daten überein.";
    readonly B: "Die Angaben stimmen mit den registrierten Daten nicht überein.";
    readonly C: "Die Angaben wurden nicht angefragt.";
    readonly D: "Die Angaben wurden vom EU-Mitgliedsstaat nicht mitgeteilt.";
};
/**
 * Country code to country name mapping for EU member states
 */
export declare const EU_MEMBER_STATES: Record<string, string>;
//# sourceMappingURL=constants.d.ts.map