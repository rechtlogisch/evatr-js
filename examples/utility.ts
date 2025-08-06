import { EvatrUtils } from '../src';

async function utilityExample(): Promise<void> {
  console.log('\n=== Utility Functions ===');
  
  // VAT-ID validation
  console.log('DE123456789 has a valid German VAT-ID syntax:', EvatrUtils.checkVatIdSyntaxForCountry('DE123456789', 'DE'));
  console.log('ATU12345678 has a valid Austrian VAT-ID syntax:', EvatrUtils.checkVatIdSyntaxForCountry('ATU12345678', 'AT'));
  
  // Country information
  console.log('Country for DE:', EvatrUtils.getCountryName('DE'));
  console.log('Is DE an EU member:', EvatrUtils.isEUMemberState('DE'));
  
  // Validation capability check
  console.log('Can DE validate AT:', EvatrUtils.canValidate('DE123456789', 'ATU12345678'));
  console.log('Can DE validate DE:', EvatrUtils.canValidate('DE123456789', 'DE987654321'));
  
  // Get test VAT-IDs
  const testIds = EvatrUtils.getTestVatIds();
  console.log('Test VAT-IDs:', testIds);
}

if (require.main === module) {
  utilityExample().catch(console.error);
}

export { utilityExample };