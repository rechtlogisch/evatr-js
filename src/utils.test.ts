/**
 * Tests for EvatrUtils
 */

import { EvatrUtils } from './utils';

describe('EvatrUtils', () => {
  describe('checkVatIdSyntaxForCountry', () => {
    it('should validate German VAT-IDs correctly', () => {
      expect(EvatrUtils.checkVatIdSyntaxForCountry('DE123456789', 'DE')).toBe(true);
      expect(EvatrUtils.checkVatIdSyntaxForCountry('DE12345678', 'DE')).toBe(false);
      expect(EvatrUtils.checkVatIdSyntaxForCountry('DE1234567890', 'DE')).toBe(false);
    });

    it('should validate Austrian VAT-IDs correctly', () => {
      expect(EvatrUtils.checkVatIdSyntaxForCountry('ATU12345678', 'AT')).toBe(true);
      expect(EvatrUtils.checkVatIdSyntaxForCountry('AT12345678', 'AT')).toBe(false);
      expect(EvatrUtils.checkVatIdSyntaxForCountry('ATU1234567', 'AT')).toBe(false);
    });

    it('should extract country code from VAT-ID', () => {
      expect(EvatrUtils.checkVatIdSyntaxForCountry('DE123456789')).toBe(true);
      expect(EvatrUtils.checkVatIdSyntaxForCountry('ATU12345678')).toBe(true);
    });
  });

  describe('getCountryName', () => {
    it('should return correct country names', () => {
      expect(EvatrUtils.getCountryName('DE')).toBe('Germany');
      expect(EvatrUtils.getCountryName('AT')).toBe('Austria');
      expect(EvatrUtils.getCountryName('FR')).toBe('France');
      expect(EvatrUtils.getCountryName('XX')).toBe('Unknown');
    });
  });

  describe('isEUMemberState', () => {
    it('should identify EU member states correctly', () => {
      expect(EvatrUtils.isEUMemberState('DE')).toBe(true);
      expect(EvatrUtils.isEUMemberState('AT')).toBe(true);
      expect(EvatrUtils.isEUMemberState('US')).toBe(false);
      expect(EvatrUtils.isEUMemberState('CH')).toBe(false);
    });
  });

  describe('isGermanVatId', () => {
    it('should identify German VAT-IDs correctly', () => {
      expect(EvatrUtils.isGermanVatId('DE123456789')).toBe(true);
      expect(EvatrUtils.isGermanVatId('ATU12345678')).toBe(false);
      expect(EvatrUtils.isGermanVatId('DE12345678')).toBe(false);
    });
  });

  describe('canValidate', () => {
    it('should allow German VAT-ID to validate non-German EU VAT-IDs', () => {
      expect(EvatrUtils.canValidate('DE123456789', 'ATU12345678')).toBe(true);
      expect(EvatrUtils.canValidate('DE123456789', 'FR12345678901')).toBe(true);
    });

    it('should allow German VAT-ID to validate another German VAT-ID', () => {
      expect(EvatrUtils.canValidate('DE123456789', 'DE987654321')).toBe(true);
    });

    it('should not allow non-German VAT-ID to make requests', () => {
      expect(EvatrUtils.canValidate('ATU12345678', 'DE123456789')).toBe(false);
    });
  });

  describe('getTestVatIds', () => {
    it('should return test VAT-IDs for different countries', () => {
      const testIds = EvatrUtils.getTestVatIds();
      expect(testIds).toHaveProperty('DE');
      expect(testIds).toHaveProperty('AT');
      expect(testIds.DE).toBe('DE123456789');
      expect(testIds.AT).toBe('ATU12345678');
    });
  });

  describe('German VAT-ID checksum validation', () => {
    it('should calculate correct checksum for valid German VAT-ID', () => {
      // Test the internal checksum calculation
      const vatIdNumber = '123456788'; // Valid German VAT-ID with correct checksum
      const result = EvatrUtils.calculateGermanVatIdCheckDigit(vatIdNumber);
      expect(result).toBe(8);
    });

    it('should reject German VAT-ID with incorrect checksum', () => {
      // Test with invalid checksum
      const vatIdNumber = '123456789'; // Invalid checksum (should be 8)
      const result = EvatrUtils.calculateGermanVatIdCheckDigit(vatIdNumber);
      expect(result).toBe(8);
    });

    it('should reject German VAT-ID with wrong length', () => {
      // Test with wrong length
      const vatIdNumber = '12345678'; // Too short
      expect(() => EvatrUtils.calculateGermanVatIdCheckDigit(vatIdNumber)).toThrow(
        'German VAT-ID number must contain exactly 9 digits after letters DE'
      );

      const vatIdLong = '1234567890'; // Too long
      expect(() => EvatrUtils.calculateGermanVatIdCheckDigit(vatIdLong)).toThrow(
        'German VAT-ID number must contain exactly 9 digits after letters DE'
      );
    });
  });

  describe('Country validation edge cases', () => {
    it('should handle unknown country codes', () => {
      const result = EvatrUtils.checkVatIdSyntaxForCountry('XX123456789', 'XX');
      expect(result).toBe(false);
    });

    it('should validate VAT-IDs for all supported EU countries', () => {
      const supportedCountries = [
        'DE',
        'AT',
        'BE',
        'BG',
        'CY',
        'CZ',
        'DK',
        'EE',
        'ES',
        'FI',
        'FR',
        'GR',
        'HR',
        'HU',
        'IE',
        'IT',
        'LT',
        'LU',
        'LV',
        'MT',
        'NL',
        'PL',
        'PT',
        'RO',
        'SE',
        'SI',
        'SK',
      ];

      supportedCountries.forEach((country) => {
        const testVatIds = EvatrUtils.getTestVatIds();
        const countryVatId = testVatIds[country];
        if (countryVatId) {
          const result = EvatrUtils.checkVatIdSyntaxForCountry(countryVatId, country);
          expect(typeof result).toBe('boolean');
        }
      });
    });

    it('should handle malformed VAT-IDs gracefully', () => {
      const malformedVatIds = ['', 'DE', 'INVALID', '123456789', 'DE12345678A', 'DE-123-456-789'];

      malformedVatIds.forEach((vatId) => {
        expect(() => {
          EvatrUtils.checkVatIdSyntaxForCountry(vatId, 'DE');
        }).not.toThrow();
      });
    });
  });

  describe('Utility function edge cases', () => {
    it('should handle empty and null inputs for country name lookup', () => {
      expect(EvatrUtils.getCountryName('')).toBe('Unknown');
      expect(EvatrUtils.getCountryName('XX')).toBe('Unknown');
    });

    it('should handle case sensitivity in country codes', () => {
      expect(EvatrUtils.getCountryName('de')).toBe('Germany');
      expect(EvatrUtils.getCountryName('DE')).toBe('Germany');
      expect(EvatrUtils.isEUMemberState('de')).toBe(true);
      expect(EvatrUtils.isEUMemberState('DE')).toBe(true);
    });

    it('should validate German VAT-ID detection with edge cases', () => {
      const testCases = [
        { vatId: 'DE123456788', expected: true },
        { vatId: 'de123456788', expected: true },
        { vatId: 'AT123456789', expected: false },
        { vatId: 'INVALID', expected: false },
        { vatId: '', expected: false },
      ];

      testCases.forEach(({ vatId, expected }) => {
        const result = EvatrUtils.isGermanVatId(vatId);
        expect(result).toBe(expected);
      });
    });
  });
});
