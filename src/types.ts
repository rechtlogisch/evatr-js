/**
 * Types and interfaces for the eVatR API
 */

/**
 * Request interface for VAT-ID validation
 */
export interface ApiRequest {
  /** The requesting German VAT-ID */
  anfragendeUstid: string;
  /** The VAT-ID to be validated */
  angefragteUstid: string;
  /** Company name (optional, required for qualified validation) */
  firmenname?: string;
  /** City (optional, required for qualified validation) */
  ort?: string;
  /** Street address (optional) */
  strasse?: string;
  /** Postal code (optional) */
  plz?: string;
}

/**
 * Response interface for VAT-ID validation
 */
export interface ApiResponse {
  /** Technical ID given by the API, related to the request */
  id: string;
  /** Timestamp of the query */
  anfrageZeitpunkt: string;
  /** Status code (e.g., "evatr-0000") */
  status: string;
  /** Valid from date (if applicable) */
  gueltigAb?: string;
  /** Valid until date (if applicable) */
  gueltigBis?: string;
  /** Company name validation result (A/B/C/D) */
  ergFirmenname?: QualifiedResultCode;
  /** Street validation result (A/B/C/D) */
  ergStrasse?: QualifiedResultCode;
  /** Postal code validation result (A/B/C/D) */
  ergPlz?: QualifiedResultCode;
  /** City validation result (A/B/C/D) */
  ergOrt?: QualifiedResultCode;
}

export interface Request {
  vatIdOwn: string;
  vatIdForeign: string;
  company?: string;
  location?: string;
  street?: string;
  zip?: string;
  includeRaw?: boolean;
}

export type SimpleRequest = {
  vatIdOwn: string;
  vatIdForeign: string;
  includeRaw?: boolean;
};

export type QualifiedRequest = {
  vatIdOwn: string;
  vatIdForeign: string;
  company: string;
  location: string;
  street?: string;
  zip?: string;
  includeRaw?: boolean;
};

export interface Response {
  id: string;
  timestamp: string;
  status: string;
  vatIdOwn: string;
  vatIdForeign: string;
  validFrom?: string;
  validTill?: string;
  company?: QualifiedResultCode;
  street?: QualifiedResultCode;
  zip?: QualifiedResultCode;
  location?: QualifiedResultCode;
  raw?: string;
}

export interface ExtendedResponse {
  id: string;
  timestamp: Date;
  valid: boolean;
  status: string;
  message?: string;
  vatIdOwn: string;
  vatIdForeign: string;
  validFrom?: Date;
  validTill?: Date;
  company?: QualifiedResultCode;
  street?: QualifiedResultCode;
  zip?: QualifiedResultCode;
  location?: QualifiedResultCode;
  raw?: string;
}

/**
 * Validation result codes for qualified validation
 */
export type QualifiedResultCode = 'A' | 'B' | 'C' | 'D';

/**
 * Configuration options for the EvatrClient
 */
export interface EvatrClientConfig {
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Custom headers to include with requests */
  headers?: Record<string, string>;
}

/**
 * API Error interface
 */
export interface EvatrApiError extends Error {
  status?: string;
  http?: number;
  field?: string;
}

/**
 * Status message interface
 */
export interface ApiStatusMessage {
  /** Status code (e.g., "evatr-0000") */
  status: string;
  /** Category of the message */
  kategorie: 'Ergebnis' | 'Hinweis' | 'Fehler';
  /** HTTP status code */
  httpcode: number;
  /** Field that caused the error (if applicable) */
  feld?: string;
  /** Human-readable message in German */
  meldung: string;
}

export interface StatusMessage {
  status: string;
  category: StatusMessageCategory;
  http?: number;
  field?: string;
  message: string;
}

export type StatusMessageCategory = 'Result' | 'Error' | 'Hint';

/**
 * EU Member State interface
 */
export interface ApiEUMemberState {
  /** Two-letter country code */
  alpha2: string;
  /** Country name in German */
  name: string;
  /** Whether the VIES system is available for this country */
  verfuegbar: boolean;
}

// Availability map keyed by ISO alpha-2 country code (e.g., "DE", "AT")
export type Availability = Record<string, boolean>;
