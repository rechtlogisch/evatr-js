import { EvatrClient } from '../src';

async function apiInfoExample(): Promise<void> {
    const client = new EvatrClient();
    
    try {
      console.log('\n=== API Information ===');
      
      // Get status messages
      const statusMessages = await client.getStatusMessages();
      console.log('Number of status messages:', statusMessages.length);
      
      // Get EU member states
      const memberStates = await client.getEUMemberStates();
      console.log('Number of EU member states:', memberStates.length);
      console.log('Available member states:', memberStates.filter(state => state.available).map(state => `${state.code}: ${state.name}`));
      
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