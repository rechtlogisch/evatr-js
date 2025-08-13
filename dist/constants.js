"use strict";
/**
 * Constants and status messages for the eVatR API
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EU_MEMBER_STATES = exports.QUALIFIED_RESULT_CODES = exports.STATUS_MESSAGES = exports.VATID_PATTERNS = exports.ENDPOINTS = exports.DEFAULT_BASE_URL = exports.DEFAULT_HOST = void 0;
/**
 * Default API base URL
 */
exports.DEFAULT_HOST = 'https://api.evatr.vies.bzst.de';
exports.DEFAULT_BASE_URL = exports.DEFAULT_HOST + '/app/v1';
/**
 * API endpoints
 */
exports.ENDPOINTS = {
    VALIDATION: exports.DEFAULT_BASE_URL + '/abfrage',
    STATUS_MESSAGES: exports.DEFAULT_BASE_URL + '/info/statusmeldungen',
    EU_MEMBER_STATES: exports.DEFAULT_BASE_URL + '/info/eu_mitgliedstaaten',
};
/**
 * VAT-ID syntax validation rules
 */
exports.VATID_PATTERNS = {
    AT: /^ATU\d{8}$/, // ATU + 8 digits
    BE: /^BE[01]\d{9}$/, // BE + 0 or 1 + 9 digits
    BG: /^BG\d{9,10}$/, // BG + 9-10 digits
    CY: /^CY\d{8}[A-Z]$/, // CY + 8 digits + letter
    CZ: /^CZ\d{8,10}$/, // CZ + 8-10 digits
    DE: /^DE\d{9}$/, // DE + 9 digits
    DK: /^DK\d{8}$/, // DK + 8 digits
    EE: /^EE\d{9}$/, // EE + 9 digits
    ES: /^ES[A-Z]\d{7}[A-Z0-9]$/, // ES + letter + 7 digits + letter or digit
    FI: /^FI\d{8}$/, // FI + 8 digits
    FR: /^FR[A-Z0-9]{2}\d{9}$/, // FR + 2 chars + 9 digits
    GR: /^GR\d{9}$/, // GR + 9 digits
    HR: /^HR\d{11}$/, // HR + 11 digits
    HU: /^HU\d{8}$/, // HU + 8 digits
    IE: /^IE\d[A-Z0-9]\d{5}[A-Z]$|^\d{7}[A-Z]{1,2}$/, // IE + various patterns
    IT: /^IT\d{11}$/, // IT + 11 digits
    LT: /^LT\d{9}$|^\d{12}$/, // LT + 9 or 12 digits
    LU: /^LU\d{8}$/, // LU + 8 digits
    LV: /^LV\d{11}$/, // LV + 11 digits
    MT: /^MT\d{8}$/, // MT + 8 digits
    NL: /^NL\d{9}B\d{2}$/, // NL + 9 digits + B + 2 digits
    PL: /^PL\d{10}$/, // PL + 10 digits
    PT: /^PT\d{9}$/, // PT + 9 digits
    RO: /^RO\d{2,10}$/, // RO + 2-10 digits
    SE: /^SE\d{10}01$/, // SE + 10 digits + 01
    SI: /^SI\d{8}$/, // SI + 8 digits
    SK: /^SK\d{10}$/, // SK + 10 digits
    XI: /^XI\d{9}$|^\d{12}$/, // XI + 9 or 12 digits
};
/**
 * Status messages from the eVatR API
 */
exports.STATUS_MESSAGES = {
    'evatr-0000': {
        status: 'evatr-0000',
        category: 'Result',
        http: 200,
        message: 'Die angefragte Ust-IdNr. ist zum Anfragezeitpunkt gültig.',
    },
    'evatr-0001': {
        status: 'evatr-0001',
        category: 'Hint',
        http: 400,
        field: 'datenschutz',
        message: 'Bitte bestätigen Sie den Datenschutzhinweis.',
    },
    'evatr-0002': {
        status: 'evatr-0002',
        category: 'Hint',
        http: 400,
        field: 'angefragteUstid',
        message: 'Mindestens eins der Pflichtfelder ist nicht besetzt.',
    },
    'evatr-0003': {
        status: 'evatr-0003',
        category: 'Hint',
        http: 400,
        field: 'firmenname,ort',
        message: 'Die angefragte Ust-IdNr. ist zum Anfragezeitpunkt gültig. Mindestens eines der Pflichtfelder für eine qualifizierte Bestätigungsanfrage ist nicht besetzt.',
    },
    'evatr-0004': {
        status: 'evatr-0004',
        category: 'Error',
        http: 400,
        field: 'anfragendeUstid',
        message: 'Die anfragende DE Ust-IdNr. ist syntaktisch falsch. Sie passt nicht in das deutsche Erzeugungsschema.',
    },
    'evatr-0005': {
        status: 'evatr-0005',
        category: 'Error',
        http: 400,
        field: 'angefragteUstid',
        message: 'Die angegebene angefragte Ust-IdNr. ist syntaktisch falsch.',
    },
    'evatr-0006': {
        status: 'evatr-0006',
        category: 'Hint',
        http: 403,
        field: 'anfragendeUstid',
        message: 'Die anfragende DE USt-IdNr. ist nicht berechtigt eine DE Ust-IdNr. anzufragen.',
    },
    'evatr-0007': {
        status: 'evatr-0007',
        category: 'Hint',
        http: 403,
        message: 'Fehlerhafter Aufruf.',
    },
    'evatr-0008': {
        status: 'evatr-0008',
        category: 'Hint',
        http: 403,
        message: 'Die maximale Anzahl von qualifizierten Bestätigungsabfragen für diese Session wurde erreicht. Bitte starten Sie erneut mit einer einfachen Bestätigungsabfrage.',
    },
    'evatr-0011': {
        status: 'evatr-0011',
        category: 'Error',
        http: 503,
        message: 'Eine Bearbeitung Ihrer Anfrage ist zurzeit nicht möglich. Bitte versuchen Sie es später noch einmal.',
    },
    'evatr-0012': {
        status: 'evatr-0012',
        category: 'Error',
        http: 400,
        field: 'angefragteUstid',
        message: 'Die angefragte USt-IdNr. ist syntaktisch falsch. Sie passt nicht in das Erzeugungsschema.',
    },
    'evatr-0013': {
        status: 'evatr-0013',
        category: 'Error',
        http: 503,
        message: 'Eine Bearbeitung Ihrer Anfrage ist zurzeit nicht möglich. Bitte versuchen Sie es später noch einmal.',
    },
    'evatr-1001': {
        status: 'evatr-1001',
        category: 'Error',
        http: 503,
        message: 'Eine Bearbeitung Ihrer Anfrage ist zurzeit nicht möglich. Bitte versuchen Sie es später noch einmal.',
    },
    'evatr-1002': {
        status: 'evatr-1002',
        category: 'Error',
        http: 500,
        message: 'Eine Bearbeitung Ihrer Anfrage ist zurzeit nicht möglich. Bitte versuchen Sie es später noch einmal.',
    },
    'evatr-1003': {
        status: 'evatr-1003',
        category: 'Error',
        http: 500,
        message: 'Eine Bearbeitung Ihrer Anfrage ist zurzeit nicht möglich. Bitte versuchen Sie es später noch einmal.',
    },
    'evatr-1004': {
        status: 'evatr-1004',
        category: 'Error',
        http: 500,
        message: 'Eine Bearbeitung Ihrer Anfrage ist zurzeit nicht möglich. Bitte versuchen Sie es später noch einmal.',
    },
    'evatr-2001': {
        status: 'evatr-2001',
        category: 'Hint',
        http: 404,
        field: 'angefragteUstid',
        message: 'Die angefragte USt-IdNr. ist zum Anfragezeitpunkt nicht vergeben.',
    },
    'evatr-2002': {
        status: 'evatr-2002',
        category: 'Hint',
        http: 200,
        field: 'angefragteUstid',
        message: 'Die angefragte USt-IdNr. ist zum Anfragezeitpunkt nicht gültig. Sie ist erst gültig ab dem Datum im Feld gueltigAb.',
    },
    'evatr-2003': {
        status: 'evatr-2003',
        category: 'Error',
        http: 400,
        field: 'angefragteUstid',
        message: 'Das angegebene Länderkennzeichen der angefragten USt-IdNr. ist nicht gültig.',
    },
    'evatr-2004': {
        status: 'evatr-2004',
        category: 'Error',
        http: 500,
        message: 'Eine Bearbeitung Ihrer Anfrage ist zurzeit nicht möglich. Bitte versuchen Sie es später noch einmal.',
    },
    'evatr-2005': {
        status: 'evatr-2005',
        category: 'Error',
        http: 404,
        field: 'anfragendeUstid',
        message: 'Die angegebene eigene DE Ust-IdNr. ist zum Anfragezeitpunkt nicht gültig.',
    },
    'evatr-2006': {
        status: 'evatr-2006',
        category: 'Hint',
        http: 200,
        field: 'angefragteUstid',
        message: 'Die angefragte Ust-IdNr. ist zum Anfragezeitpunkt nicht gültig. Sie war gültig im Zeitraum, der durch die Werte in den Feldern gueltigAb und gueltigBis beschrieben ist.',
    },
    'evatr-2007': {
        status: 'evatr-2007',
        category: 'Error',
        http: 500,
        message: 'Bei der Verarbeitung der Daten aus dem angefragten EU-Mitgliedstaat ist ein Fehler aufgetreten. Ihre Anfrage kann deshalb nicht bearbeitet werden.',
    },
    'evatr-2008': {
        status: 'evatr-2008',
        category: 'Hint',
        http: 200,
        message: 'Die angefragte Ust-IdNr. ist zum Anfragezeitpunkt gültig. Für die qualifizierte Bestätigungsanfrage liegt einer Besonderheit vor. Für Rückfragen wenden Sie sich an das BZSt.',
    },
    'evatr-2011': {
        status: 'evatr-2011',
        category: 'Error',
        http: 500,
        message: 'Eine Bearbeitung Ihrer Anfrage ist zurzeit nicht möglich. Bitte versuchen Sie es später noch einmal.',
    },
    'evatr-3011': {
        status: 'evatr-3011',
        category: 'Error',
        http: 500,
        message: 'Eine Bearbeitung Ihrer Anfrage ist zurzeit nicht möglich. Bitte versuchen Sie es später noch einmal.',
    },
};
/**
 * Qualified result codes explanations
 */
exports.QUALIFIED_RESULT_CODES = {
    A: 'Die Angaben stimmen mit den registrierten Daten überein.',
    B: 'Die Angaben stimmen mit den registrierten Daten nicht überein.',
    C: 'Die Angaben wurden nicht angefragt.',
    D: 'Die Angaben wurden vom EU-Mitgliedsstaat nicht mitgeteilt.',
};
/**
 * Country code to country name mapping for EU member states
 */
exports.EU_MEMBER_STATES = {
    AT: 'Austria',
    BE: 'Belgium',
    BG: 'Bulgaria',
    CY: 'Cyprus',
    CZ: 'Czech Republic',
    DE: 'Germany',
    DK: 'Denmark',
    EE: 'Estonia',
    ES: 'Spain',
    FI: 'Finland',
    FR: 'France',
    GR: 'Greece',
    HR: 'Croatia',
    HU: 'Hungary',
    IE: 'Ireland',
    IT: 'Italy',
    LT: 'Lithuania',
    LU: 'Luxembourg',
    LV: 'Latvia',
    MT: 'Malta',
    NL: 'Netherlands',
    PL: 'Poland',
    PT: 'Portugal',
    RO: 'Romania',
    SE: 'Sweden',
    SI: 'Slovenia',
    SK: 'Slovakia',
    XI: 'Northern Ireland',
};
//# sourceMappingURL=constants.js.map