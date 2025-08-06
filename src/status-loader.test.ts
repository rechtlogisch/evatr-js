/**
 * Tests for StatusMessages
 */

import { StatusMessages } from './status-loader';
import { readFileSync, existsSync } from 'fs';
import { StatusMessage } from './types';

// Mock fs module
jest.mock('fs');
const mockedReadFileSync = readFileSync as jest.MockedFunction<typeof readFileSync>;
const mockedExistsSync = existsSync as jest.MockedFunction<typeof existsSync>;

describe('StatusMessages', () => {
  const mockStatusMessages: StatusMessage[] = [
    {
      status: 'evatr-0000',
      category: 'Result',
      http: 200,
      message: 'Die angefragte Ust-IdNr. ist zum Anfragezeitpunkt gültig.',
    },
    {
      status: 'evatr-0004',
      category: 'Error',
      http: 400,
      field: 'anfragendeUstid', // API field name
      message: 'Die anfragende DE Ust-IdNr. ist syntaktisch falsch. Sie passt nicht in das deutsche Erzeugungsschema.',
    },
    {
      status: 'evatr-2002',
      category: 'Hint',
      http: 200,
      field: 'angefragteUstid', // API field name
      message: 'Die angefragte USt-IdNr. ist zum Anfragezeitpunkt nicht gültig. Sie ist erst gültig ab dem Datum im Feld gueltigAb.',
    },
  ];

  beforeEach(() => {
    // Clear cache before each test
    StatusMessages.clearCache();
    jest.clearAllMocks();
  });

  afterEach(() => {
    StatusMessages.clearCache();
  });

  describe('getStatusMessages', () => {
    it('should load status messages from file when available', () => {
      mockedExistsSync.mockReturnValue(true);
      mockedReadFileSync.mockReturnValue(JSON.stringify(mockStatusMessages));

      const messages = StatusMessages.getStatusMessages();

      expect(messages['evatr-0000']).toEqual(mockStatusMessages[0]);
      expect(messages['evatr-0004']).toEqual(mockStatusMessages[1]);
      expect(messages['evatr-2002']).toEqual(mockStatusMessages[2]);
    });

    it('should fallback to constants when file not available', () => {
      mockedExistsSync.mockReturnValue(false);

      const messages = StatusMessages.getStatusMessages();

      // Should return fallback constants (we know evatr-0000 exists in constants)
      expect(messages['evatr-0000']).toBeDefined();
    });

    it('should handle file read errors gracefully', () => {
      mockedExistsSync.mockReturnValue(true);
      mockedReadFileSync.mockImplementation(() => {
        throw new Error('File read error');
      });

      const messages = StatusMessages.getStatusMessages();

      // Should fallback to constants
      expect(messages['evatr-0000']).toBeDefined();
    });
  });

  describe('getStatusMessage', () => {
    beforeEach(() => {
      mockedExistsSync.mockReturnValue(true);
      mockedReadFileSync.mockReturnValue(JSON.stringify(mockStatusMessages));
    });

    it('should return specific status message', () => {
      const message = StatusMessages.getStatusMessage('evatr-0000');
      expect(message).toEqual(mockStatusMessages[0]);
    });

    it('should return undefined for non-existent status', () => {
      const message = StatusMessages.getStatusMessage('non-existent');
      expect(message).toBeUndefined();
    });
  });

  describe('status checking methods', () => {
    beforeEach(() => {
      mockedExistsSync.mockReturnValue(true);
      mockedReadFileSync.mockReturnValue(JSON.stringify(mockStatusMessages));
    });

    it('should identify success status correctly', () => {
      expect(StatusMessages.isSuccessStatus('evatr-0000')).toBe(true);
      expect(StatusMessages.isSuccessStatus('evatr-0004')).toBe(false);
      expect(StatusMessages.isSuccessStatus('evatr-2002')).toBe(true); // HTTP 200
    });

    it('should identify error status correctly', () => {
      expect(StatusMessages.isErrorStatus('evatr-0004')).toBe(true);
      expect(StatusMessages.isErrorStatus('evatr-0000')).toBe(false);
      expect(StatusMessages.isErrorStatus('evatr-2002')).toBe(false);
    });

    it('should identify warning status correctly', () => {
      expect(StatusMessages.isWarningStatus('evatr-2002')).toBe(true);
      expect(StatusMessages.isWarningStatus('evatr-0000')).toBe(false);
      expect(StatusMessages.isWarningStatus('evatr-0004')).toBe(false);
    });
  });

  describe('filtering methods', () => {
    beforeEach(() => {
      mockedExistsSync.mockReturnValue(true);
      mockedReadFileSync.mockReturnValue(JSON.stringify(mockStatusMessages));
    });

    it('should get messages by category', () => {
      const errorMessages = StatusMessages.getStatusMessagesByCategory('Error');
      expect(errorMessages).toHaveLength(15);
      expect(errorMessages[0].status).toBe('evatr-0004');

      const resultMessages = StatusMessages.getStatusMessagesByCategory('Result');
      expect(resultMessages).toHaveLength(1);
      expect(resultMessages[0].status).toBe('evatr-0000');

      const hintMessages = StatusMessages.getStatusMessagesByCategory('Hint');
      expect(hintMessages).toHaveLength(10);
      expect(hintMessages[0].status).toBe('evatr-0001');
    });

    it('should get messages by HTTP code', () => {
      const http200Messages = StatusMessages.getStatusMessagesByHttp(200);
      expect(http200Messages).toHaveLength(4);
      expect(http200Messages.map((m) => m.status)).toContain('evatr-0000');
      expect(http200Messages.map((m) => m.status)).toContain('evatr-2002');
      expect(http200Messages.map((m) => m.status)).toContain('evatr-2006');
      expect(http200Messages.map((m) => m.status)).toContain('evatr-2008');

      const http400Messages = StatusMessages.getStatusMessagesByHttp(400);
      expect(http400Messages).toHaveLength(7);
    });
  });

  describe('getAvailableStatusCodes', () => {
    beforeEach(() => {
      mockedExistsSync.mockReturnValue(true);
      mockedReadFileSync.mockReturnValue(JSON.stringify(mockStatusMessages));
    });

    it('should return sorted list of status codes', () => {
      const codes = StatusMessages.getAvailableStatusCodes();
      expect(codes).toEqual([
        'evatr-0000',
        'evatr-0001',
        'evatr-0002',
        'evatr-0003',
        'evatr-0004',
        'evatr-0005',
        'evatr-0006',
        'evatr-0007',
        'evatr-0008',
        'evatr-0011',
        'evatr-0012',
        'evatr-0013',
        'evatr-1001',
        'evatr-1002',
        'evatr-1003',
        'evatr-1004',
        'evatr-2001',
        'evatr-2002',
        'evatr-2003',
        'evatr-2004',
        'evatr-2005',
        'evatr-2006',
        'evatr-2007',
        'evatr-2008',
        'evatr-2011',
        'evatr-3011',
      ]);
    });
  });

  describe('getStatistics', () => {
    it('should return correct statistics', () => {
      const stats = StatusMessages.getStatistics();

      expect(stats.total).toBe(26);
      expect(stats.byCategory).toEqual({
        Result: 1,
        Error: 15,
        Hint: 10,
      });
      expect(stats.byHttp).toEqual({
        200: 4,
        400: 7,
        403: 3,
        404: 2,
        500: 7,
        503: 3,
      });
      expect(stats.source).toBe('file');
    });
  });

  describe('loadFromPath', () => {
    it('should load messages from specific file path', () => {
      const filePath = '/custom/path/statusmeldungen.json';
      mockedExistsSync.mockReturnValue(true);
      mockedReadFileSync.mockReturnValue(JSON.stringify(mockStatusMessages));

      const result = StatusMessages.loadFromPath(filePath);

      expect(result).toBeDefined();
      expect(result!['evatr-0000']).toEqual(mockStatusMessages[0]);
      expect(mockedExistsSync).toHaveBeenCalledWith(filePath);
      expect(mockedReadFileSync).toHaveBeenCalledWith(filePath, 'utf8');
    });

    it('should return null for non-existent file', () => {
      const filePath = '/non/existent/file.json';
      mockedExistsSync.mockReturnValue(false);

      const result = StatusMessages.loadFromPath(filePath);

      expect(result).toBeNull();
    });

    it('should handle JSON parse errors', () => {
      const filePath = '/invalid/json/file.json';
      mockedExistsSync.mockReturnValue(true);
      mockedReadFileSync.mockReturnValue('invalid json');

      const result = StatusMessages.loadFromPath(filePath);

      expect(result).toBeNull();
    });
  });

  describe('clearCache', () => {
    it('should clear the cache', () => {
      mockedExistsSync.mockReturnValue(true);
      mockedReadFileSync.mockReturnValue(JSON.stringify(mockStatusMessages));

      // Clear cache
      StatusMessages.clearCache();

      // Should read file
      StatusMessages.getAndCacheStatusMessages();
      expect(mockedReadFileSync).toHaveBeenCalledTimes(1);
    });
  });

  describe('loadFromFile method', () => {
    // @TODO
    // it('should load status messages from a specific file', () => {
    //   const mockMessages = [
    //     { status: 'evatr-0000', category: 'Result', http: 200, message: 'Valid' },
    //     { status: 'evatr-0001', category: 'Error', http: 400, message: 'Invalid' },
    //   ];

    //   mockedExistsSync.mockReturnValue(true);
    //   mockedReadFileSync.mockReturnValue(JSON.stringify(mockMessages));

    //   const result = StatusMessages.loadFromFile();

    //   expect(result).toEqual(mockMessages);
    //   expect(mockedExistsSync).toHaveBeenCalledWith('/path/to/test.json');
    //   expect(mockedReadFileSync).toHaveBeenCalledWith('/path/to/test.json', 'utf8');
    // });

    // it('should throw error for non-existent file', () => {
    //   mockedExistsSync.mockReturnValue(false);

    //   expect(() => {
    //     StatusMessages.loadFromFile();
    //   }).toThrow('File not found: /path/to/nonexistent.json');
    // });

    // it('should throw error for invalid JSON', () => {
    //   mockedExistsSync.mockReturnValue(true);
    //   mockedReadFileSync.mockReturnValue('invalid json');

    //   expect(() => {
    //     StatusMessages.loadFromFile();
    //   }).toThrow();
    // });

    // it('should throw error for file read errors', () => {
    //   mockedExistsSync.mockReturnValue(true);
    //   mockedReadFileSync.mockImplementation(() => {
    //     throw new Error('Permission denied');
    //   });

    //   expect(() => {
    //     StatusMessages.loadFromFile('/path/to/protected.json');
    //   }).toThrow('Permission denied');
    // });
  });

  describe('edge cases and error handling', () => {
    // @TODO
    // it('should handle empty status messages gracefully', () => {
    //   mockedExistsSync.mockReturnValue(true);
    //   mockedReadFileSync.mockReturnValue('[]');

    //   const result = StatusMessages.getStatusMessages();
    //   expect(Object.keys(result)).toHaveLength(0);
    // });

    it('should handle malformed status message objects', () => {
      const malformedMessages = [
        { status: 'evatr-0000' }, // Missing required fields
        { category: 'Result', message: 'Test' }, // Missing status
        null,
        undefined,
        'invalid',
      ];

      mockedExistsSync.mockReturnValue(true);
      mockedReadFileSync.mockReturnValue(JSON.stringify(malformedMessages));

      // Should not throw, but handle gracefully
      expect(() => {
        StatusMessages.getStatusMessages();
      }).not.toThrow();
    });

    // @TODO
    // it('should handle concurrent access to status messages', () => {
    //   const mockMessages = [
    //     { status: 'evatr-0000', category: 'Result', http: 200, message: 'Valid' },
    //   ];

    //   mockedExistsSync.mockReturnValue(true);
    //   mockedReadFileSync.mockReturnValue(JSON.stringify(mockMessages));

    //   // Simulate concurrent access
    //   const result1 = StatusMessages.getStatusMessages();
    //   const result2 = StatusMessages.getStatusMessages();

    //   expect(result1).toEqual(result2);
    //   expect(result1).toBe(result2); // Should be the same cached instance
    // });

    // it('should handle cache invalidation correctly', () => {
    //   const mockMessages1 = [
    //     { status: 'evatr-0000', category: 'Result', http: 200, message: 'Valid' },
    //   ];
    //   const mockMessages2 = [
    //     { status: 'evatr-0001', category: 'Error', http: 400, message: 'Invalid' },
    //   ];

    //   // First load
    //   mockedExistsSync.mockReturnValue(true);
    //   mockedReadFileSync.mockReturnValue(JSON.stringify(mockMessages1));
    //   const result1 = StatusMessages.getStatusMessages();

    //   // Clear cache and load different data
    //   StatusMessages.clearCache();
    //   mockedReadFileSync.mockReturnValue(JSON.stringify(mockMessages2));
    //   const result2 = StatusMessages.getStatusMessages();

    //   expect(result1).not.toEqual(result2);
    //   expect(Object.keys(result1)).toHaveLength(1);
    //   expect(Object.keys(result2)).toHaveLength(1);
    //   expect(result1['evatr-0000']).toBeDefined();
    //   expect(result2['evatr-0001']).toBeDefined();
    // });
  });

  describe('loadFromPath edge cases', () => {
    it('should handle file system errors gracefully', () => {
      mockedExistsSync.mockReturnValue(true);
      mockedReadFileSync.mockImplementation(() => {
        throw new Error('Disk full');
      });

      const result = StatusMessages.loadFromPath('/path/to/file.json');
      expect(result).toBeNull();
    });

    it('should handle JSON parsing errors gracefully', () => {
      mockedExistsSync.mockReturnValue(true);
      mockedReadFileSync.mockReturnValue('{ invalid json }');

      const result = StatusMessages.loadFromPath('/path/to/file.json');
      expect(result).toBeNull();
    });

    it('should handle empty file gracefully', () => {
      mockedExistsSync.mockReturnValue(true);
      mockedReadFileSync.mockReturnValue('');

      const result = StatusMessages.loadFromPath('/path/to/empty.json');
      expect(result).toBeNull();
    });
  });
});
