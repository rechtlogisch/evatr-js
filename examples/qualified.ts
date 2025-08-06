import { EvatrClient, EvatrUtils } from '../src';

async function qualifiedExample(): Promise<void> {
  const client = new EvatrClient();

  try {
    // Qualified validation example
    console.log('\n=== Qualified VAT-ID Validation ===');
    const qualifiedResult = await client.validateQualified({
      vatIdOwn: 'DE123456789',
      vatIdForeign: 'ATU12345678',
      company: 'Musterhaus GmbH & Co KG',
      location: 'musterort',
      street: 'Musterstrasse 22',
      zip: '12345',
      // includeRaw: true,
    });

    console.log('Query time:', qualifiedResult.timestamp);
    console.log('Status:', qualifiedResult.status);
    console.log('Is success:', client.isSuccessStatus(qualifiedResult.status));
    // console.log('Raw:', qualifiedResult.raw);
    
    if (qualifiedResult.company) {
      console.log('Company name result:', qualifiedResult.company);
      console.log('Company name explanation:', EvatrUtils.explainQualifiedResultCode(qualifiedResult.company as any));
    }
    
    if (qualifiedResult.location) {
      console.log('City result:', qualifiedResult.location);
    }

    if (qualifiedResult.street) {
      console.log('Street result:', qualifiedResult.street);
    }

    if (qualifiedResult.zip) {
      console.log('Postal code result:', qualifiedResult.zip);
    }

  } catch (error) {
    console.error('Error occurred:', error);
  }
}

// Run examples
async function runExamples(): Promise<void> {
  await qualifiedExample();
}

if (require.main === module) {
  runExamples().catch(console.error);
}

export { qualifiedExample };
