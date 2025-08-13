import { EvatrClient } from '../src';

async function apiInfoExample(): Promise<void> {
    const client = new EvatrClient();
    
    try {
      console.log('\n=== API Information ===');
      
      // Get status messages
      const statusMessages = await client.getStatusMessages();
      console.log('Number of status messages:', statusMessages.length);
      
      // Get availability map by EU member state
      const availability = await client.getAvailability();
      const codes = Object.keys(availability);
      console.log('Number of EU member states:', codes.length);
      const availableCodes = codes.filter((code) => availability[code]);
      console.log('Available member states (codes):', availableCodes.join(', '));
      
    } catch (error) {
      console.error('Error getting API info:', error);
    }
  }

  // Run examples
  async function runExamples(): Promise<void> {
    await apiInfoExample();
  }
  
  if (require.main === module) {
    runExamples().catch(console.error);
  }
  
  export { apiInfoExample };