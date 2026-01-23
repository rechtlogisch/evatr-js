/**
 * Migration helper for backward compatibility with the evatr library
 * The XML-RPC eVatR was sunset on 2025-11-30
 *
 * Provides a similar API as https://github.com/qqilihq/evatr
 *
 * Some of the breaking changes:
 * - request
 *    - `includeRawXml` is here `includeRaw` (as server response is JSON)
 * - response
 *    - `rawXml` is here `raw` (as server response is JSON)
 *    - error codes do not match new status messages
 *    - errorDescription contains the message from the REST-API server not the message text based on errorCode of XML-RPC
 *    - status is additionally returned
 */
interface ISimpleParams {
    includeRaw?: boolean;
    ownVatNumber: string;
    validateVatNumber: string;
}
interface IQualifiedParams extends ISimpleParams {
    companyName: string;
    city: string;
    zip?: string;
    street?: string;
}
interface ISimpleResult {
    raw?: string;
    date: string;
    time: string;
    errorCode: number;
    errorDescription?: string;
    status?: string;
    ownVatNumber: string;
    validatedVatNumber: string;
    validFrom?: string;
    validUntil?: string;
    /** `true` if the given data was valid (i.e. error code is `200`). */
    valid: boolean;
}
interface IQualifiedResult extends ISimpleResult {
    companyName?: string;
    city?: string;
    zip?: string;
    street?: string;
    resultName?: ResultType;
    resultCity?: ResultType;
    resultZip?: ResultType;
    resultStreet?: ResultType;
    /** Human-readable, German description for the name result. */
    resultNameDescription?: string;
    /** Human-readable, German description for the city result. */
    resultCityDescription?: string;
    /** Human-readable, German description for the zip result. */
    resultZipDescription?: string;
    /** Human-readable, German description for the street result. */
    resultStreetDescription?: string;
}
export declare enum ResultType {
    MATCH = "A",
    NO_MATCH = "B",
    NOT_QUERIED = "C",
    NOT_RETURNED = "D"
}
/**
 * Migration helper class that provides the same API as the evatr library
 */
export declare class EvatrMigrationHelper {
    private static client;
    /**
     * Perform a simple VAT-ID validation
     * @param params Simple validation parameters
     * @returns Promise<ISimpleResult>
     */
    static checkSimple(params: ISimpleParams): Promise<ISimpleResult>;
    /**
     * Perform a qualified VAT-ID validation
     * @param params Qualified validation parameters
     * @returns Promise<IQualifiedResult>
     */
    static checkQualified(params: IQualifiedParams): Promise<IQualifiedResult>;
    /**
     * Map status codes to HTTP-like error codes for backward compatibility
     */
    private static mapStatusToErrorCode;
    /**
     * Get human-readable description for result types
     */
    private static getResultDescription;
}
export {};
//# sourceMappingURL=migration-helper.d.ts.map
