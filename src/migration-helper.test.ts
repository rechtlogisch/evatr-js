/**
 * Tests for the migration helper
 */

import { EvatrMigrationHelper, ResultType } from './migration-helper';
import { EvatrClient } from './client';
import { StatusMessages } from './status-loader';
import { Response } from './types';

// Mock the EvatrClient
jest.mock('./client');
const MockedEvatrClient = EvatrClient as jest.MockedClass<typeof EvatrClient>;

// Mock StatusMessages
jest.mock('./status-loader', () => ({
  StatusMessages: {
    getStatusMessage: jest.fn(),
  },
}));

describe('EvatrMigrationHelper', () => {
  let mockClient: jest.Mocked<EvatrClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockClient = new MockedEvatrClient() as jest.Mocked<EvatrClient>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (EvatrMigrationHelper as any).client = mockClient;
  });

  describe('checkSimple', () => {
    it('should perform simple validation and return expected format', async () => {
      const mockResponse: Response = {
        id: 'test-id',
        timestamp: '2025-08-06T10:00:00.000Z',
        status: 'evatr-0000',
        vatIdOwn: 'DE123456789',
        vatIdForeign: 'ATU12345678',
        validFrom: '2020-01-01',
        validTill: '2025-12-31',
      };

      mockClient.validateSimple.mockResolvedValue(mockResponse);
      mockClient.isSuccessStatus.mockReturnValue(true);
      (StatusMessages.getStatusMessage as jest.Mock).mockReturnValue({
        status: 'evatr-0000',
        category: 'Result',
        http: 200,
        message: 'Valid',
      });

      const params = {
        ownVatNumber: 'DE123456789',
        validateVatNumber: 'ATU12345678',
      };

      const result = await EvatrMigrationHelper.checkSimple(params);

      expect(result).toMatchObject({
        date: '06.08.2025',
        errorCode: 200,
        errorDescription: 'Valid',
        ownVatNumber: 'DE123456789',
        validatedVatNumber: 'ATU12345678',
        validFrom: '2020-01-01',
        validUntil: '2025-12-31',
        valid: true,
      });

      // Check that time is in HH:MM:SS format
      expect(result.time).toMatch(/^\d{2}:\d{2}:\d{2}$/);

      expect(mockClient.validateSimple).toHaveBeenCalledWith({
        vatIdOwn: 'DE123456789',
        vatIdForeign: 'ATU12345678',
      });
    });

    it('should include raw XML when requested', async () => {
      const mockResponse: Response = {
        id: 'test-id',
        timestamp: '2025-08-06T10:00:00Z',
        status: 'evatr-0000',
        vatIdOwn: 'DE123456789',
        vatIdForeign: 'ATU12345678',
      };

      mockClient.validateSimple.mockResolvedValue(mockResponse);
      mockClient.isSuccessStatus.mockReturnValue(true);
      (StatusMessages.getStatusMessage as jest.Mock).mockReturnValue({
        status: 'evatr-0000',
        category: 'Result',
        http: 200,
        message: 'Valid',
      });

      const params = {
        ownVatNumber: 'DE123456789',
        validateVatNumber: 'ATU12345678',
        includeRaw: true,
      };

      const result = await EvatrMigrationHelper.checkSimple(params);

      expect(result.raw).toBeDefined();
      expect(result.raw).toContain('"timestamp"');
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Network error');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (error as any).http = 500;

      mockClient.validateSimple.mockRejectedValue(error);

      const params = {
        ownVatNumber: 'DE123456789',
        validateVatNumber: 'ATU12345678',
      };

      const result = await EvatrMigrationHelper.checkSimple(params);

      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe(500);
      expect(result.errorDescription).toBe('Network error');
    });
  });

  describe('checkQualified', () => {
    it('should perform qualified validation and return expected format', async () => {
      const mockResponse: Response = {
        id: 'test-id',
        timestamp: '2025-08-06T10:00:00Z',
        status: 'evatr-0000',
        vatIdOwn: 'DE123456789',
        vatIdForeign: 'ATU12345678',
        validFrom: '2020-01-01',
        validTill: '2025-12-31',
        company: 'A' as const,
        location: 'A' as const,
        zip: 'B' as const,
        street: 'C' as const,
      };

      mockClient.validateQualified.mockResolvedValue(mockResponse);
      mockClient.isSuccessStatus.mockReturnValue(true);
      (StatusMessages.getStatusMessage as jest.Mock).mockReturnValue({
        status: 'evatr-0000',
        category: 'Result',
        http: 200,
        message: 'Valid',
      });

      const params = {
        ownVatNumber: 'DE123456789',
        validateVatNumber: 'ATU12345678',
        companyName: 'Musterhaus GmbH & Co KG',
        city: 'Musterort',
        zip: '12345',
        street: 'Musterstrasse 22',
      };

      const result = await EvatrMigrationHelper.checkQualified(params);

      expect(result).toMatchObject({
        date: '06.08.2025',
        errorCode: 200,
        errorDescription: 'Valid',
        ownVatNumber: 'DE123456789',
        validatedVatNumber: 'ATU12345678',
        validFrom: '2020-01-01',
        validUntil: '2025-12-31',
        valid: true,
        companyName: 'Musterhaus GmbH & Co KG',
        city: 'Musterort',
        zip: '12345',
        street: 'Musterstrasse 22',
        resultName: ResultType.MATCH,
        resultCity: ResultType.MATCH,
        resultZip: ResultType.NO_MATCH,
        resultStreet: ResultType.NOT_QUERIED,
        resultNameDescription: 'stimmt überein',
        resultCityDescription: 'stimmt überein',
        resultZipDescription: 'stimmt nicht überein',
        resultStreetDescription: 'nicht angefragt',
      });

      // Check that time is in HH:MM:SS format
      expect(result.time).toMatch(/^\d{2}:\d{2}:\d{2}$/);

      expect(mockClient.validateQualified).toHaveBeenCalledWith({
        vatIdOwn: 'DE123456789',
        vatIdForeign: 'ATU12345678',
        company: 'Musterhaus GmbH & Co KG',
        location: 'Musterort',
        street: 'Musterstrasse 22',
        zip: '12345',
      });
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Validation error');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (error as any).http = 400;

      mockClient.validateQualified.mockRejectedValue(error);

      const params = {
        ownVatNumber: 'DE123456789',
        validateVatNumber: 'ATU12345678',
        companyName: 'Musterhaus GmbH & Co KG',
        city: 'Musterort',
      };

      const result = await EvatrMigrationHelper.checkQualified(params);

      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe(400);
      expect(result.errorDescription).toBe('Validation error');
      expect(result.companyName).toBe('Musterhaus GmbH & Co KG');
      expect(result.city).toBe('Musterort');
    });
  });

  describe('ResultType enum', () => {
    it('should have correct values', () => {
      expect(ResultType.MATCH).toBe('A');
      expect(ResultType.NO_MATCH).toBe('B');
      expect(ResultType.NOT_QUERIED).toBe('C');
      expect(ResultType.NOT_RETURNED).toBe('D');
    });
  });
});
