/**
 * Example demonstrating API update functionality
 */

import { EvatrApiUpdater, StatusMessages } from '../src';
import { StatusMessageCategory } from '../src/types';

async function demonstrateUpdateCheck(): Promise<void> {
  console.log('=== eVatR API Update Check Demo ===\n');

  try {
    // Show current status message statistics
    console.log('📊 Current Status Message Statistics:');
    const stats = StatusMessages.getStatistics();
    console.log(`  Total messages: ${stats.total}`);
    console.log(`  Source: ${stats.source}`);
    console.log('  By category:', stats.byCategory);
    console.log('  By HTTP code:', stats.byHttp);
    console.log();

    // Check for API documentation updates
    console.log('🔍 Checking API Documentation...');
    const apiResult = await EvatrApiUpdater.checkApiDocsUpdate();
    
    if (apiResult.hasUpdate) {
      console.log(`✨ API Docs update available!`);
      console.log(`   Current: ${apiResult.currentVersion || 'Not found'}`);
      console.log(`   Latest: ${apiResult.latestVersion}`);
      console.log('   Run: npm run update-api api-docs');
    } else {
      console.log('✅ API Documentation is up to date');
    }
    console.log();

    // Check for status message updates
    console.log('🔍 Checking Status Messages...');
    const statusResult = await EvatrApiUpdater.checkStatusMessagesUpdate();
    
    if (statusResult.hasUpdate && statusResult.diff) {
      console.log(`✨ Status Messages update available!`);
      console.log(`   Current: ${statusResult.currentVersion}`);
      console.log(`   Latest: ${statusResult.latestVersion}`);
      
      // Show differences
      EvatrApiUpdater.printStatusMessageDiff(statusResult.diff);
      
      console.log('\n   Run: npm run update-api status-messages');
    } else {
      console.log('✅ Status Messages are up to date');
    }
    console.log();

    // Demonstrate status message lookup
    console.log('📋 Status Message Examples:');
    const exampleCodes = ['evatr-0000', 'evatr-0004', 'evatr-2001'];
    
    for (const code of exampleCodes) {
      const message = StatusMessages.getStatusMessage(code);
      if (message) {
        console.log(`  ${code}: ${message.message}`);
        console.log(`    Category: ${message.category}, HTTP: ${message.http}`);
      }
    }
    console.log();

    // Show status messages by category
    console.log('📂 Status Messages by Category:');
    const categories: StatusMessageCategory[] = ['Result', 'Hint', 'Error'];
    
    for (const category of categories) {
      const messages = StatusMessages.getStatusMessagesByCategory(category);
      console.log(`  ${category}: ${messages.length} messages`);
    }

  } catch (error) {
    console.error('❌ Error during update check:', error);
  }
}

async function demonstrateFullUpdate(): Promise<void> {
  console.log('\n=== Full Update Check ===');
  
  try {
    await EvatrApiUpdater.checkAndUpdateAll();
  } catch (error) {
    console.error('❌ Error during full update:', error);
  }
}

// Run demonstrations
async function runDemo(): Promise<void> {
  await demonstrateUpdateCheck();
  
  // Uncomment to run full update check (downloads files)
  // await demonstrateFullUpdate();
}

if (require.main === module) {
  runDemo().catch(console.error);
}

export { demonstrateUpdateCheck, demonstrateFullUpdate };
