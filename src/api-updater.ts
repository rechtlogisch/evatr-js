/* eslint-disable no-console */

/**
 * Utilities for checking and updating API documentation and status messages
 */

import axios from 'axios';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { DEFAULT_HOST, ENDPOINTS } from './constants';
import { join } from 'path';
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
export class EvatrApiUpdater {
  private static readonly API_DOCS_URL = DEFAULT_HOST + '/api-docs';
  private static readonly DOCS_DIR = './docs';

  /**
   * Check for new API documentation version
   */
  static async checkApiDocsUpdate(): Promise<UpdateCheckResult> {
    try {
      console.log('Checking for API documentation updates...');

      // Fetch current API docs
      const response = await axios.get(this.API_DOCS_URL);
      const apiDocs = response.data;

      const latestVersion = apiDocs.info?.version;
      if (!latestVersion) {
        throw new Error('Could not extract version from API docs');
      }

      // Check if we have a local version
      const localApiDocsPath = join(this.DOCS_DIR, 'api-docs.json');
      let currentVersion: string | undefined;

      if (existsSync(localApiDocsPath)) {
        try {
          const localDocs = JSON.parse(readFileSync(localApiDocsPath, 'utf8'));
          currentVersion = localDocs.info?.version;
        } catch (error) {
          console.warn('Could not read local API docs version:', error);
        }
      }

      const hasUpdate = !currentVersion || currentVersion !== latestVersion;

      return {
        hasUpdate,
        currentVersion,
        latestVersion,
        downloadUrl: this.API_DOCS_URL,
      };
    } catch (error) {
      console.error('Error checking API docs update:', error);
      throw error;
    }
  }

  /**
   * Download and save new API documentation
   */
  static async downloadApiDocs(): Promise<string> {
    try {
      console.log('Downloading latest API documentation...');

      const response = await axios.get(this.API_DOCS_URL);
      const apiDocs = response.data;

      const version = apiDocs.info?.version || 'unknown';
      const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

      // Save with version and date
      const filename = `api-docs-${version}-${timestamp}.json`;
      const filepath = join(this.DOCS_DIR, filename);

      writeFileSync(filepath, JSON.stringify(apiDocs, null, 2));

      console.log(`💾 API documentation saved to: ${filename}`);
      console.log(`🚧 Please review api-docs manually for any relevant changes.`);

      return filepath;
    } catch (error) {
      console.error('Error downloading API docs:', error);
      throw error;
    }
  }

  /**
   * Check for new status messages
   */
  static async checkStatusMessagesUpdate(): Promise<
    UpdateCheckResult & { diff?: StatusMessageDiff }
  > {
    try {
      console.log('Checking for status messages updates...');

      // Fetch current status messages from API
      const response = await axios.get(ENDPOINTS.STATUS_MESSAGES);
      const latestMessages: ApiStatusMessage[] = response.data;

      // Load local status messages
      const localStatusPath = join(this.DOCS_DIR, 'statusmeldungen.json');
      let currentMessages: ApiStatusMessage[] = [];

      if (existsSync(localStatusPath)) {
        try {
          currentMessages = JSON.parse(readFileSync(localStatusPath, 'utf8'));
        } catch (error) {
          console.warn('Could not read local status messages:', error);
        }
      }

      // Compare messages
      const diff = this.compareStatusMessages(currentMessages, latestMessages);
      const hasUpdate =
        diff.added.length > 0 || diff.removed.length > 0 || diff.modified.length > 0;

      return {
        hasUpdate,
        currentVersion: `${currentMessages.length} messages`,
        latestVersion: `${latestMessages.length} messages`,
        downloadUrl: ENDPOINTS.STATUS_MESSAGES,
        diff,
      };
    } catch (error) {
      console.error('Error checking status messages update:', error);
      throw error;
    }
  }

  /**
   * Download and save new status messages
   */
  static async downloadStatusMessages(): Promise<string> {
    try {
      console.log('Downloading latest status messages...');

      const response = await axios.get(ENDPOINTS.STATUS_MESSAGES);
      const statusMessages: ApiStatusMessage[] = response.data;

      const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

      // Save with date
      const filename = `statusmeldungen-${timestamp}.json`;
      const filepath = join(this.DOCS_DIR, filename);

      writeFileSync(filepath, JSON.stringify(statusMessages, null, 2));

      // Also update the main statusmeldungen.json file
      const mainFilepath = join(this.DOCS_DIR, 'statusmeldungen.json');
      writeFileSync(mainFilepath, JSON.stringify(statusMessages, null, 2));

      console.log(`✅ Status messages saved to: ${filename}`);
      return filepath;
    } catch (error) {
      console.error('Error downloading status messages:', error);
      throw error;
    }
  }

  /**
   * Compare two sets of status messages and return differences
   */
  private static compareStatusMessages(
    current: ApiStatusMessage[],
    latest: ApiStatusMessage[]
  ): StatusMessageDiff {
    const currentMap = new Map(current.map((msg) => [msg.status, msg]));
    const latestMap = new Map(latest.map((msg) => [msg.status, msg]));

    const added: ApiStatusMessage[] = [];
    const removed: ApiStatusMessage[] = [];
    const modified: Array<{ status: string; old: ApiStatusMessage; new: ApiStatusMessage }> = [];

    // Find added and modified messages
    for (const [status, latestMsg] of latestMap) {
      const currentMsg = currentMap.get(status);
      if (!currentMsg) {
        added.push(latestMsg);
      } else if (JSON.stringify(currentMsg) !== JSON.stringify(latestMsg)) {
        modified.push({ status, old: currentMsg, new: latestMsg });
      }
    }

    // Find removed messages
    for (const [status, currentMsg] of currentMap) {
      if (!latestMap.has(status)) {
        removed.push(currentMsg);
      }
    }

    return { added, removed, modified };
  }

  /**
   * Print status message differences in a readable format
   */
  static printStatusMessageDiff(diff: StatusMessageDiff): void {
    console.log('\n=== Status Messages Differences ===');

    if (diff.added.length > 0) {
      console.log(`\n➕ Added (${diff.added.length}):`);
      diff.added.forEach((msg) => {
        console.log(`  ${msg.status}: ${msg.meldung}`);
      });
    }

    if (diff.removed.length > 0) {
      console.log(`\n➖ Removed (${diff.removed.length}):`);
      diff.removed.forEach((msg) => {
        console.log(`  ${msg.status}: ${msg.meldung}`);
      });
    }

    if (diff.modified.length > 0) {
      console.log(`\n🔄 Modified (${diff.modified.length}):`);
      diff.modified.forEach(({ status, old, new: newMsg }) => {
        console.log(`  ${status}:`);
        console.log(`    Old: ${old.meldung}`);
        console.log(`    New: ${newMsg.meldung}`);
      });
    }

    if (diff.added.length === 0 && diff.removed.length === 0 && diff.modified.length === 0) {
      console.log('✅ No differences found');
    }
  }

  /**
   * Update constants.ts file with new status messages
   */
  static async updateConstantsFile(statusMessages: StatusMessage[]): Promise<void> {
    try {
      console.log('Updating constants.ts with new status messages...');

      // Create the status messages object
      const statusMessagesObj = statusMessages.reduce(
        (acc, msg) => {
          acc[msg.status] = msg;
          return acc;
        },
        {} as Record<string, StatusMessage>
      );

      // Read current constants file
      const constantsPath = './src/constants.ts';
      const constantsContent = readFileSync(constantsPath, 'utf8');

      // Replace the STATUS_MESSAGES object
      const statusMessagesStr = JSON.stringify(statusMessagesObj, null, 2).replace(/"/g, "'");

      const newConstantsContent = constantsContent.replace(
        /export const STATUS_MESSAGES: Record<string, ApiStatusMessage> = \{[\s\S]*?\};/,
        `export const STATUS_MESSAGES: Record<string, StatusMessage> = ${statusMessagesStr};`
      );

      writeFileSync(constantsPath, newConstantsContent);
      console.log('✅ Constants file updated');
    } catch (error) {
      console.error('Error updating constants file:', error);
      throw error;
    }
  }

  /**
   * Run complete update check and download if needed
   */
  static async checkAndUpdateAll(): Promise<void> {
    console.log('🔍 Checking for eVatR API updates...\n');

    try {
      // Check API docs
      const apiDocsResult = await this.checkApiDocsUpdate();
      if (apiDocsResult.hasUpdate) {
        console.log(
          `🔄 API docs update available: ${apiDocsResult.currentVersion} → ${apiDocsResult.latestVersion}`
        );
        await this.downloadApiDocs();
      } else {
        console.log('📄 API docs are up to date');
      }

      // Check status messages
      const statusResult = await this.checkStatusMessagesUpdate();
      if (statusResult.hasUpdate && statusResult.diff) {
        console.log(
          `📋 Status Messages update available: ${statusResult.currentVersion} → ${statusResult.latestVersion}`
        );
        this.printStatusMessageDiff(statusResult.diff);

        const filepath = await this.downloadStatusMessages();

        // Ask if user wants to update constants.ts
        console.log(
          '\n❓ Would you like to update the constants.ts file with the new status messages?'
        );
        console.log('   You can run: EvatrApiUpdater.updateConstantsFromFile("' + filepath + '")');
      } else {
        console.log('📋 Status Messages are up to date');
      }

      console.log('\n✅ Update check completed');
    } catch (error) {
      console.error('❌ Error during update check:', error);
      throw error;
    }
  }

  /**
   * Update constants from a downloaded status messages file
   */
  static async updateConstantsFromFile(filepath: string): Promise<void> {
    try {
      const apiStatusMessages: ApiStatusMessage[] = JSON.parse(readFileSync(filepath, 'utf8'));

      const statusMessages: StatusMessage[] = apiStatusMessages.map(
        (msg) => ({
          status: msg.status,
          message: msg.meldung,
          category:
            msg.kategorie === 'Ergebnis' ? 'Result' : msg.kategorie === 'Fehler' ? 'Error' : 'Hint',
          http: msg.httpcode,
        }),
        {} as Record<string, StatusMessage>
      );

      await this.updateConstantsFile(statusMessages);
    } catch (error) {
      console.error('Error updating constants from file:', error);
      throw error;
    }
  }
}
