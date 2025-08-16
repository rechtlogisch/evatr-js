import { EvatrMigrationHelper as evatr } from '../src';

async function migrationExample(): Promise<void> {
  const simpleResult = await evatr.checkSimple({
    ownVatNumber: 'DE123456789',
    validateVatNumber: 'ATU12345678',
  });

  const qualifiedResult = await evatr.checkQualified({
    ownVatNumber: 'DE123456789',
    validateVatNumber: 'ATU12345678',
    companyName: 'Musterhaus GmbH & Co KG',
    city: 'Musterort',
    zip: '12345',
    street: 'Musterstrasse 22',
  });

  console.log(simpleResult);
  console.log(qualifiedResult);
}

// Run examples
async function runExamples(): Promise<void> {
  await migrationExample();
}

if (require.main === module) {
  runExamples().catch(console.error);
}

export { migrationExample };