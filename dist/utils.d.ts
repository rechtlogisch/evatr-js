/**
 * Utility functions for the eVatR API wrapper
 */
import { QualifiedResultCode } from './types';
/**
 * Utility class with helper functions for eVatR operations
 */
export declare class EvatrUtils {
    static normalizeVatId(vatId: string): string;
    /**
     * Validate VAT-ID format for a specific country
     * @param vatId VAT-ID to validate
     * @param countryCode Optional country code, if not provided it will be extracted from VAT-ID
     * @returns boolean
     */
    static checkVatIdSyntaxForCountry(vatId: string, countryCode?: string): boolean;
    /**
     * Get country name from country code
     * @param countryCode Two-letter country code
     * @returns string Country name or 'Unknown' if not found
     */
    static getCountryName(countryCode: string): string;
    /**
     * Check if a country code is a valid EU member state
     * @param countryCode Two-letter country code
     * @returns boolean
     */
    static isEUMemberState(countryCode: string): boolean;
    /**
     * Get all supported EU country codes
     * @returns string[] Array of country codes
     */
    static getSupportedCountryCodes(): string[];
    /**
     * Get all supported EU countries with their codes
     * @returns Record<string, string> Object mapping country codes to names
     */
    static getSupportedCountries(): Record<string, string>;
    /**
     * Parse and explain validation result
     * @param result Validation result code (A, B, C, D)
     * @returns string Human-readable explanation
     */
    static explainQualifiedResultCode(result: QualifiedResultCode): string;
    /**
     * Extract numeric part from VAT-ID
     * @param vatId VAT-ID
     * @returns string Numeric part of the VAT-ID
     */
    static getVatIdNumber(vatId: string): string;
    /**
     * Check if VAT-ID appears to be German
     * @param vatId VAT-ID to check
     * @returns boolean
     */
    static isGermanVatId(vatId: string): boolean;
    /**
     * Generate test VAT-IDs for different countries (for testing purposes)
     * @returns Record<string, string> Object mapping country codes to test VAT-IDs
     */
    static getTestVatIds(): Record<string, string>;
    /**
     * Validate that a German VAT-ID can request validation for another VAT-ID
     * @param vatIdOwn German VAT-ID making the request
     * @param vatIdForeign VAT-ID being validated
     * @returns boolean
     */
    static canValidate(vatIdOwn: string, vatIdForeign: string): boolean;
    /**
     * Calculate check digit for German VAT-ID (for validation purposes)
     * @param vatIdNumber Numeric part of German VAT-ID (without DE prefix)
     * @returns number Check digit
     * @TODO fix
     */
    static calculateGermanVatIdCheckDigit(vatIdNumber: string): number;
}
//# sourceMappingURL=utils.d.ts.map