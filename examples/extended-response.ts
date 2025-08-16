import { EvatrClient } from '../src';

async function extendedResponseExample(): Promise<void> {
  const client = new EvatrClient();

  try {
    // Simple validation example
    console.log('=== Simple VAT-ID Validation ===');
    const simpleResult = await client.validateSimple({
      vatIdOwn: 'DE123456789',
      vatIdForeign: 'ATU12345678'
    }, true);

    console.log('Query time (original):', simpleResult.timestamp.original);
    console.log('Query time (date):', simpleResult.timestamp.date.toISOString());
    console.log('Is valid:', simpleResult.valid);
    console.log('Status:', simpleResult.status);
    console.log('Message:', simpleResult.message);
  } catch (error) {
    console.error('Error occurred:', error);
  }
}

// Run examples
async function runExamples(): Promise<void> {
  await extendedResponseExample();
}

if (require.main === module) {
  runExamples().catch(console.error);
}

export { extendedResponseExample };
