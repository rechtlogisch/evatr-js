/**
 * Main client class for the eVatR API
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  ApiEUMemberState,
  ApiRequest,
  ApiResponse,
  ApiStatusMessage,
  EUMemberState,
  EvatrApiError,
  EvatrClientConfig,
  ExtendedResponse,
  QualifiedRequest,
  Request,
  Response,
  SimpleRequest,
  StatusMessage,
} from './types';
import { ENDPOINTS, VATID_PATTERNS } from './constants';
import { StatusMessages } from './status-loader';

/**
 * EvatrClient - Main client for interacting with the eVatR API
 */
export class EvatrClient {
  private readonly httpClient: AxiosInstance;

  constructor(config: EvatrClientConfig = {}) {
    const { timeout = 30000, headers = {} } = config;

    this.httpClient = axios.create({
      timeout,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...headers,
      },
    });

    // Add response interceptor for error handling
    this.httpClient.interceptors.response.use(
      (response) => response,
      (error) => {
        const evatrError: EvatrApiError = new Error(
          error.response?.data?.message || error.message || 'Unknown error'
        );
        evatrError.name = 'EvatrApiError';
        evatrError.http = error.response?.status;
        evatrError.status = error.response?.data?.status;
        evatrError.field = error.response?.data?.field;
        throw evatrError;
      }
    );
  }

  /**
   * Perform a simple VAT-ID validation (only checks validity)
   * @param request Simple validation request with VAT-IDs only
   * @param extended If true, returns ExtendedResponse with mapped dates and additional info
   * @returns Promise<Response | ExtendedResponse>
   */
  async validateSimple(request: SimpleRequest): Promise<Response>;
  async validateSimple(request: SimpleRequest, extended: true): Promise<ExtendedResponse>;
  async validateSimple(request: SimpleRequest, extended: false): Promise<Response>;
  async validateSimple(
    request: SimpleRequest,
    extended?: boolean
  ): Promise<Response | ExtendedResponse> {
    const payload: Request = {
      vatIdOwn: request.vatIdOwn,
      vatIdForeign: request.vatIdForeign,
      includeRaw: request.includeRaw,
    };

    return this.performValidation(payload, extended);
  }

  /**
   * Perform a qualified VAT-ID validation (checks validity and company data)
   * @param request Qualified validation request with company data
   * @param extended If true, returns ExtendedResponse with mapped dates and additional info
   * @returns Promise<Response | ExtendedResponse>
   */
  async validateQualified(request: QualifiedRequest): Promise<Response>;
  async validateQualified(request: QualifiedRequest, extended: true): Promise<ExtendedResponse>;
  async validateQualified(request: QualifiedRequest, extended: false): Promise<Response>;
  async validateQualified(
    request: QualifiedRequest,
    extended?: boolean
  ): Promise<Response | ExtendedResponse> {
    const payload: Request = {
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

  /**
   * Perform VAT-ID validation with full request object
   * @param request Full validation request
   * @param extended If true, returns ExtendedResponse with mapped dates and additional info
   * @returns Promise<Response | ExtendedResponse>
   */
  async validate(request: Request): Promise<Response>;
  async validate(request: Request, extended: true): Promise<ExtendedResponse>;
  async validate(request: Request, extended: false): Promise<Response>;
  async validate(request: Request, extended?: boolean): Promise<Response | ExtendedResponse> {
    return this.performValidation(request, extended);
  }

  /**
   * Get status messages from the API
   * @returns Promise<StatusMessage[]>
   */
  async getStatusMessages(): Promise<StatusMessage[]> {
    try {
      const response: AxiosResponse<ApiStatusMessage[]> = await this.httpClient.get(
        ENDPOINTS.STATUS_MESSAGES
      );
      return response.data.map((apiMsg) => ({
        status: apiMsg.status,
        category:
          apiMsg.kategorie === 'Ergebnis'
            ? 'Result'
            : apiMsg.kategorie === 'Fehler'
              ? 'Error'
              : apiMsg.kategorie === 'Hinweis'
                ? 'Hint'
                : undefined,
        http: apiMsg.httpcode,
        message: apiMsg.meldung,
        field: apiMsg.feld,
      })) as StatusMessage[];
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get EU member states and their availability
   * @returns Promise<ApiEUMemberState[]>
   */
  async getEUMemberStates(): Promise<EUMemberState[]> {
    try {
      const response: AxiosResponse<ApiEUMemberState[]> = await this.httpClient.get(
        ENDPOINTS.EU_MEMBER_STATES
      );

      return response.data.map((apiState) => ({
        code: apiState.alpha2,
        available: apiState.verfuegbar,
      })) as EUMemberState[];
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get status message by status code
   * @param statusCode Status code (e.g., "evatr-0000")
   * @returns StatusMessage or undefined if not found
   */
  getStatusMessage(statusCode: string): StatusMessage | undefined {
    return StatusMessages.getStatusMessage(statusCode);
  }

  /**
   * Check if a status code indicates success
   * @param statusCode Status code to check
   * @returns boolean
   */
  isSuccessStatus(statusCode: string): boolean {
    return StatusMessages.isSuccessStatus(statusCode);
  }

  /**
   * Check if a status code indicates an error
   * @param statusCode Status code to check
   * @returns boolean
   */
  isErrorStatus(statusCode: string): boolean {
    return StatusMessages.isErrorStatus(statusCode);
  }

  /**
   * Check if a status code indicates a warning/hint
   * @param statusCode Status code to check
   * @returns boolean
   */
  isWarningStatus(statusCode: string): boolean {
    return StatusMessages.isWarningStatus(statusCode);
  }

  /**
   * Validate VAT-ID format (basic syntax check)
   * @param vatId VAT-ID to validate
   * @returns boolean
   */
  static checkVatIdSyntax(vatId: string): boolean {
    if (!vatId || typeof vatId !== 'string') {
      return false;
    }

    const cleanVatId = this.normalizeVatId(vatId);

    // Must start with exactly 2 letters (country code)
    if (!/^[A-Z]{2}/.test(cleanVatId)) {
      return false;
    }

    const countryCode = cleanVatId.substring(0, 2);

    const pattern = VATID_PATTERNS[countryCode];
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
  static getCountryCode(vatId: string): string {
    return this.normalizeVatId(vatId).substring(0, 2);
  }

  /**
   * Format VAT-ID by removing spaces and converting to uppercase
   * @param vatId VAT-ID to format
   * @returns string Formatted VAT-ID
   */
  static normalizeVatId(vatId: string): string {
    return vatId.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  }

  /**
   * Maps parameters to API property names
   */
  private mapToApiParams(request: Request): ApiRequest {
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
  private mapFromApiResponse(
    response: ApiResponse,
    vatIdOwn: string,
    vatIdForeign: string
  ): Response {
    return {
      id: response.id,
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
  private mapToExtendedResponse(response: Response): ExtendedResponse {
    const statusMessage = this.getStatusMessage(response.status);

    return {
      id: response.id,
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
  private async performValidation(
    request: Request,
    extended?: boolean
  ): Promise<Response | ExtendedResponse> {
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

      const response: AxiosResponse<ApiResponse> = await this.httpClient.post(
        ENDPOINTS.VALIDATION,
        apiPayload
      );

      // Map API response to English property names
      const basicResponse = this.mapFromApiResponse(
        response.data,
        formattedRequest.vatIdOwn,
        formattedRequest.vatIdForeign
      );

      // Include raw response data if requested
      if (request.includeRaw === true) {
        const rawData = {
          headers: response.headers,
          data: response.data,
        };
        basicResponse.raw = JSON.stringify(rawData);
      }

      if (extended) {
        return this.mapToExtendedResponse(basicResponse);
      }

      return basicResponse;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle and transform errors
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private handleError(error: any): EvatrApiError {
    if (error.name === 'EvatrApiError') {
      return error;
    }

    const evatrError: EvatrApiError = new Error(error.message || 'Unknown error occurred');
    evatrError.name = 'EvatrApiError';

    if (error.response) {
      evatrError.http = error.response.status;
      evatrError.status = error.response.data?.status;
      evatrError.field = error.response.data?.field;
    }

    return evatrError;
  }
}
