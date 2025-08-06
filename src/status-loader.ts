/**
 * Dynamic status message loader for eVatR API
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { ApiStatusMessage, StatusMessage, StatusMessageCategory } from './types';
import { STATUS_MESSAGES as FALLBACK_STATUS_MESSAGES } from './constants';

/**
 * Status message loader that can load from files or fallback to constants
 */
export class StatusMessages {
  private static cache = false; // currently disabled by default, without a way to enable it programatically
  private static cachedMessages: Record<string, StatusMessage> | null = null;
  private static lastLoadTime: number = 0;
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Load status messages with caching
   */
  static getStatusMessages(): Record<string, StatusMessage> {
    if (this.cache === false) {
      return FALLBACK_STATUS_MESSAGES;
    }

    return this.getAndCacheStatusMessages();
  }

  /**
   * Load status messages with caching
   */
  static getAndCacheStatusMessages(): Record<string, StatusMessage> {
    const now = Date.now();
    
    // Return cached messages if still valid
    if (this.cachedMessages && (now - this.lastLoadTime) < this.CACHE_TTL) {
      return this.cachedMessages;
    }

    // Try to load from file first
    const fileMessages = this.loadFromFile();
    if (fileMessages) {
      this.cachedMessages = fileMessages;
      this.lastLoadTime = now;
      return fileMessages;
    }

    // Fallback to constants
    this.cachedMessages = FALLBACK_STATUS_MESSAGES;
    this.lastLoadTime = now;
    return FALLBACK_STATUS_MESSAGES;
  }

  /**
   * Get a specific status message
   */
  static getStatusMessage(statusCode: string): StatusMessage | undefined {
    const messages = this.getStatusMessages();
    return messages[statusCode];
  }

  /**
   * Clear the cache to force reload
   */
  static clearCache(): void {
    this.cachedMessages = null;
    this.lastLoadTime = 0;
  }

  /**
   * Load status messages from file
   */
  public static loadFromFile(): Record<string, StatusMessage> | null {
    const possiblePaths = [
      // Try docs directory first
      join(process.cwd(), 'docs', 'statusmeldungen.json'),
      // Try relative to this file
      join(__dirname, '..', '..', 'docs', 'statusmeldungen.json'),
      // Try current directory
      join(process.cwd(), 'statusmeldungen.json'),
    ];

    for (const path of possiblePaths) {
      if (existsSync(path)) {
        try {
          const fileContent = readFileSync(path, 'utf8');
          const messages: StatusMessage[] = JSON.parse(fileContent);
          
          // Convert array to object keyed by status code
          const messagesObj = messages.reduce((acc, msg) => {
            acc[msg.status] = msg;
            return acc;
          }, {} as Record<string, StatusMessage>);

          // eslint-disable-next-line no-console
          console.log(`✅ Loaded ${messages.length} status messages from: ${path}`);
          return messagesObj;
        } catch (error) {
          // eslint-disable-next-line no-console
          console.warn(`⚠️ Could not load status messages from ${path}:`, error);
        }
      }
    }

    return null;
  }

  /**
   * Load status messages from a specific file path
   */
  static loadFromPath(filePath: string): Record<string, ApiStatusMessage> | null {
    if (!existsSync(filePath)) {
      // eslint-disable-next-line no-console
      console.error(`Status messages file not found: ${filePath}`);
      return null;
    }

    try {
      const fileContent = readFileSync(filePath, 'utf8');
      const messages: ApiStatusMessage[] = JSON.parse(fileContent);
      
      const messagesObj = messages.reduce((acc, msg) => {
        acc[msg.status] = msg;
        return acc;
      }, {} as Record<string, ApiStatusMessage>);

      // Update cache
      // @TODO: map
      // this.cachedMessages = messagesObj;
      this.lastLoadTime = Date.now();

      // eslint-disable-next-line no-console
      console.log(`✅ Loaded ${messages.length} status messages from: ${filePath}`);
      return messagesObj;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Error loading status messages from ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Get all available status codes
   */
  static getAvailableStatusCodes(): string[] {
    const messages = this.getStatusMessages();
    return Object.keys(messages).sort();
  }

  /**
   * Get status messages by category
   */
  static getStatusMessagesByCategory(category: StatusMessageCategory): StatusMessage[] {
    const messages = this.getStatusMessages();
    return Object.values(messages).filter(msg => msg.category === category);
  }

  /**
   * Get status messages by HTTP code
   */
  static getStatusMessagesByHttp(http: number): StatusMessage[] {
    const messages = this.getStatusMessages();
    return Object.values(messages).filter(msg => msg.http === http);
  }

  /**
   * Check if status code indicates success
   */
  static isSuccessStatus(statusCode: string): boolean {
    const message = this.getStatusMessage(statusCode);
    return message?.category === 'Result' || message?.http === 200;
  }

  /**
   * Check if status code indicates an error
   */
  static isErrorStatus(statusCode: string): boolean {
    const message = this.getStatusMessage(statusCode);
    return message?.category === 'Error';
  }

  /**
   * Check if status code indicates a warning/hint
   */
  static isWarningStatus(statusCode: string): boolean {
    const message = this.getStatusMessage(statusCode);
    return message?.category === 'Hint';
  }

  /**
   * Get statistics about loaded status messages
   */
  static getStatistics(): {
    total: number;
    byCategory: Record<string, number>;
    byHttp: Record<number, number>;
    source: 'file' | 'constants';
  } {
    const messages = this.getStatusMessages();
    const messageArray = Object.values(messages);
    
    const byCategory = messageArray.reduce((acc, msg) => {
      acc[msg.category] = (acc[msg.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byHttp = messageArray.reduce((acc, msg) => {
      acc[msg.http || 0] = (acc[msg.http || 0] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    return {
      total: messageArray.length,
      byCategory,
      byHttp,
      source: this.cachedMessages === FALLBACK_STATUS_MESSAGES ? 'constants' : 'file'
    };
  }
}
