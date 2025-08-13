"use strict";
/**
 * Dynamic status message loader for eVatR API
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusMessages = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const constants_1 = require("./constants");
/**
 * Status message loader that can load from files or fallback to constants
 */
class StatusMessages {
    /**
     * Load status messages with caching
     */
    static getStatusMessages() {
        if (this.cache === false) {
            return constants_1.STATUS_MESSAGES;
        }
        return this.getAndCacheStatusMessages();
    }
    /**
     * Load status messages with caching
     */
    static getAndCacheStatusMessages() {
        const now = Date.now();
        // Return cached messages if still valid
        if (this.cachedMessages && now - this.lastLoadTime < this.CACHE_TTL) {
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
        this.cachedMessages = constants_1.STATUS_MESSAGES;
        this.lastLoadTime = now;
        return constants_1.STATUS_MESSAGES;
    }
    /**
     * Get a specific status message
     */
    static getStatusMessage(statusCode) {
        const messages = this.getStatusMessages();
        return messages[statusCode];
    }
    /**
     * Clear the cache to force reload
     */
    static clearCache() {
        this.cachedMessages = null;
        this.lastLoadTime = 0;
    }
    /**
     * Load status messages from file
     */
    static loadFromFile() {
        const possiblePaths = [
            // Try docs directory first
            (0, path_1.join)(process.cwd(), 'docs', 'statusmeldungen.json'),
            // Try relative to this file
            (0, path_1.join)(__dirname, '..', '..', 'docs', 'statusmeldungen.json'),
            // Try current directory
            (0, path_1.join)(process.cwd(), 'statusmeldungen.json'),
        ];
        for (const path of possiblePaths) {
            if ((0, fs_1.existsSync)(path)) {
                try {
                    const fileContent = (0, fs_1.readFileSync)(path, 'utf8');
                    const messages = JSON.parse(fileContent);
                    // Convert array to object keyed by status code
                    const messagesObj = messages.reduce((acc, msg) => {
                        acc[msg.status] = msg;
                        return acc;
                    }, {});
                    // eslint-disable-next-line no-console
                    console.log(`✅ Loaded ${messages.length} status messages from: ${path}`);
                    return messagesObj;
                }
                catch (error) {
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
    static loadFromPath(filePath) {
        if (!(0, fs_1.existsSync)(filePath)) {
            // eslint-disable-next-line no-console
            console.error(`Status messages file not found: ${filePath}`);
            return null;
        }
        try {
            const fileContent = (0, fs_1.readFileSync)(filePath, 'utf8');
            const messages = JSON.parse(fileContent);
            const messagesObj = messages.reduce((acc, msg) => {
                acc[msg.status] = msg;
                return acc;
            }, {});
            // Update cache
            // @TODO: map
            // this.cachedMessages = messagesObj;
            this.lastLoadTime = Date.now();
            // eslint-disable-next-line no-console
            console.log(`✅ Loaded ${messages.length} status messages from: ${filePath}`);
            return messagesObj;
        }
        catch (error) {
            // eslint-disable-next-line no-console
            console.error(`Error loading status messages from ${filePath}:`, error);
            return null;
        }
    }
    /**
     * Get all available status codes
     */
    static getAvailableStatusCodes() {
        const messages = this.getStatusMessages();
        return Object.keys(messages).sort();
    }
    /**
     * Get status messages by category
     */
    static getStatusMessagesByCategory(category) {
        const messages = this.getStatusMessages();
        return Object.values(messages).filter((msg) => msg.category === category);
    }
    /**
     * Get status messages by HTTP code
     */
    static getStatusMessagesByHttp(http) {
        const messages = this.getStatusMessages();
        return Object.values(messages).filter((msg) => msg.http === http);
    }
    /**
     * Check if status code indicates success
     */
    static isSuccessStatus(statusCode) {
        const message = this.getStatusMessage(statusCode);
        return message?.category === 'Result' || message?.http === 200;
    }
    /**
     * Check if status code indicates an error
     */
    static isErrorStatus(statusCode) {
        const message = this.getStatusMessage(statusCode);
        return message?.category === 'Error';
    }
    /**
     * Check if status code indicates a warning/hint
     */
    static isWarningStatus(statusCode) {
        const message = this.getStatusMessage(statusCode);
        return message?.category === 'Hint';
    }
    /**
     * Get statistics about loaded status messages
     */
    static getStatistics() {
        const messages = this.getStatusMessages();
        const messageArray = Object.values(messages);
        const byCategory = messageArray.reduce((acc, msg) => {
            acc[msg.category] = (acc[msg.category] || 0) + 1;
            return acc;
        }, {});
        const byHttp = messageArray.reduce((acc, msg) => {
            acc[msg.http || 0] = (acc[msg.http || 0] || 0) + 1;
            return acc;
        }, {});
        return {
            total: messageArray.length,
            byCategory,
            byHttp,
            source: this.cachedMessages === constants_1.STATUS_MESSAGES ? 'constants' : 'file',
        };
    }
}
exports.StatusMessages = StatusMessages;
StatusMessages.cache = false; // currently disabled by default, without a way to enable it programatically
StatusMessages.cachedMessages = null;
StatusMessages.lastLoadTime = 0;
StatusMessages.CACHE_TTL = 5 * 60 * 1000; // 5 minutes
//# sourceMappingURL=status-loader.js.map