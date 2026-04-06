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
        'status': 'evatr-0000',
        'message': 'Die angefragte USt-IdNr. ist zum Anfragezeitpunkt gültig.',
        'category': 'Result',
        'http': 200
    },
    'evatr-0001': {
        'status': 'evatr-0001',
        'message': 'Bitte bestätigen Sie den Datenschutzhinweis.',
        'category': 'Hint',
        'field': 'datenschutz'
    },
    'evatr-0002': {
        'status': 'evatr-0002',
        'message': 'Mindestens eins der Pflichtfelder ist nicht besetzt.',
        'category': 'Hint',
        'http': 400,
        'field': 'angefragteUstid'
    },
    'evatr-0003': {
        'status': 'evatr-0003',
        'message': 'Die angefragte USt-IdNr. ist zum Anfragezeitpunkt gültig. Mindestens eines der Pflichtfelder für eine qualifizierte Bestätigungsanfrage ist nicht besetzt.',
        'category': 'Hint',
        'http': 400,
        'field': 'firmenname,ort'
    },
    'evatr-0004': {
        'status': 'evatr-0004',
        'message': 'Die anfragende DE USt-IdNr. ist syntaktisch falsch. Sie passt nicht in das deutsche Erzeugungsschema.',
        'category': 'Error',
        'http': 400,
        'field': 'anfragendeUstid'
    },
    'evatr-0005': {
        'status': 'evatr-0005',
        'message': 'Die angegebene angefragte USt-IdNr. ist syntaktisch falsch.',
        'category': 'Error',
        'http': 400,
        'field': 'angefragteUstid'
    },
    'evatr-0006': {
        'status': 'evatr-0006',
        'message': 'Die anfragende DE USt-IdNr. ist nicht berechtigt eine DE USt-IdNr. anzufragen.',
        'category': 'Hint',
        'http': 403,
        'field': 'anfragendeUstid'
    },
    'evatr-0007': {
        'status': 'evatr-0007',
        'message': 'Fehlerhafter Aufruf.',
        'category': 'Hint',
        'http': 403
    },
    'evatr-0008': {
        'status': 'evatr-0008',
        'message': 'Die maximale Anzahl von qualifizierten Bestätigungsabfragen für diese Session wurde erreicht. Bitte starten Sie erneut mit einer einfachen Bestätigungsabfrage.',
        'category': 'Hint',
        'http': 403
    },
    'evatr-0011': {
        'status': 'evatr-0011',
        'message': 'Eine Bearbeitung Ihrer Anfrage ist zurzeit nicht möglich. Bitte versuchen Sie es später noch einmal.',
        'category': 'Error',
        'http': 503
    },
    'evatr-0012': {
        'status': 'evatr-0012',
        'message': 'Die angefragte USt-IdNr. ist syntaktisch falsch. Sie passt nicht in das Erzeugungsschema.',
        'category': 'Error',
        'http': 400,
        'field': 'angefragteUstid'
    },
    'evatr-0013': {
        'status': 'evatr-0013',
        'message': 'Eine Bearbeitung Ihrer Anfrage ist zurzeit nicht möglich. Bitte versuchen Sie es später noch einmal.',
        'category': 'Error',
        'http': 503
    },
    'evatr-1001': {
        'status': 'evatr-1001',
        'message': 'Eine Bearbeitung Ihrer Anfrage ist zurzeit nicht möglich. Bitte versuchen Sie es später noch einmal.',
        'category': 'Error',
        'http': 503
    },
    'evatr-1002': {
        'status': 'evatr-1002',
        'message': 'Eine Bearbeitung Ihrer Anfrage ist zurzeit nicht möglich. Bitte versuchen Sie es später noch einmal.',
        'category': 'Error',
        'http': 500
    },
    'evatr-1003': {
        'status': 'evatr-1003',
        'message': 'Eine Bearbeitung Ihrer Anfrage ist zurzeit nicht möglich. Bitte versuchen Sie es später noch einmal.',
        'category': 'Error',
        'http': 500
    },
    'evatr-1004': {
        'status': 'evatr-1004',
        'message': 'Eine Bearbeitung Ihrer Anfrage ist zurzeit nicht möglich. Bitte versuchen Sie es später noch einmal.',
        'category': 'Error',
        'http': 500
    },
    'evatr-2001': {
        'status': 'evatr-2001',
        'message': 'Die angefragte USt-IdNr. ist zum Anfragezeitpunkt nicht vergeben.',
        'category': 'Hint',
        'http': 404,
        'field': 'angefragteUstid'
    },
    'evatr-2002': {
        'status': 'evatr-2002',
        'message': 'Die angefragte USt-IdNr. ist zum Anfragezeitpunkt nicht gültig. Sie ist erst gültig ab dem Datum im Feld gueltigAb.',
        'category': 'Hint',
        'http': 200,
        'field': 'angefragteUstid'
    },
    'evatr-2003': {
        'status': 'evatr-2003',
        'message': 'Das angegebene Länderkennzeichen der angefragten USt-IdNr. ist nicht gültig.',
        'category': 'Error',
        'http': 400,
        'field': 'angefragteUstid'
    },
    'evatr-2004': {
        'status': 'evatr-2004',
        'message': 'Eine Bearbeitung Ihrer Anfrage ist zurzeit nicht möglich. Bitte versuchen Sie es später noch einmal.',
        'category': 'Error',
        'http': 500
    },
    'evatr-2005': {
        'status': 'evatr-2005',
        'message': 'Die angegebene eigene DE USt-IdNr. ist zum Anfragezeitpunkt nicht gültig.',
        'category': 'Error',
        'http': 404,
        'field': 'anfragendeUstid'
    },
    'evatr-2006': {
        'status': 'evatr-2006',
        'message': 'Die angefragte USt-IdNr. ist zum Anfragezeitpunkt nicht gültig. Sie war gültig im Zeitraum, der durch die Werte in den Feldern gueltigAb und gueltigBis beschrieben ist.',
        'category': 'Hint',
        'http': 200,
        'field': 'angefragteUstid'
    },
    'evatr-2007': {
        'status': 'evatr-2007',
        'message': 'Bei der Verarbeitung der Daten aus dem angefragten EU-Mitgliedstaat ist ein Fehler aufgetreten. Ihre Anfrage kann deshalb nicht bearbeitet werden.',
        'category': 'Error',
        'http': 500
    },
    'evatr-2008': {
        'status': 'evatr-2008',
        'message': 'Die angefragte USt-IdNr. ist zum Anfragezeitpunkt gültig. Für die qualifizierte Bestätigungsanfrage liegt einer Besonderheit vor. Für Rückfragen wenden Sie sich an das BZSt.',
        'category': 'Hint',
        'http': 200
    },
    'evatr-2011': {
        'status': 'evatr-2011',
        'message': 'Eine Bearbeitung Ihrer Anfrage ist zurzeit nicht möglich. Bitte versuchen Sie es später noch einmal.',
        'category': 'Error',
        'http': 500
    },
    'evatr-3011': {
        'status': 'evatr-3011',
        'message': 'Eine Bearbeitung Ihrer Anfrage ist zurzeit nicht möglich. Bitte versuchen Sie es später noch einmal.',
        'category': 'Error',
        'http': 500
    }
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