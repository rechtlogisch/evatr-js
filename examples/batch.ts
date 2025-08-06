import { EvatrClient } from '../src';
import { apiInfoExample } from './api-info';

type batchResult = {
    vatId: string;
    isSuccess: boolean;
    status?: string;
    message?: string;
    error?: string;
}

async function validateMultipleVatIds(vatIds: string[]) {
    const results: batchResult[] = [];

    const client = new EvatrClient();

    for (const vatId of vatIds) {
        try {
            const result = await client.validateSimple({
                vatIdOwn: 'DE123456789',
                vatIdForeign: vatId
            });

            results.push({
                vatId,
                isSuccess: client.isSuccessStatus(result.status),
                status: result.status,
                message: client.getStatusMessage(result.status)?.message
            });

            // Add delay to respect rate limits
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            results.push({
                vatId,
                isSuccess: false,
                error: error.message
            });
        }
    }

    return results;
}

// Run examples
async function runExamples(): Promise<void> {
    await validateMultipleVatIds([
        'DE123456789',
        'ATU12346578'
    ]);
}

if (require.main === module) {
    runExamples().catch(console.error);
}

export { validateMultipleVatIds };