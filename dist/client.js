"use strict";
/**
 * Main client class for the eVatR API
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvatrClient = void 0;
const axios_1 = __importDefault(require("axios"));
const constants_1 = require("./constants");
const status_loader_1 = require("./status-loader");
/**
 * EvatrClient - Main client for interacting with the eVatR API
 */
class EvatrClient {
    constructor(config = {}) {
        const { timeout = 30000, headers = {}, } = config;
        this.httpClient = axios_1.default.create({
            timeout,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...headers,
            },
        });
        // Add response interceptor for error handling
        this.httpClient.interceptors.response.use((response) => response, (error) => {
            const evatrError = new Error(error.response?.data?.message || error.message || 'Unknown error');
            evatrError.name = 'EvatrApiError';
            evatrError.http = error.response?.status;
            evatrError.status = error.response?.data?.status;
            evatrError.field = error.response?.data?.field;
            throw evatrError;
        });
    }
    async validateSimple(request, extended) {
        const payload = {
            vatIdOwn: request.vatIdOwn,
            vatIdForeign: request.vatIdForeign,
            includeRaw: request.includeRaw,
        };
        return this.performValidation(payload, extended);
    }
    async validateQualified(request, extended) {
        const payload = {
            vatIdOwn: request.vatIdOwn,
            vatIdForeign: request.vatIdForeign,
            company: request.company,
            location: request.location,
            street: request.street,
            zip: request.zip,
            includeRaw: request.includeRaw,
        };
        return this.performValidation(payload, extended);
    }
    async validate(request, extended) {
        return this.performValidation(request, extended);
    }
    /**
     * Get status messages from the API
     * @returns Promise<StatusMessage[]>
     */
    async getStatusMessages() {
        try {
            const response = await this.httpClient.get(constants_1.ENDPOINTS.STATUS_MESSAGES);
            return response.data.map(apiMsg => ({
                status: apiMsg.status,
                category: apiMsg.kategorie === 'Ergebnis' ? 'Result' : apiMsg.kategorie === 'Fehler' ? 'Error' : apiMsg.kategorie === 'Hinweis' ? 'Hint' : undefined,
                http: apiMsg.httpcode,
                message: apiMsg.meldung,
                field: apiMsg.feld,
            }));
        }
        catch (error) {
            throw this.handleError(error);
        }
    }
    /**
     * Get EU member states and their availability
     * @returns Promise<ApiEUMemberState[]>
     */
    async getEUMemberStates() {
        try {
            const response = await this.httpClient.get(constants_1.ENDPOINTS.EU_MEMBER_STATES);
            return response.data.map(apiState => ({
                code: apiState.alpha2,
                available: apiState.verfuegbar,
            }));
        }
        catch (error) {
            throw this.handleError(error);
        }
    }
    /**
     * Get status message by status code
     * @param statusCode Status code (e.g., "evatr-0000")
     * @returns StatusMessage or undefined if not found
     */
    getStatusMessage(statusCode) {
        return status_loader_1.StatusMessages.getStatusMessage(statusCode);
    }
    /**
     * Check if a status code indicates success
     * @param statusCode Status code to check
     * @returns boolean
     */
    isSuccessStatus(statusCode) {
        return status_loader_1.StatusMessages.isSuccessStatus(statusCode);
    }
    /**
     * Check if a status code indicates an error
     * @param statusCode Status code to check
     * @returns boolean
     */
    isErrorStatus(statusCode) {
        return status_loader_1.StatusMessages.isErrorStatus(statusCode);
    }
    /**
     * Check if a status code indicates a warning/hint
     * @param statusCode Status code to check
     * @returns boolean
     */
    isWarningStatus(statusCode) {
        return status_loader_1.StatusMessages.isWarningStatus(statusCode);
    }
    /**
     * Validate VAT-ID format (basic syntax check)
     * @param vatId VAT-ID to validate
     * @returns boolean
     */
    static checkVatIdSyntax(vatId) {
        if (!vatId || typeof vatId !== 'string') {
            return false;
        }
        const cleanVatId = this.normalizeVatId(vatId);
        // Must start with exactly 2 letters (country code)
        if (!/^[A-Z]{2}/.test(cleanVatId)) {
            return false;
        }
        const countryCode = cleanVatId.substring(0, 2);
        const pattern = constants_1.VATID_PATTERNS[countryCode];
        if (!pattern) {
            return false;
        }
        return pattern.test(cleanVatId);
    }
    /**
     * Extract country code from VAT-ID
     * @param vatId VAT-ID
     * @returns string Country code
     */
    static getCountryCode(vatId) {
        return this.normalizeVatId(vatId).substring(0, 2);
    }
    /**
     * Format VAT-ID by removing spaces and converting to uppercase
     * @param vatId VAT-ID to format
     * @returns string Formatted VAT-ID
     */
    static normalizeVatId(vatId) {
        return vatId.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    }
    /**
     * Maps parameters to API property names
     */
    mapToApiParams(request) {
        return {
            anfragendeUstid: request.vatIdOwn,
            angefragteUstid: request.vatIdForeign,
            firmenname: request.company,
            ort: request.location,
            strasse: request.street,
            plz: request.zip,
        };
    }
    /**
     * Maps API response to parameters
     */
    mapFromApiResponse(response, vatIdOwn, vatIdForeign) {
        return {
            timestamp: response.anfrageZeitpunkt,
            status: response.status,
            vatIdOwn,
            vatIdForeign,
            validFrom: response.gueltigAb,
            validTill: response.gueltigBis,
            company: response.ergFirmenname,
            street: response.ergStrasse,
            zip: response.ergPlz,
            location: response.ergOrt,
        };
    }
    /**
     * Maps basic Response to ExtendedResponse with date objects and additional info
     */
    mapToExtendedResponse(response) {
        const statusMessage = this.getStatusMessage(response.status);
        return {
            timestamp: new Date(response.timestamp),
            valid: this.isSuccessStatus(response.status),
            status: response.status,
            message: statusMessage?.message || undefined,
            vatIdOwn: response.vatIdOwn,
            vatIdForeign: response.vatIdForeign,
            validFrom: response.validFrom ? new Date(response.validFrom) : undefined,
            validTill: response.validTill ? new Date(response.validTill) : undefined,
            company: response.company,
            street: response.street,
            zip: response.zip,
            location: response.location,
            raw: response.raw,
        };
    }
    /**
     * Internal method to perform the actual validation request
     */
    async performValidation(request, extended) {
        try {
            // Validate input
            if (!request.vatIdOwn || !request.vatIdForeign) {
                throw new Error('Both vatIdOwn and vatIdForeign are required');
            }
            // Format VAT-IDs
            const formattedRequest = {
                ...request,
                vatIdOwn: EvatrClient.normalizeVatId(request.vatIdOwn),
                vatIdForeign: EvatrClient.normalizeVatId(request.vatIdForeign),
            };
            // Validate VAT-ID formats
            if (!EvatrClient.checkVatIdSyntax(formattedRequest.vatIdOwn)) {
                throw new Error(`Invalid format for vatIdOwn: ${formattedRequest.vatIdOwn}`);
            }
            if (!EvatrClient.checkVatIdSyntax(formattedRequest.vatIdForeign)) {
                throw new Error(`Invalid format for vatIdForeign: ${formattedRequest.vatIdForeign}`);
            }
            // Map to API parameters for the actual request
            const apiPayload = this.mapToApiParams(formattedRequest);
            const response = await this.httpClient.post(constants_1.ENDPOINTS.VALIDATION, apiPayload);
            // Map API response to English property names
            const basicResponse = this.mapFromApiResponse(response.data, formattedRequest.vatIdOwn, formattedRequest.vatIdForeign);
            // Include raw response data if requested
            if (request.includeRaw === true) {
                const rawData = {
                    headers: response.headers,
                    data: response.data
                };
                basicResponse.raw = JSON.stringify(rawData);
            }
            if (extended) {
                return this.mapToExtendedResponse(basicResponse);
            }
            return basicResponse;
        }
        catch (error) {
            throw this.handleError(error);
        }
    }
    /**
     * Handle and transform errors
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handleError(error) {
        if (error.name === 'EvatrApiError') {
            return error;
        }
        const evatrError = new Error(error.message || 'Unknown error occurred');
        evatrError.name = 'EvatrApiError';
        if (error.response) {
            evatrError.http = error.response.status;
            evatrError.status = error.response.data?.status;
            evatrError.field = error.response.data?.field;
        }
        return evatrError;
    }
}
exports.EvatrClient = EvatrClient;
//# sourceMappingURL=client.js.map