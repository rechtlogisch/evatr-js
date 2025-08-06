/**
 * Main client class for the eVatR API
 */
import { EUMemberState, EvatrClientConfig, ExtendedResponse, QualifiedRequest, Request, Response, SimpleRequest, StatusMessage } from './types';
/**
 * EvatrClient - Main client for interacting with the eVatR API
 */
export declare class EvatrClient {
    private readonly httpClient;
    constructor(config?: EvatrClientConfig);
    /**
     * Perform a simple VAT-ID validation (only checks validity)
     * @param request Simple validation request with VAT-IDs only
     * @param extended If true, returns ExtendedResponse with mapped dates and additional info
     * @returns Promise<Response | ExtendedResponse>
     */
    validateSimple(request: SimpleRequest): Promise<Response>;
    validateSimple(request: SimpleRequest, extended: true): Promise<ExtendedResponse>;
    validateSimple(request: SimpleRequest, extended: false): Promise<Response>;
    /**
     * Perform a qualified VAT-ID validation (checks validity and company data)
     * @param request Qualified validation request with company data
     * @param extended If true, returns ExtendedResponse with mapped dates and additional info
     * @returns Promise<Response | ExtendedResponse>
     */
    validateQualified(request: QualifiedRequest): Promise<Response>;
    validateQualified(request: QualifiedRequest, extended: true): Promise<ExtendedResponse>;
    validateQualified(request: QualifiedRequest, extended: false): Promise<Response>;
    /**
     * Perform VAT-ID validation with full request object
     * @param request Full validation request
     * @param extended If true, returns ExtendedResponse with mapped dates and additional info
     * @returns Promise<Response | ExtendedResponse>
     */
    validate(request: Request): Promise<Response>;
    validate(request: Request, extended: true): Promise<ExtendedResponse>;
    validate(request: Request, extended: false): Promise<Response>;
    /**
     * Get status messages from the API
     * @returns Promise<StatusMessage[]>
     */
    getStatusMessages(): Promise<StatusMessage[]>;
    /**
     * Get EU member states and their availability
     * @returns Promise<ApiEUMemberState[]>
     */
    getEUMemberStates(): Promise<EUMemberState[]>;
    /**
     * Get status message by status code
     * @param statusCode Status code (e.g., "evatr-0000")
     * @returns StatusMessage or undefined if not found
     */
    getStatusMessage(statusCode: string): StatusMessage | undefined;
    /**
     * Check if a status code indicates success
     * @param statusCode Status code to check
     * @returns boolean
     */
    isSuccessStatus(statusCode: string): boolean;
    /**
     * Check if a status code indicates an error
     * @param statusCode Status code to check
     * @returns boolean
     */
    isErrorStatus(statusCode: string): boolean;
    /**
     * Check if a status code indicates a warning/hint
     * @param statusCode Status code to check
     * @returns boolean
     */
    isWarningStatus(statusCode: string): boolean;
    /**
     * Validate VAT-ID format (basic syntax check)
     * @param vatId VAT-ID to validate
     * @returns boolean
     */
    static checkVatIdSyntax(vatId: string): boolean;
    /**
     * Extract country code from VAT-ID
     * @param vatId VAT-ID
     * @returns string Country code
     */
    static getCountryCode(vatId: string): string;
    /**
     * Format VAT-ID by removing spaces and converting to uppercase
     * @param vatId VAT-ID to format
     * @returns string Formatted VAT-ID
     */
    static normalizeVatId(vatId: string): string;
    /**
     * Maps parameters to API property names
     */
    private mapToApiParams;
    /**
     * Maps API response to parameters
     */
    private mapFromApiResponse;
    /**
     * Maps basic Response to ExtendedResponse with date objects and additional info
     */
    private mapToExtendedResponse;
    /**
     * Internal method to perform the actual validation request
     */
    private performValidation;
    /**
     * Handle and transform errors
     */
    private handleError;
}
//# sourceMappingURL=client.d.ts.map