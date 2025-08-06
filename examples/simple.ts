import { EvatrClient } from '../src';

async function simpleExample(): Promise<void> {
  const client = new EvatrClient();

  try {
    // Simple validation example
    console.log('=== Simple VAT-ID Validation ===');
    const simpleResult = await client.validateSimple({
      vatIdOwn: 'DE123456789',
      vatIdForeign: 'ATU12345678',
    });

    console.log('Query time:', simpleResult.timestamp);
    console.log('Status:', simpleResult.status);
    console.log('Is success:', client.isSuccessStatus(simpleResult.status));
    
    const statusMessage = client.getStatusMessage(simpleResult.status);
    if (statusMessage) {
      console.log('Message:', statusMessage.message);
    }
  } catch (error) {
    console.error('Error occurred:', error);
  }
}

// Run examples
async function runExamples(): Promise<void> {
  await simpleExample();
}

if (require.main === module) {
  runExamples().catch(console.error);
}

export { simpleExample };
