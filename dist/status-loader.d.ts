/**
 * Dynamic status message loader for eVatR API
 */
import { ApiStatusMessage, StatusMessage, StatusMessageCategory } from './types';
/**
 * Status message loader that can load from files or fallback to constants
 */
export declare class StatusMessages {
    private static cache;
    private static cachedMessages;
    private static lastLoadTime;
    private static readonly CACHE_TTL;
    /**
     * Load status messages with caching
     */
    static getStatusMessages(): Record<string, StatusMessage>;
    /**
     * Load status messages with caching
     */
    static getAndCacheStatusMessages(): Record<string, StatusMessage>;
    /**
     * Get a specific status message
     */
    static getStatusMessage(statusCode: string): StatusMessage | undefined;
    /**
     * Clear the cache to force reload
     */
    static clearCache(): void;
    /**
     * Load status messages from file
     */
    static loadFromFile(): Record<string, StatusMessage> | null;
    /**
     * Load status messages from a specific file path
     */
    static loadFromPath(filePath: string): Record<string, ApiStatusMessage> | null;
    /**
     * Get all available status codes
     */
    static getAvailableStatusCodes(): string[];
    /**
     * Get status messages by category
     */
    static getStatusMessagesByCategory(category: StatusMessageCategory): StatusMessage[];
    /**
     * Get status messages by HTTP code
     */
    static getStatusMessagesByHttp(http: number): StatusMessage[];
    /**
     * Check if status code indicates success
     */
    static isSuccessStatus(statusCode: string): boolean;
    /**
     * Check if status code indicates an error
     */
    static isErrorStatus(statusCode: string): boolean;
    /**
     * Check if status code indicates a warning/hint
     */
    static isWarningStatus(statusCode: string): boolean;
    /**
     * Get statistics about loaded status messages
     */
    static getStatistics(): {
        total: number;
        byCategory: Record<string, number>;
        byHttp: Record<number, number>;
        source: 'file' | 'constants';
    };
}
//# sourceMappingURL=status-loader.d.ts.map