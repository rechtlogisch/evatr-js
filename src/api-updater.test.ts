/**
 * Tests for EvatrApiUpdater
 */

import { EvatrApiUpdater } from './api-updater';
import axios from 'axios';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { StatusMessage } from './types';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock fs module
jest.mock('fs');
const mockedReadFileSync = readFileSync as jest.MockedFunction<typeof readFileSync>;
const mockedWriteFileSync = writeFileSync as jest.MockedFunction<typeof writeFileSync>;
const mockedExistsSync = existsSync as jest.MockedFunction<typeof existsSync>;

describe('EvatrApiUpdater', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Ensure writeFileSync doesn't throw by default
    mockedWriteFileSync.mockImplementation(() => {});
  });

  describe('checkApiDocsUpdate', () => {
    it('should detect update when versions differ', async () => {
      const mockApiDocs = {
        info: {
          version: 'v:1.2.3.7-FINAL.727',
        },
      };

      const mockLocalDocs = {
        info: {
          version: 'v:1.2.3.6-FINAL.726',
        },
      };

      mockedAxios.get.mockResolvedValue({ data: mockApiDocs });
      mockedExistsSync.mockReturnValue(true);
      mockedReadFileSync.mockReturnValue(JSON.stringify(mockLocalDocs));

      const result = await EvatrApiUpdater.checkApiDocsUpdate();

      expect(result.hasUpdate).toBe(true);
      expect(result.currentVersion).toBe('v:1.2.3.6-FINAL.726');
      expect(result.latestVersion).toBe('v:1.2.3.7-FINAL.727');
    });

    it('should detect no update when versions are same', async () => {
      const mockApiDocs = {
        info: {
          version: 'v:1.2.3.6-FINAL.726',
        },
      };

      mockedAxios.get.mockResolvedValue({ data: mockApiDocs });
      mockedExistsSync.mockReturnValue(true);
      mockedReadFileSync.mockReturnValue(JSON.stringify(mockApiDocs));

      const result = await EvatrApiUpdater.checkApiDocsUpdate();

      expect(result.hasUpdate).toBe(false);
      expect(result.currentVersion).toBe('v:1.2.3.6-FINAL.726');
      expect(result.latestVersion).toBe('v:1.2.3.6-FINAL.726');
    });

    it('should handle missing local file', async () => {
      const mockApiDocs = {
        info: {
          version: 'v:1.2.3.6-FINAL.726',
        },
      };

      mockedAxios.get.mockResolvedValue({ data: mockApiDocs });
      mockedExistsSync.mockReturnValue(false);

      const result = await EvatrApiUpdater.checkApiDocsUpdate();

      expect(result.hasUpdate).toBe(true);
      expect(result.currentVersion).toBeUndefined();
      expect(result.latestVersion).toBe('v:1.2.3.6-FINAL.726');
    });
  });

  describe('downloadApiDocs', () => {
    it('should download and save API docs with timestamp', async () => {
      const mockApiDocs = {
        info: {
          version: 'v:1.2.3.6-FINAL.726',
        },
      };

      mockedAxios.get.mockResolvedValue({ data: mockApiDocs });

      // Mock Date to get consistent timestamp
      const mockDate = new Date('2025-08-03T20:30:00Z');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

      const result = await EvatrApiUpdater.downloadApiDocs();

      expect(mockedWriteFileSync).toHaveBeenCalledTimes(1);
      expect(result).toContain('api-docs-v:1.2.3.6-FINAL.726-2025-08-03.json');
    });
  });

  describe('checkStatusMessagesUpdate', () => {
    it('should detect differences in status messages', async () => {
      const latestMessages = [
        { status: 'evatr-0000', category: 'Ergebnis', http: 200, message: 'Valid' },
        { status: 'evatr-0001', category: 'Hinweis', http: 400, message: 'New message' },
      ];

      const currentMessages = [
        { status: 'evatr-0000', category: 'Ergebnis', http: 200, message: 'Valid' },
      ];

      mockedAxios.get.mockResolvedValue({ data: latestMessages });
      mockedExistsSync.mockReturnValue(true);
      mockedReadFileSync.mockReturnValue(JSON.stringify(currentMessages));

      const result = await EvatrApiUpdater.checkStatusMessagesUpdate();

      expect(result.hasUpdate).toBe(true);
      expect(result.diff?.added).toHaveLength(1);
      expect(result.diff?.added[0].status).toBe('evatr-0001');
    });

    it('should detect no differences when messages are same', async () => {
      const messages = [
        { status: 'evatr-0000', category: 'Ergebnis', http: 200, message: 'Valid' },
      ];

      mockedAxios.get.mockResolvedValue({ data: messages });
      mockedExistsSync.mockReturnValue(true);
      mockedReadFileSync.mockReturnValue(JSON.stringify(messages));

      const result = await EvatrApiUpdater.checkStatusMessagesUpdate();

      expect(result.hasUpdate).toBe(false);
      expect(result.diff?.added).toHaveLength(0);
      expect(result.diff?.removed).toHaveLength(0);
      expect(result.diff?.modified).toHaveLength(0);
    });
  });

  describe('downloadStatusMessages', () => {
    it('should download and save status messages with timestamp', async () => {
      const mockMessages = [
        { status: 'evatr-0000', category: 'Ergebnis', http: 200, message: 'Valid' },
      ];

      mockedAxios.get.mockResolvedValue({ data: mockMessages });

      // Mock Date to get consistent timestamp
      const mockDate = new Date('2025-08-03T20:30:00Z');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

      const result = await EvatrApiUpdater.downloadStatusMessages();

      expect(mockedWriteFileSync).toHaveBeenCalledTimes(2);
      expect(result).toContain('statusmeldungen-2025-08-03.json');
    });
  });

  describe('compareStatusMessages', () => {
    it('should detect added messages', () => {
      const current = [
        { status: 'evatr-0000', category: 'Ergebnis', http: 200, message: 'Valid' },
      ];

      const latest = [
        { status: 'evatr-0000', category: 'Ergebnis', http: 200, message: 'Valid' },
        { status: 'evatr-0001', category: 'Hinweis', http: 400, message: 'New' },
      ];

      // Access private method for testing
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const diff = (EvatrApiUpdater as any).compareStatusMessages(current, latest);

      expect(diff.added).toHaveLength(1);
      expect(diff.added[0].status).toBe('evatr-0001');
      expect(diff.removed).toHaveLength(0);
      expect(diff.modified).toHaveLength(0);
    });

    it('should detect removed messages', () => {
      const current = [
        { status: 'evatr-0000', category: 'Ergebnis', http: 200, message: 'Valid' },
        { status: 'evatr-0001', category: 'Hinweis', http: 400, message: 'Old' },
      ];

      const latest = [
        { status: 'evatr-0000', category: 'Ergebnis', http: 200, message: 'Valid' },
      ];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const diff = (EvatrApiUpdater as any).compareStatusMessages(current, latest);

      expect(diff.added).toHaveLength(0);
      expect(diff.removed).toHaveLength(1);
      expect(diff.removed[0].status).toBe('evatr-0001');
      expect(diff.modified).toHaveLength(0);
    });

    it('should detect modified messages', () => {
      const current = [
        { status: 'evatr-0000', category: 'Ergebnis', http: 200, message: 'Old message' },
      ];

      const latest = [
        { status: 'evatr-0000', category: 'Ergebnis', http: 200, message: 'New message' },
      ];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const diff = (EvatrApiUpdater as any).compareStatusMessages(current, latest);

      expect(diff.added).toHaveLength(0);
      expect(diff.removed).toHaveLength(0);
      expect(diff.modified).toHaveLength(1);
      expect(diff.modified[0].status).toBe('evatr-0000');
      expect(diff.modified[0].old.message).toBe('Old message');
      expect(diff.modified[0].new.message).toBe('New message');
    });
  });

  describe('error handling', () => {
    it('should handle API request errors', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network error'));

      await expect(EvatrApiUpdater.checkApiDocsUpdate()).rejects.toThrow('Network error');
    });

    it('should handle file system errors', async () => {
      const mockResponse = {
        data: { info: { version: '1.0.0' } },
      };
      (axios.get as jest.MockedFunction<typeof axios.get>).mockResolvedValue(mockResponse);

      mockedExistsSync.mockReturnValue(true);
      mockedReadFileSync.mockImplementation(() => {
        throw new Error('File read error');
      });

      const result = await EvatrApiUpdater.checkApiDocsUpdate();
      expect(result.hasUpdate).toBe(true);
      expect(result.currentVersion).toBeUndefined();
    });
  });

  describe('printStatusMessageDiff', () => {
    it('should print differences when messages are added', () => {
      const diff = {
        added: [
          { status: 'evatr-0001', category: 'Result', http: 200, message: 'New message' },
        ],
        removed: [],
        modified: [],
      };

      // Access private method for testing
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => (EvatrApiUpdater as any).printStatusMessageDiff(diff)).not.toThrow();
    });

    it('should print differences when messages are removed', () => {
      const diff = {
        added: [],
        removed: [
          { status: 'evatr-0001', category: 'Result', http: 200, message: 'Removed message' },
        ],
        modified: [],
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => (EvatrApiUpdater as any).printStatusMessageDiff(diff)).not.toThrow();
    });

    it('should print differences when messages are modified', () => {
      const diff = {
        added: [],
        removed: [],
        modified: [
          {
            status: 'evatr-0001',
            old: { status: 'evatr-0001', category: 'Result', http: 200, message: 'Old message' },
            new: { status: 'evatr-0001', category: 'Result', http: 200, message: 'New message' },
          },
        ],
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => (EvatrApiUpdater as any).printStatusMessageDiff(diff)).not.toThrow();
    });

    it('should print no differences message when no changes', () => {
      const diff = {
        added: [],
        removed: [],
        modified: [],
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => (EvatrApiUpdater as any).printStatusMessageDiff(diff)).not.toThrow();
    });
  });

  describe('updateConstantsFile', () => {
    it('should update constants file with new status messages', async () => {
      const statusMessages: StatusMessage[] = [
        { status: 'evatr-0000', category: 'Result', http: 200, message: 'Valid' },
        { status: 'evatr-0001', category: 'Error', http: 400, message: 'Invalid' },
      ];

      const mockConstantsContent = `
export const STATUS_MESSAGES: Record<string, ApiStatusMessage> = {
  'evatr-0000': { status: 'evatr-0000', category: 'Result', http: 200, message: 'Old message' }
};
`;

      mockedReadFileSync.mockReturnValue(mockConstantsContent);

      await EvatrApiUpdater.updateConstantsFile(statusMessages);

      expect(mockedReadFileSync).toHaveBeenCalledWith('./src/constants.ts', 'utf8');
      expect(mockedWriteFileSync).toHaveBeenCalledTimes(1);
    });

    it('should handle file read errors in updateConstantsFile', async () => {
      const statusMessages: StatusMessage[] = [
        { status: 'evatr-0000', category: 'Result', http: 200, message: 'Valid' },
      ];

      mockedReadFileSync.mockImplementation(() => {
        throw new Error('File not found');
      });

      await expect(EvatrApiUpdater.updateConstantsFile(statusMessages)).rejects.toThrow('File not found');
    });

    it('should handle file write errors in updateConstantsFile', async () => {
      const statusMessages: StatusMessage[] = [
        { status: 'evatr-0000', category: 'Result', http: 200, message: 'Valid' },
      ];

      const mockConstantsContent = `
export const STATUS_MESSAGES: Record<string, ApiStatusMessage> = {};
`;

      mockedReadFileSync.mockReturnValue(mockConstantsContent);
      mockedWriteFileSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      await expect(EvatrApiUpdater.updateConstantsFile(statusMessages)).rejects.toThrow('Permission denied');
    });
  });

  describe('checkAndUpdateAll', () => {
    it('should run complete update check with no updates available', async () => {
      // Mock API docs check - no update
      const apiDocsResponse = { data: { info: { version: '1.0.0' } } };
      (axios.get as jest.MockedFunction<typeof axios.get>).mockResolvedValueOnce(apiDocsResponse);
      mockedExistsSync.mockReturnValue(true);
      mockedReadFileSync.mockReturnValue(JSON.stringify({ info: { version: '1.0.0' } }));

      // Mock status messages check - no update
      const statusMessagesResponse = { data: [{ status: 'evatr-0000', kategorie: 'Ergebnis', httpcode: 200, meldung: 'Valid' }] };
      (axios.get as jest.MockedFunction<typeof axios.get>).mockResolvedValue(statusMessagesResponse);
      mockedReadFileSync.mockReturnValue(JSON.stringify([{ status: 'evatr-0000', kategorie: 'Ergebnis', httpcode: 200, meldung: 'Valid' }]));

      await expect(EvatrApiUpdater.checkAndUpdateAll()).resolves.not.toThrow();
    });

    it('should run complete update check with updates available', async () => {
      // Mock API docs check - update available
      const apiDocsResponse = { data: { info: { version: '2.0.0' } } };
      (axios.get as jest.MockedFunction<typeof axios.get>).mockResolvedValueOnce(apiDocsResponse);
      mockedExistsSync.mockReturnValue(true);
      mockedReadFileSync.mockReturnValue(JSON.stringify({ info: { version: '1.0.0' } }));

      // Mock API docs download
      (axios.get as jest.MockedFunction<typeof axios.get>).mockResolvedValueOnce(apiDocsResponse);

      // Mock status messages check - update available
      const statusMessagesResponse = { data: [{ status: 'evatr-0001', category: 'Result', http: 200, message: 'New message' }] };
      (axios.get as jest.MockedFunction<typeof axios.get>).mockResolvedValueOnce(statusMessagesResponse);
      mockedReadFileSync.mockReturnValue(JSON.stringify([{ status: 'evatr-0000', category: 'Result', http: 200, message: 'Old message' }]));

      // Mock status messages download
      (axios.get as jest.MockedFunction<typeof axios.get>).mockResolvedValueOnce(statusMessagesResponse);

      await expect(EvatrApiUpdater.checkAndUpdateAll()).resolves.not.toThrow();
      expect(mockedWriteFileSync).toHaveBeenCalled();
    });

    it('should handle errors in checkAndUpdateAll', async () => {
      // Mock the first API call (checkApiDocsUpdate) to fail with network error
      (axios.get as jest.MockedFunction<typeof axios.get>).mockRejectedValueOnce(new Error('Network error'));

      await expect(EvatrApiUpdater.checkAndUpdateAll()).rejects.toThrow('Network error');
    });
  });

  describe('updateConstantsFromFile', () => {
    it('should update constants from a file', async () => {
      const statusMessages = [
        { status: 'evatr-0000', category: 'Result', http: 200, message: 'Valid' },
      ];

      mockedReadFileSync.mockReturnValueOnce(JSON.stringify(statusMessages));
      mockedReadFileSync.mockReturnValueOnce('export const STATUS_MESSAGES: Record<string, ApiStatusMessage> = {};');

      await expect(EvatrApiUpdater.updateConstantsFromFile('/path/to/file.json')).resolves.not.toThrow();
      expect(mockedWriteFileSync).toHaveBeenCalled();
    });

    it('should handle file read errors in updateConstantsFromFile', async () => {
      mockedReadFileSync.mockImplementation(() => {
        throw new Error('File not found');
      });

      await expect(EvatrApiUpdater.updateConstantsFromFile('/path/to/file.json')).rejects.toThrow('File not found');
    });

    it('should handle JSON parse errors in updateConstantsFromFile', async () => {
      mockedReadFileSync.mockReturnValue('invalid json');

      await expect(EvatrApiUpdater.updateConstantsFromFile('/path/to/file.json')).rejects.toThrow();
    });
  });
});
