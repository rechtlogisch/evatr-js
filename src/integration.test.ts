/**
 * Integration tests for the eVatR API wrapper
 */

import { EvatrClient, EvatrUtils, StatusMessages } from './index';

describe('Integration Tests', () => {
  let client: EvatrClient;

  beforeEach(() => {
    client = new EvatrClient();
  });

  describe('Module exports', () => {
    it('should export all main classes and utilities', () => {
      expect(EvatrClient).toBeDefined();
      expect(EvatrUtils).toBeDefined();
      expect(StatusMessages).toBeDefined();
    });

    it('should create client instance', () => {
      expect(client).toBeInstanceOf(EvatrClient);
    });
  });

  describe('VAT-ID validation workflow', () => {
    it('should validate VAT-ID format before API call', () => {
      // Test German VAT-ID
      expect(EvatrClient.checkVatIdSyntax('DE123456789')).toBe(true);
      expect(EvatrClient.checkVatIdSyntax('DE12345678')).toBe(false); // Wrong length

      // Test Austrian VAT-ID
      expect(EvatrClient.checkVatIdSyntax('ATU12345678')).toBe(true);
      expect(EvatrClient.checkVatIdSyntax('AT12345678')).toBe(false); // Missing 'U'

      // Test invalid formats
      expect(EvatrClient.checkVatIdSyntax('INVALID')).toBe(false);
      expect(EvatrClient.checkVatIdSyntax('123456789')).toBe(false);
      expect(EvatrClient.checkVatIdSyntax('')).toBe(false);
    });

    it('should format VAT-IDs consistently', () => {
      const rawVatId = 'de 123 456 789';
      const formatted = EvatrClient.normalizeVatId(rawVatId);

      expect(formatted).toBe('DE123456789');
    });

    it('should validate business rules', () => {
      // German VAT-ID can validate EU VAT-IDs
      expect(EvatrUtils.canValidate('DE123456789', 'ATU12345678')).toBe(true);
      expect(EvatrUtils.canValidate('DE123456789', 'FR12345678901')).toBe(true);

      // Non-German VAT-ID cannot make requests
      expect(EvatrUtils.canValidate('ATU12345678', 'DE123456789')).toBe(false);

      // German VAT-ID can validate (in exceptional cases) another German VAT-ID
      expect(EvatrUtils.canValidate('DE123456789', 'DE987654321')).toBe(true);
    });
  });

  describe('Status message handling', () => {
    it('should load and use status messages', () => {
      const stats = StatusMessages.getStatistics();
      expect(stats.total).toBeGreaterThan(0);
      expect(stats.source).toMatch(/^(file|constants)$/);
    });

    it('should categorize status messages correctly', () => {
      const errorMessages = StatusMessages.getStatusMessagesByCategory('Error');
      const successMessages = StatusMessages.getStatusMessagesByCategory('Result');
      const warningMessages = StatusMessages.getStatusMessagesByCategory('Hint');

      expect(errorMessages.length).toBeGreaterThan(0);
      expect(successMessages.length).toBeGreaterThan(0);
      expect(warningMessages.length).toBeGreaterThan(0);

      // Verify categorization
      errorMessages.forEach((msg) => expect(msg.category).toBe('Error'));
      successMessages.forEach((msg) => expect(msg.category).toBe('Result'));
      warningMessages.forEach((msg) => expect(msg.category).toBe('Hint'));
    });

    it('should provide status checking utilities', () => {
      // Test with known status codes from constants
      expect(StatusMessages.isSuccessStatus('evatr-0000')).toBe(true);
      expect(StatusMessages.isErrorStatus('evatr-0004')).toBe(true);
      expect(StatusMessages.isWarningStatus('evatr-2002')).toBe(true);
    });
  });

  describe('Utility functions integration', () => {
    it('should provide comprehensive country information', () => {
      const supportedCountries = EvatrUtils.getSupportedCountries();
      const countryCodes = EvatrUtils.getSupportedCountryCodes();

      expect(Object.keys(supportedCountries).length).toBeGreaterThan(20);
      expect(countryCodes.length).toBeGreaterThan(20);

      // Test specific countries
      expect(supportedCountries['DE']).toBe('Germany');
      expect(supportedCountries['AT']).toBe('Austria');
      expect(supportedCountries['FR']).toBe('France');

      // Test EU membership
      expect(EvatrUtils.isEUMemberState('DE')).toBe(true);
      expect(EvatrUtils.isEUMemberState('US')).toBe(false);
      expect(EvatrUtils.isEUMemberState('CH')).toBe(false);
    });

    it('should validate VAT-IDs for different countries', () => {
      // Test various country formats
      expect(EvatrUtils.checkVatIdSyntaxForCountry('DE123456789', 'DE')).toBe(true);
      expect(EvatrUtils.checkVatIdSyntaxForCountry('ATU12345678', 'AT')).toBe(true);
      expect(EvatrUtils.checkVatIdSyntaxForCountry('FR12345678901', 'FR')).toBe(true);
      expect(EvatrUtils.checkVatIdSyntaxForCountry('NL123456789B01', 'NL')).toBe(true);

      // Test invalid formats
      expect(EvatrUtils.checkVatIdSyntaxForCountry('AT12345678', 'AT')).toBe(false);
    });

    it('should provide test data for development', () => {
      const testIds = EvatrUtils.getTestVatIds();

      expect(testIds).toHaveProperty('DE');
      expect(testIds).toHaveProperty('AT');

      // Validate test IDs
      Object.entries(testIds).forEach(([country, vatId]) => {
        expect(EvatrUtils.checkVatIdSyntaxForCountry(vatId, country)).toBe(true);
      });
    });
  });

  describe('Error handling integration', () => {
    it('should handle invalid VAT-ID formats gracefully', async () => {
      await expect(
        client.validateSimple({
          vatIdOwn: 'INVALID',
          vatIdForeign: 'ATU12345678',
        })
      ).rejects.toThrow();
    });

    it('should handle missing required fields', async () => {
      await expect(
        client.validateSimple({
          vatIdOwn: '',
          vatIdForeign: 'ATU12345678',
        })
      ).rejects.toThrow('Both vatIdOwn and vatIdForeign are required');
    });
  });

  describe('Configuration and customization', () => {
    it('should accept custom configuration', () => {
      const customClient = new EvatrClient({
        timeout: 5000,
        headers: { 'Custom-Header': 'test' },
      });

      expect(customClient).toBeInstanceOf(EvatrClient);
    });

    it('should allow status message cache management', () => {
      const initialStats = StatusMessages.getStatistics();

      // Clear cache
      StatusMessages.clearCache();

      // Should still work after cache clear
      const newStats = StatusMessages.getStatistics();
      expect(newStats.total).toBe(initialStats.total);
    });
  });
});
