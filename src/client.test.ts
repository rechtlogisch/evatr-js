/**
 * Tests for EvatrClient
 */

import { EvatrClient } from './client';
import { StatusMessages } from './status-loader';
import axios from 'axios';
import { ApiEUMemberState, ApiStatusMessage, EUMemberState, StatusMessage } from './types';
import { DEFAULT_BASE_URL } from './constants';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock StatusMessages
jest.mock('./status-loader');
const mockedStatusMessages = StatusMessages as jest.Mocked<typeof StatusMessages>;

// Create a mock axios instance
const mockAxiosInstance = {
  post: jest.fn(),
  get: jest.fn(),
  interceptors: {
    response: {
      use: jest.fn(),
    },
  },
};

describe('EvatrClient', () => {
  let client: EvatrClient;

  beforeEach(() => {
    // Setup axios.create mock to return our mock instance
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockedAxios.create.mockReturnValue(mockAxiosInstance as any);

    client = new EvatrClient();
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create client with default config', () => {
      const client = new EvatrClient();
      expect(client).toBeInstanceOf(EvatrClient);
    });

    it('should create client with custom config', () => {
      const config = {
        timeout: 5000,
        headers: { 'Custom-Header': 'value' },
      };
      const client = new EvatrClient(config);
      expect(client).toBeInstanceOf(EvatrClient);
    });
  });

  describe('validateSimple', () => {
    it('should perform simple validation successfully', async () => {
      const mockResponse = {
        data: {
          anfrageZeitpunkt: '2025-08-03T20:30:00Z',
          status: 'evatr-0000',
        },
      };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await client.validateSimple({
        vatIdOwn: 'DE123456789',
        vatIdForeign: 'ATU12345678',
      });

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(DEFAULT_BASE_URL + '/abfrage', {
        anfragendeUstid: 'DE123456789',
        angefragteUstid: 'ATU12345678',
      });

      expect(result.status).toBe('evatr-0000');
      expect(result.timestamp).toBe('2025-08-03T20:30:00Z');
      expect(result.vatIdOwn).toBe('DE123456789');
      expect(result.vatIdForeign).toBe('ATU12345678');
      
    });

    it('should throw error for missing required fields', async () => {
      await expect(
        client.validateSimple({
          vatIdOwn: '',
          vatIdForeign: 'ATU12345678',
        })
      ).rejects.toThrow('Both vatIdOwn and vatIdForeign are required');
    });

    it('should throw error for invalid VAT-ID format', async () => {
      await expect(
        client.validateSimple({
          vatIdOwn: 'INVALID',
          vatIdForeign: 'ATU12345678',
        })
      ).rejects.toThrow('Invalid format for vatIdOwn');
      
      // Ensure no API call was made for invalid VAT-ID
      expect(mockAxiosInstance.post).not.toHaveBeenCalled();
    });

    it('should include raw response data when includeRaw is true', async () => {
      const mockResponse = {
        data: {
          anfrageZeitpunkt: '2025-08-03T20:30:00Z',
          status: 'evatr-0000',
        },
        headers: {
          'content-type': 'application/json',
          'x-request-id': '12345',
        },
      };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await client.validateSimple({
        vatIdOwn: 'DE123456789',
        vatIdForeign: 'ATU12345678',
        includeRaw: true,
      });

      expect(result.status).toBe('evatr-0000');
      expect(result.raw).toBeDefined();
      
      const rawData = JSON.parse(result.raw!);
      expect(rawData.headers).toEqual(mockResponse.headers);
      expect(rawData.data).toEqual(mockResponse.data);
    });

    it('should not include raw response data when includeRaw is false or undefined', async () => {
      const mockResponse = {
        data: {
          anfrageZeitpunkt: '2025-08-03T20:30:00Z',
          status: 'evatr-0000',
        },
        headers: {
          'content-type': 'application/json',
        },
      };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      // Test with includeRaw: false
      const result1 = await client.validateSimple({
        vatIdOwn: 'DE123456789',
        vatIdForeign: 'ATU12345678',
        includeRaw: false,
      });
      expect(result1.raw).toBeUndefined();

      // Test with includeRaw undefined (default)
      const result2 = await client.validateSimple({
        vatIdOwn: 'DE123456789',
        vatIdForeign: 'ATU12345678',
      });
      expect(result2.raw).toBeUndefined();
    });
  });

  describe('validateQualified', () => {
    it('should perform qualified validation successfully', async () => {
      const mockResponse = {
        data: {
          anfrageZeitpunkt: '2025-08-03T20:30:00Z',
          status: 'evatr-0000',
          ergFirmenname: 'A',
          ergOrt: 'A',
          ergStrasse: 'A',
          ergPlz: 'A',
        },
      };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await client.validateQualified({
        vatIdOwn: 'DE123456789',
        vatIdForeign: 'ATU12345678',
        company: 'Musterhaus GmbH & Co KG',
        location: 'musterort',
        street: 'Musterstrasse 22',
        zip: '12345',
      });

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(DEFAULT_BASE_URL + '/abfrage', {
        anfragendeUstid: 'DE123456789',
        angefragteUstid: 'ATU12345678',
        firmenname: 'Musterhaus GmbH & Co KG',
        ort: 'musterort',
        strasse: 'Musterstrasse 22',
        plz: '12345',
      });
      expect(result.status).toBe('evatr-0000');
      expect(result.vatIdOwn).toBe('DE123456789');
      expect(result.vatIdForeign).toBe('ATU12345678');
      expect(result.company).toBe('A');
      expect(result.location).toBe('A');
      expect(result.street).toBe('A');
      expect(result.zip).toBe('A');
    });

    it('should include raw response data when includeRaw is true', async () => {
      const mockResponse = {
        data: {
          anfrageZeitpunkt: '2025-08-03T20:30:00Z',
          status: 'evatr-0000',
          ergFirmenname: 'A',
          ergOrt: 'A',
          ergStrasse: 'A',
          ergPlz: 'A',
        },
        headers: {
          'content-type': 'application/json',
          'x-correlation-id': 'abc123',
        },
      };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await client.validateQualified({
        vatIdOwn: 'DE123456789',
        vatIdForeign: 'ATU12345678',
        company: 'Test Company',
        location: 'Test City',
        includeRaw: true,
      });

      expect(result.status).toBe('evatr-0000');
      expect(result.raw).toBeDefined();
      
      const rawData = JSON.parse(result.raw!);
      expect(rawData.headers).toEqual(mockResponse.headers);
      expect(rawData.data).toEqual(mockResponse.data);
    });
  });

  describe('getStatusMessages', () => {
    it('should fetch status messages from API', async () => {
      const mockStatusMessages: ApiStatusMessage[] = [
        { status: 'evatr-0000', kategorie: 'Ergebnis', httpcode: 200, meldung: 'Valide' },
      ];

      const expectedResultStatusMessages: StatusMessage[] = [
        { status: 'evatr-0000', category: 'Result', http: 200, message: 'Valide' },
      ];

      mockAxiosInstance.get.mockResolvedValue({ data: mockStatusMessages });

      const result = await client.getStatusMessages();
      expect(result).toEqual(expectedResultStatusMessages);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(DEFAULT_BASE_URL + '/info/statusmeldungen');
    });
  });

  describe('getEUMemberStates', () => {
    it('should fetch EU member states from API', async () => {
      const mockMemberStates: ApiEUMemberState[] = [
        { alpha2: 'DE', name: 'Germany', verfuegbar: true },
        { alpha2: 'AT', name: 'Austria', verfuegbar: false },
      ];

      const expectedResultMemberStates: EUMemberState[] = [
        { code: 'DE', available: true },
        { code: 'AT', available: false },
      ];

      mockAxiosInstance.get.mockResolvedValue({ data: mockMemberStates });

      const result = await client.getEUMemberStates();
      expect(result).toEqual(expectedResultMemberStates);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(DEFAULT_BASE_URL + '/info/eu_mitgliedstaaten');
    });
  });

  describe('status checking methods', () => {
    beforeEach(() => {
      mockedStatusMessages.isSuccessStatus.mockImplementation(
        (status) => status === 'evatr-0000'
      );
      mockedStatusMessages.isErrorStatus.mockImplementation(
        (status) => status === 'evatr-0004'
      );
      mockedStatusMessages.isWarningStatus.mockImplementation(
        (status) => status === 'evatr-2002'
      );
      mockedStatusMessages.getStatusMessage.mockReturnValue({
        status: 'evatr-0000',
        category: 'Result',
        http: 200,
        message: 'Valid',
      });
    });

    it('should check success status correctly', () => {
      expect(client.isSuccessStatus('evatr-0000')).toBe(true);
      expect(client.isSuccessStatus('evatr-0004')).toBe(false);
    });

    it('should check error status correctly', () => {
      expect(client.isErrorStatus('evatr-0004')).toBe(true);
      expect(client.isErrorStatus('evatr-0000')).toBe(false);
    });

    it('should check warning status correctly', () => {
      expect(client.isWarningStatus('evatr-2002')).toBe(true);
      expect(client.isWarningStatus('evatr-0000')).toBe(false);
    });

    it('should get status message', () => {
      const message = client.getStatusMessage('evatr-0000');
      expect(message?.status).toBe('evatr-0000');
      expect(mockedStatusMessages.getStatusMessage).toHaveBeenCalledWith('evatr-0000');
    });
  });

  describe('static utility methods', () => {
    it('should validate VAT-ID format', () => {
      // Valid VAT-IDs
      expect(EvatrClient.checkVatIdSyntax('DE123456789')).toBe(true);
      expect(EvatrClient.checkVatIdSyntax('ATU12345678')).toBe(true);
      
      // Invalid VAT-IDs
      expect(EvatrClient.checkVatIdSyntax('INVALID')).toBe(false);
      expect(EvatrClient.checkVatIdSyntax('DE12345678')).toBe(false); // Wrong length
      expect(EvatrClient.checkVatIdSyntax('123456789')).toBe(false); // No country code
      expect(EvatrClient.checkVatIdSyntax('')).toBe(false); // Empty string
      expect(EvatrClient.checkVatIdSyntax('D123456789')).toBe(false); // Single letter country
    });

    it('should get country code from VAT-ID', () => {
      expect(EvatrClient.getCountryCode('DE123456789')).toBe('DE');
      expect(EvatrClient.getCountryCode('ATU12345678')).toBe('AT');
      expect(EvatrClient.getCountryCode('de123456789')).toBe('DE');
    });

    it('should format VAT-ID', () => {
      expect(EvatrClient.normalizeVatId('de 123 456 789')).toBe('DE123456789');
      expect(EvatrClient.normalizeVatId('ATU 123 456 78')).toBe('ATU12345678');
    });
  });

  describe('VAT ID normalization in responses', () => {
    it('should return normalized VAT IDs in simple validation response', async () => {
      const mockResponse = {
        data: {
          anfrageZeitpunkt: '2025-08-03T20:30:00Z',
          status: 'evatr-0000',
        },
      };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      // Test with unnormalized input (spaces, lowercase)
      const result = await client.validateSimple({
        vatIdOwn: 'de 123 456 789',
        vatIdForeign: 'atu 123 456 78',
      });

      // Should return normalized VAT IDs
      expect(result.vatIdOwn).toBe('DE123456789');
      expect(result.vatIdForeign).toBe('ATU12345678');
      expect(result.status).toBe('evatr-0000');
    });

    it('should return normalized VAT IDs in qualified validation response', async () => {
      const mockResponse = {
        data: {
          anfrageZeitpunkt: '2025-08-03T20:30:00Z',
          status: 'evatr-0000',
          ergFirmenname: 'A',
          ergOrt: 'A',
        },
      };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      // Test with unnormalized input
      const result = await client.validateQualified({
        vatIdOwn: 'DE 123-456-789',
        vatIdForeign: 'ATU.123.456.78',
        company: 'Test Company',
        location: 'Test City',
      });

      // Should return normalized VAT IDs
      expect(result.vatIdOwn).toBe('DE123456789');
      expect(result.vatIdForeign).toBe('ATU12345678');
      expect(result.company).toBe('A');
      expect(result.location).toBe('A');
    });

    it('should return normalized VAT IDs in extended response', async () => {
      const mockResponse = {
        data: {
          anfrageZeitpunkt: '2025-08-03T20:30:00Z',
          status: 'evatr-0000',
          gueltigAb: '2025-01-01',
          gueltigBis: '2025-12-31',
        },
      };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);
      
      // Mock status message for extended response
      mockedStatusMessages.getStatusMessage.mockReturnValue({
        status: 'evatr-0000',
        category: 'Result',
        http: 200,
        message: 'Valid',
      });
      mockedStatusMessages.isSuccessStatus.mockReturnValue(true);

      // Test extended response with unnormalized input
      const result = await client.validateSimple({
        vatIdOwn: 'de123456789',
        vatIdForeign: 'atu12345678',
      }, true);

      // Should return normalized VAT IDs in extended response
      expect(result.vatIdOwn).toBe('DE123456789');
      expect(result.vatIdForeign).toBe('ATU12345678');
      expect(result.valid).toBe(true);
      expect(result.message).toBe('Valid');
      expect(result.timestamp).toBeInstanceOf(Date);
      expect(result.validFrom).toBeInstanceOf(Date);
      expect(result.validTill).toBeInstanceOf(Date);
    });

    it('should include raw response data in extended response when includeRaw is true', async () => {
      const mockResponse = {
        data: {
          anfrageZeitpunkt: '2025-08-03T20:30:00Z',
          status: 'evatr-0000',
          gueltigAb: '2025-01-01',
          gueltigBis: '2025-12-31',
        },
        headers: {
          'content-type': 'application/json',
          'server': 'nginx/1.20.1',
        },
      };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);
      
      // Mock status message for extended response
      mockedStatusMessages.getStatusMessage.mockReturnValue({
        status: 'evatr-0000',
        category: 'Result',
        http: 200,
        message: 'Valid',
      });
      mockedStatusMessages.isSuccessStatus.mockReturnValue(true);

      // Test extended response with includeRaw
      const result = await client.validateSimple({
        vatIdOwn: 'DE123456789',
        vatIdForeign: 'ATU12345678',
        includeRaw: true,
      }, true);

      expect(result.vatIdOwn).toBe('DE123456789');
      expect(result.vatIdForeign).toBe('ATU12345678');
      expect(result.valid).toBe(true);
      expect(result.message).toBe('Valid');
      expect(result.timestamp).toBeInstanceOf(Date);
      expect(result.validFrom).toBeInstanceOf(Date);
      expect(result.validTill).toBeInstanceOf(Date);
      expect(result.raw).toBeDefined();
      
      const rawData = JSON.parse(result.raw!);
      expect(rawData.headers).toEqual(mockResponse.headers);
      expect(rawData.data).toEqual(mockResponse.data);
    });

    it('should handle various VAT ID input formats and normalize them consistently', async () => {
      const mockResponse = {
        data: {
          anfrageZeitpunkt: '2025-08-03T20:30:00Z',
          status: 'evatr-0000',
        },
      };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const testCases = [
        { input: 'DE123456789', expected: 'DE123456789' },
        { input: 'de123456789', expected: 'DE123456789' },
        { input: 'DE 123 456 789', expected: 'DE123456789' },
        { input: 'de 123 456 789', expected: 'DE123456789' },
        { input: 'DE-123-456-789', expected: 'DE123456789' },
        { input: 'DE.123.456.789', expected: 'DE123456789' },
        { input: 'ATU12345678', expected: 'ATU12345678' },
        { input: 'atu12345678', expected: 'ATU12345678' },
        { input: 'ATU 123 456 78', expected: 'ATU12345678' },
        { input: 'atu 123 456 78', expected: 'ATU12345678' },
      ];

      for (const testCase of testCases) {
        const result = await client.validateSimple({
          vatIdOwn: testCase.input,
          vatIdForeign: 'ATU12345678',
        });

        expect(result.vatIdOwn).toBe(testCase.expected);
        expect(result.vatIdForeign).toBe('ATU12345678');
      }
    });
  });
});
