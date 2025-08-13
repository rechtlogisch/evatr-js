"use strict";
/**
 * Utility functions for the eVatR API wrapper
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvatrUtils = void 0;
const constants_1 = require("./constants");
/**
 * Utility class with helper functions for eVatR operations
 */
class EvatrUtils {
    static normalizeVatId(vatId) {
        return vatId.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    }
    /**
     * Validate VAT-ID format for a specific country
     * @param vatId VAT-ID to validate
     * @param countryCode Optional country code, if not provided it will be extracted from VAT-ID
     * @returns boolean
     */
    static checkVatIdSyntaxForCountry(vatId, countryCode) {
        const cleanVatId = this.normalizeVatId(vatId);
        const country = countryCode || cleanVatId.substring(0, 2);
        const pattern = constants_1.VATID_PATTERNS[country];
        if (!pattern) {
            return false;
        }
        return pattern.test(cleanVatId);
    }
    /**
     * Get country name from country code
     * @param countryCode Two-letter country code
     * @returns string Country name or 'Unknown' if not found
     */
    static getCountryName(countryCode) {
        return constants_1.EU_MEMBER_STATES[countryCode.toUpperCase()] || 'Unknown';
    }
    /**
     * Check if a country code is a valid EU member state
     * @param countryCode Two-letter country code
     * @returns boolean
     */
    static isEUMemberState(countryCode) {
        return countryCode.toUpperCase() in constants_1.EU_MEMBER_STATES;
    }
    /**
     * Get all supported EU country codes
     * @returns string[] Array of country codes
     */
    static getSupportedCountryCodes() {
        return Object.keys(constants_1.EU_MEMBER_STATES);
    }
    /**
     * Get all supported EU countries with their codes
     * @returns Record<string, string> Object mapping country codes to names
     */
    static getSupportedCountries() {
        return { ...constants_1.EU_MEMBER_STATES };
    }
    /**
     * Parse and explain validation result
     * @param result Validation result code (A, B, C, D)
     * @returns string Human-readable explanation
     */
    static explainQualifiedResultCode(result) {
        return constants_1.QUALIFIED_RESULT_CODES[result] || 'Unknown validation result';
    }
    /**
     * Extract numeric part from VAT-ID
     * @param vatId VAT-ID
     * @returns string Numeric part of the VAT-ID
     */
    static getVatIdNumber(vatId) {
        const cleanVatId = this.normalizeVatId(vatId);
        return cleanVatId.substring(2).replace(/[A-Z]/g, '');
    }
    /**
     * Check if VAT-ID appears to be German
     * @param vatId VAT-ID to check
     * @returns boolean
     */
    static isGermanVatId(vatId) {
        const cleanVatId = this.normalizeVatId(vatId);
        return cleanVatId.startsWith('DE') && this.checkVatIdSyntaxForCountry(cleanVatId, 'DE');
    }
    /**
     * Generate test VAT-IDs for different countries (for testing purposes)
     * @returns Record<string, string> Object mapping country codes to test VAT-IDs
     */
    static getTestVatIds() {
        return {
            DE: 'DE123456789',
            AT: 'ATU12345678',
        };
    }
    /**
     * Validate that a German VAT-ID can request validation for another VAT-ID
     * @param vatIdOwn German VAT-ID making the request
     * @param vatIdForeign VAT-ID being validated
     * @returns boolean
     */
    static canValidate(vatIdOwn, vatIdForeign) {
        // Own VAT-ID must be German
        if (!this.isGermanVatId(vatIdOwn)) {
            return false;
        }
        // Target VAT-ID must be from an EU member state
        const foreignCountry = this.normalizeVatId(vatIdForeign).substring(0, 2);
        return this.isEUMemberState(foreignCountry);
    }
    /**
     * Calculate check digit for German VAT-ID (for validation purposes)
     * @param vatIdNumber Numeric part of German VAT-ID (without DE prefix)
     * @returns number Check digit
     */
    static calculateGermanVatIdCheckDigit(vatIdNumber) {
        if (vatIdNumber.length !== 9) {
            throw new Error('German VAT-ID number must contain exactly 9 digits after letters DE');
        }
        const digits = vatIdNumber.split('').map(Number);
        let product = 10;
        for (let i = 0; i < 8; i++) {
            const sum = (digits[i] + product) % 10;
            product = (2 * (sum === 0 ? 10 : sum)) % 11;
        }
        let checkDigit = 11 - product;
        if (checkDigit === 10) {
            checkDigit = 0;
        }
        return checkDigit;
    }
}
exports.EvatrUtils = EvatrUtils;
//# sourceMappingURL=utils.js.map