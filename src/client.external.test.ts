/**
 * External tests for EvatrClient - hitting real API endpoints
 * These tests require network access and hit the actual eVatR API
 */

import { EvatrClient } from './client';
import { StatusMessage, EUMemberState } from './types';

describe('EvatrClient External Tests', () => {
  let client: EvatrClient;

  beforeAll(() => {
    // Create client with longer timeout for external requests
    client = new EvatrClient({
      timeout: 60000, // 60 seconds for external API calls
    });
  });

  describe('validateSimple - External API', () => {
    it('should perform simple validation against real API with valid German VAT-ID', async () => {
      // Using a known test VAT-ID format that should be syntactically valid
      const result = await client.validateSimple({
        vatIdOwn: 'DE123456789', // Test German VAT-ID
        vatIdForeign: 'ATU12345678', // Test Austrian VAT-ID
      });

      expect(result).toBeDefined();
      expect(result.timestamp).toBeDefined();
      expect(result.status).toBeDefined();
      expect(typeof result.status).toBe('string');
      expect(result.status).toMatch(/^evatr-\d{4}$/); // Status format: evatr-XXXX
      
      // Should have timestamp in ISO format
      expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    }, 30000);

    it('should handle invalid VAT-ID format in external API call', async () => {
      await expect(
        client.validateSimple({
          vatIdOwn: 'INVALID_FORMAT',
          vatIdForeign: 'ATU12345678',
        })
      ).rejects.toThrow();
    }, 30000);

    it('should handle missing required fields in external API call', async () => {
      await expect(
        client.validateSimple({
          vatIdOwn: '',
          vatIdForeign: 'ATU12345678',
        })
      ).rejects.toThrow('Both vatIdOwn and vatIdForeign are required');
    }, 30000);

    it('should normalize VAT-IDs before sending to external API', async () => {
      // Test with spaces and lowercase - should be normalized
      const result = await client.validateSimple({
        vatIdOwn: 'de 123 456 789',
        vatIdForeign: 'atu 123 456 78',
      });

      expect(result).toBeDefined();
      expect(result.status).toBeDefined();
    }, 30000);
  });

  describe('validateQualified - External API', () => {
    it('should perform qualified validation against real API', async () => {
      const result = await client.validateQualified({
        vatIdOwn: 'DE123456789',
        vatIdForeign: 'ATU12345678',
        company: 'Musterhaus GmbH & Co KG',
        location: 'musterort',
        street: 'Musterstrasse 22',
        zip: '12345',
      });

      expect(result).toBeDefined();
      expect(result.timestamp).toBeDefined();
      expect(result.status).toBeDefined();
      expect(typeof result.status).toBe('string');
      expect(result.status).toMatch(/^evatr-\d{4}$/);
      
      // Qualified validation may return company data
      if (result.company !== undefined) {
        expect(typeof result.company).toBe('string');
      }
      if (result.location !== undefined) {
        expect(typeof result.location).toBe('string');
      }
      if (result.street !== undefined) {
        expect(typeof result.street).toBe('string');
      }
      if (result.zip !== undefined) {
        expect(typeof result.zip).toBe('string');
      }
    }, 30000);

    it('should handle qualified validation with minimal data', async () => {
      const result = await client.validateQualified({
        vatIdOwn: 'DE123456789',
        vatIdForeign: 'ATU12345678',
        company: 'Musterhaus GmbH & Co KG',
        location: 'musterort',
      });

      expect(result).toBeDefined();
      expect(result.status).toBeDefined();
    }, 30000);

    it('should reject qualified validation with invalid VAT-IDs', async () => {
      await expect(
        client.validateQualified({
          vatIdOwn: 'INVALID',
          vatIdForeign: 'ATU12345678',
          company: 'Test Company',
          location: 'Test City',
        })
      ).rejects.toThrow();
    }, 30000);
  });

  describe('getStatusMessages - External API', () => {
    it('should fetch status messages from real API', async () => {
      const result = await client.getStatusMessages();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      // Check structure of first status message
      const firstMessage = result[0] as StatusMessage;
      expect(firstMessage).toBeDefined();
      expect(typeof firstMessage.status).toBe('string');
      expect(typeof firstMessage.category).toBe('string');
      expect(typeof firstMessage.http).toBe('number');
      expect(typeof firstMessage.message).toBe('string');

      // Status should match evatr-XXXX format
      expect(firstMessage.status).toMatch(/^evatr-\d{4}$/);
      
      // Category should be one of the expected values
      expect(['Result', 'Error', 'Hint']).toContain(firstMessage.category);
      
      // HTTP status should be a valid HTTP status code
      expect(firstMessage.http).toBeGreaterThanOrEqual(200);
      expect(firstMessage.http).toBeLessThan(600);
    }, 30000);

    it('should return status messages with expected content', async () => {
      const result = await client.getStatusMessages();
      
      // Should contain the success status
      const successMessage = result.find(msg => msg.status === 'evatr-0000');
      expect(successMessage).toBeDefined();
      expect(successMessage?.category).toBe('Result');
      expect(successMessage?.http).toBe(200);

      // Should contain some error statuses
      const errorMessages = result.filter(msg => msg.category === 'Error');
      expect(errorMessages.length).toBeGreaterThan(0);

      // Should contain some hint statuses
      const hintMessages = result.filter(msg => msg.category === 'Hint');
      expect(hintMessages.length).toBeGreaterThan(0);
    }, 30000);
  });

  describe('getEUMemberStates - External API', () => {
    it('should fetch EU member states from real API', async () => {
      const result = await client.getEUMemberStates();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      // Check structure of first member state
      const firstState = result[0] as EUMemberState;
      expect(firstState).toBeDefined();
      expect(typeof firstState.code).toBe('string');
      expect(typeof firstState.available).toBe('boolean');

      // Code should be 2-letter country code
      expect(firstState.code).toMatch(/^[A-Z]{2}$/);
      expect(firstState.code.length).toBe(2);
    }, 30000);

    it('should return expected EU member states', async () => {
      const result = await client.getEUMemberStates();
      
      // Should contain Germany
      const germany = result.find(state => state.code === 'DE');
      expect(germany).toBeDefined();
      
      // Should contain Austria
      const austria = result.find(state => state.code === 'AT');
      expect(austria).toBeDefined();
      
      // Should contain France
      const france = result.find(state => state.code === 'FR');
      expect(france).toBeDefined();

      // All states should have valid structure
      result.forEach(state => {
        expect(state.code).toMatch(/^[A-Z]{2}$/);
        expect(typeof state.available).toBe('boolean');
      });
    }, 30000);

    it('should return states with availability information', async () => {
      const result = await client.getEUMemberStates();
      
      // At least some states should be available
      const availableStates = result.filter(state => state.available === true);
      expect(availableStates.length).toBeGreaterThan(0);
    }, 30000);
  });

  describe('Error handling with real API', () => {
    it('should handle network timeouts gracefully', async () => {
      // Create client with very short timeout to test timeout handling
      const shortTimeoutClient = new EvatrClient({
        timeout: 1, // 1ms - should timeout
      });

      await expect(
        shortTimeoutClient.validateSimple({
          vatIdOwn: 'DE123456789',
          vatIdForeign: 'ATU12345678',
        })
      ).rejects.toThrow();
    }, 30000);

    it('should handle API errors with proper error structure', async () => {
      try {
        // Try to trigger an API error with invalid data that passes client validation
        await client.validateSimple({
          vatIdOwn: 'DE123456789',
          vatIdForeign: 'DE123456789', // Same as own - might trigger specific error
        });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        expect(error).toBeDefined();
        expect(error.name).toBe('EvatrApiError');
        
        // Should have at least a message
        expect(typeof error.message).toBe('string');
        expect(error.message.length).toBeGreaterThan(0);
      }
    }, 30000);
  });

  describe('Real API response validation', () => {
    it('should validate that API responses match expected structure', async () => {
      const validationResult = await client.validateSimple({
        vatIdOwn: 'DE123456789',
        vatIdForeign: 'ATU12345678',
      });

      // Validate response structure matches our types
      expect(validationResult).toMatchObject({
        timestamp: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
        status: expect.stringMatching(/^evatr-\d{4}$/),
      });

      // Optional fields should be undefined or strings
      if (validationResult.validFrom !== undefined) {
        expect(typeof validationResult.validFrom).toBe('string');
      }
      if (validationResult.validTill !== undefined) {
        expect(typeof validationResult.validTill).toBe('string');
      }
      if (validationResult.company !== undefined) {
        expect(typeof validationResult.company).toBe('string');
      }
    }, 30000);

    it('should validate status messages API response structure', async () => {
      const statusMessages = await client.getStatusMessages();
      
      // Validate each message has required structure
      statusMessages.forEach((message: StatusMessage) => {
        expect(message).toMatchObject({
          status: expect.stringMatching(/^evatr-\d{4}$/),
          category: expect.stringMatching(/^(Result|Error|Hint)$/),
          message: expect.any(String),
        });

        // Optional http validation
        if (message.http !== undefined) {
          expect(typeof message.http).toBe('number');
        }

        // Optional field validation
        if (message.field !== undefined) {
          expect(typeof message.field).toBe('string');
        }
      });
    }, 30000);

    it('should validate EU member states API response structure', async () => {
      const memberStates = await client.getEUMemberStates();
      
      // Validate each state has required structure
      memberStates.forEach((state: EUMemberState) => {
        expect(state).toMatchObject({
          code: expect.stringMatching(/^[A-Z]{2}$/),
          available: expect.any(Boolean),
        });
      });
    }, 30000);
  });
});
