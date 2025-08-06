import { ApiStatusMessage, StatusMessage } from './types';
export interface ApiDocsInfo {
    title: string;
    description: string;
    version: string;
}
export interface UpdateCheckResult {
    hasUpdate: boolean;
    currentVersion?: string;
    latestVersion?: string;
    downloadUrl?: string;
}
export interface StatusMessageDiff {
    added: ApiStatusMessage[];
    removed: ApiStatusMessage[];
    modified: Array<{
        status: string;
        old: ApiStatusMessage;
        new: ApiStatusMessage;
    }>;
}
/**
 * API Update utilities for eVatR API
 */
export declare class EvatrApiUpdater {
    private static readonly API_DOCS_URL;
    private static readonly DOCS_DIR;
    /**
     * Check for new API documentation version
     */
    static checkApiDocsUpdate(): Promise<UpdateCheckResult>;
    /**
     * Download and save new API documentation
     */
    static downloadApiDocs(): Promise<string>;
    /**
     * Check for new status messages
     */
    static checkStatusMessagesUpdate(): Promise<UpdateCheckResult & {
        diff?: StatusMessageDiff;
    }>;
    /**
     * Download and save new status messages
     */
    static downloadStatusMessages(): Promise<string>;
    /**
     * Compare two sets of status messages and return differences
     */
    private static compareStatusMessages;
    /**
     * Print status message differences in a readable format
     */
    static printStatusMessageDiff(diff: StatusMessageDiff): void;
    /**
     * Update constants.ts file with new status messages
     */
    static updateConstantsFile(statusMessages: StatusMessage[]): Promise<void>;
    /**
     * Run complete update check and download if needed
     */
    static checkAndUpdateAll(): Promise<void>;
    /**
     * Update constants from a downloaded status messages file
     */
    static updateConstantsFromFile(filepath: string): Promise<void>;
}
//# sourceMappingURL=api-updater.d.ts.map