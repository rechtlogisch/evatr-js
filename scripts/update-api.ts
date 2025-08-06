#!/usr/bin/env ts-node

/**
 * CLI script to check for and download API updates
 */

import { EvatrApiUpdater } from '../src/api-updater';

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    switch (command) {
      case 'check':
        await EvatrApiUpdater.checkAndUpdateAll();
        break;
      
      case 'api-docs':
        const apiResult = await EvatrApiUpdater.checkApiDocsUpdate();
        if (apiResult.hasUpdate) {
          console.log(`API Docs update available: ${apiResult.currentVersion} → ${apiResult.latestVersion}`);
          await EvatrApiUpdater.downloadApiDocs();
        } else {
          console.log('API Docs are up to date');
        }
        break;
      
      case 'status-messages':
        const statusResult = await EvatrApiUpdater.checkStatusMessagesUpdate();
        if (statusResult.hasUpdate && statusResult.diff) {
          console.log(`Status Messages update available: ${statusResult.currentVersion} → ${statusResult.latestVersion}`);
          EvatrApiUpdater.printStatusMessageDiff(statusResult.diff);
          await EvatrApiUpdater.downloadStatusMessages();
        } else {
          console.log('Status Messages are up to date');
        }
        break;
      
      case 'update-constants':
        const filepath = args[1];
        if (!filepath) {
          console.error('Please provide the path to the status messages file');
          process.exit(1);
        }
        await EvatrApiUpdater.updateConstantsFromFile(filepath);
        break;
      
      default:
        console.log(`
eVatR API Update Tool

Usage:
  npm run update-api check                    - Check for all updates
  npm run update-api api-docs                 - Check and download API docs
  npm run update-api status-messages          - Check and download status messages
  npm run update-api update-constants <file>  - Update constants.ts from file

Examples:
  npm run update-api update-constants ./docs/statusmeldungen-2025-08-03.json
        `);
        break;
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
