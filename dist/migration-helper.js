"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvatrMigrationHelper = exports.ResultType = void 0;
const client_1 = require("./client");
const status_loader_1 = require("./status-loader");
/**
 * Mapping from new eVatR status codes to legacy error codes for backward compatibility
 * Based on the XML-RPC error codes
 *
 * Some error codes are vague or not possible to map:
 * - 201 // Die angefragte USt-IdNr. ist ungültig.
 * - 205 // Ihre Anfrage kann derzeit durch den angefragten EU-Mitgliedstaat oder aus anderen Gründen nicht beantwortet werden. Bitte versuchen Sie es später noch einmal. Bei wiederholten Problemen wenden Sie sich bitte an das Bundeszentralamt für Steuern - Dienstsitz Saarlouis.
 * - 208 // evatr-0008? Für die von Ihnen angefragte USt-IdNr. läuft gerade eine Anfrage von einem anderen Nutzer. Eine Bearbeitung ist daher nicht möglich. Bitte versuchen Sie es später noch einmal.
 * - 210 // evatr-0012? Die angefragte USt-IdNr. ist ungültig. Sie entspricht nicht den Prüfziffernregeln die für diesen EU-Mitgliedstaat gelten.
 * - 211 // Die angefragte USt-IdNr. ist ungültig. Sie enthält unzulässige Zeichen (wie z.B. Leerzeichen oder Punkt oder Bindestrich usw.).
 * - 219 // Bei der Durchführung der qualifizierten Bestätigungsanfrage ist ein Fehler aufgetreten. Es wurde eine einfache Bestätigungsanfrage mit folgendem Ergebnis durchgeführt: Die angefragte USt-IdNr. ist gültig.
 * - 223 // Die angefragte USt-IdNr. ist gültig. Die Druckfunktion steht nicht mehr zur Verfügung, da der Nachweis gem. UStAE zu § 18e.1 zu führen ist.
 */
const STATUS_TO_ERROR_CODE_MAP = {
    'evatr-0000': 200, // Die angefragte USt-IdNr. ist gültig.
    'evatr-0001': 221, // Die Anfragedaten enthalten nicht alle notwendigen Parameter oder einen ungültigen Datentyp. Weitere Informationen erhalten Sie bei den Hinweisen zum Schnittstellen - Aufruf (s.o.)
    'evatr-0002': 215, // Ihre Anfrage enthält nicht alle notwendigen Angaben für eine einfache Bestätigungsanfrage (Ihre deutsche USt-IdNr. und die ausl. USt-IdNr.). Ihre Anfrage kann deshalb nicht bearbeitet werden.
    'evatr-0003': 216, // Ihre Anfrage enthält nicht alle notwendigen Angaben für eine qualifizierte Bestätigungsanfrage (Ihre deutsche USt-IdNr., die ausl. USt-IdNr., Firmenname einschl. Rechtsform und Ort). Es wurde eine einfache Bestätigungsanfrage durchgeführt mit folgenden Ergebnis: Die angefragte USt-IdNr. ist gültig.
    'evatr-0004': 214, // Ihre deutsche USt-IdNr. ist fehlerhaft. Sie beginnt mit 'DE' gefolgt von 9 Ziffern.
    'evatr-0005': 209, // Die angefragte USt-IdNr. ist ungültig. Sie entspricht nicht dem Aufbau der für diesen EU-Mitgliedstaat gilt.
    'evatr-0006': 213, // Sie sind nicht zur Abfrage einer deutschen USt-IdNr. berechtigt.
    'evatr-0007': 221, // Die Anfragedaten enthalten nicht alle notwendigen Parameter oder einen ungültigen Datentyp. Weitere Informationen erhalten Sie bei den Hinweisen zum Schnittstellen - Aufruf (s.o.)
    'evatr-0008': 999, // 208? // Für die von Ihnen angefragte USt-IdNr. läuft gerade eine Anfrage von einem anderen Nutzer. Eine Bearbeitung ist daher nicht möglich. Bitte versuchen Sie es später noch einmal.
    'evatr-0011': 999, // Eine Bearbeitung Ihrer Anfrage ist zurzeit nicht möglich. Bitte versuchen Sie es später noch einmal.
    'evatr-0012': 209, // 210? // Die angefragte USt-IdNr. ist ungültig. Sie entspricht nicht dem Aufbau der für diesen EU-Mitgliedstaat gilt.
    'evatr-0013': 999, // Eine Bearbeitung Ihrer Anfrage ist zurzeit nicht möglich. Bitte versuchen Sie es später noch einmal.
    'evatr-1001': 999, // Eine Bearbeitung Ihrer Anfrage ist zurzeit nicht möglich. Bitte versuchen Sie es später noch einmal.
    'evatr-1002': 999, // Eine Bearbeitung Ihrer Anfrage ist zurzeit nicht möglich. Bitte versuchen Sie es später noch einmal.
    'evatr-1003': 999, // Eine Bearbeitung Ihrer Anfrage ist zurzeit nicht möglich. Bitte versuchen Sie es später noch einmal.
    'evatr-1004': 999, // Eine Bearbeitung Ihrer Anfrage ist zurzeit nicht möglich. Bitte versuchen Sie es später noch einmal.
    'evatr-2001': 202, // Die angefragte USt-IdNr. ist ungültig. Sie ist nicht in der Unternehmerdatei des betreffenden EU-Mitgliedstaates registriert. Hinweis: Ihr Geschäftspartner kann seine gültige USt-IdNr. bei der für ihn zuständigen Finanzbehörde in Erfahrung bringen. Möglicherweise muss er einen Antrag stellen, damit seine USt-IdNr. in die Datenbank aufgenommen wird.
    'evatr-2002': 203, // Die angefragte USt-IdNr. ist ungültig. Sie ist erst ab dem ... gültig (siehe Feld 'Gueltig_ab').
    'evatr-2003': 212, // Die angefragte USt-IdNr. ist ungültig. Sie enthält ein unzulässiges Länderkennzeichen.
    'evatr-2004': 999, // Eine Bearbeitung Ihrer Anfrage ist zurzeit nicht möglich. Bitte versuchen Sie es später noch einmal.
    'evatr-2005': 206, // Ihre deutsche USt-IdNr. ist ungültig. Eine Bestätigungsanfrage ist daher nicht möglich. Den Grund hierfür können Sie beim Bundeszentralamt für Steuern - Dienstsitz Saarlouis - erfragen.
    'evatr-2006': 204, // Die angefragte USt-IdNr. ist ungültig. Sie war im Zeitraum von ... bis ... gültig (siehe Feld 'Gueltig_ab' und 'Gueltig_bis').
    'evatr-2007': 217, // Bei der Verarbeitung der Daten aus dem angefragten EU-Mitgliedstaat ist ein Fehler aufgetreten. Ihre Anfrage kann deshalb nicht bearbeitet werden.
    'evatr-2008': 218, // Eine qualifizierte Bestätigung ist zur Zeit nicht möglich. Es wurde eine einfache Bestätigungsanfrage mit folgendem Ergebnis durchgeführt: Die angefragte USt-IdNr. ist gültig.
    'evatr-2011': 999, // Eine Bearbeitung Ihrer Anfrage ist zurzeit nicht möglich. Bitte versuchen Sie es später noch einmal.
    'evatr-3011': 999, // Eine Bearbeitung Ihrer Anfrage ist zurzeit nicht möglich. Bitte versuchen Sie es später noch einmal.
};
var ResultType;
(function (ResultType) {
    ResultType["MATCH"] = "A";
    ResultType["NO_MATCH"] = "B";
    ResultType["NOT_QUERIED"] = "C";
    ResultType["NOT_RETURNED"] = "D";
})(ResultType || (exports.ResultType = ResultType = {}));
/**
 * Migration helper class that provides the same API as the evatr library
 */
class EvatrMigrationHelper {
    /**
     * Perform a simple VAT-ID validation
     * @param params Simple validation parameters
     * @returns Promise<ISimpleResult>
     */
    static async checkSimple(params) {
        try {
            const response = await this.client.validateSimple({
                vatIdOwn: params.ownVatNumber,
                vatIdForeign: params.validateVatNumber,
            });
            const statusMessage = status_loader_1.StatusMessages.getStatusMessage(response.status);
            // Parse timestamp to extract date and time
            const timestamp = new Date(response.timestamp);
            const date = timestamp.toLocaleDateString('de-DE', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
            }); // DD.MM.YYY
            const time = timestamp.toTimeString().split(' ')[0]; // HH:MM:SS
            // Map status to legacy error code
            const errorCode = this.mapStatusToErrorCode(response.status);
            const result = {
                date,
                time,
                errorCode,
                errorDescription: statusMessage?.message,
                status: statusMessage?.status,
                ownVatNumber: response.vatIdOwn,
                validatedVatNumber: response.vatIdForeign,
                validFrom: response.validFrom,
                validUntil: response.validTill,
                valid: this.client.isSuccessStatus(response.status),
            };
            if (params.includeRaw) {
                // Note: The new API doesn't provide raw XML, so we'll include the JSON response
                result.raw = JSON.stringify(response, null, 2);
            }
            return result;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }
        catch (error) {
            // Map API errors to the expected format
            const errorCode = error.http || 500;
            const timestamp = new Date();
            return {
                date: timestamp.toLocaleDateString('de-DE', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                }), // DD.MM.YYY
                time: timestamp.toTimeString().split(' ')[0],
                errorCode,
                errorDescription: error.message,
                ownVatNumber: params.ownVatNumber,
                validatedVatNumber: params.validateVatNumber,
                valid: false,
            };
        }
    }
    /**
     * Perform a qualified VAT-ID validation
     * @param params Qualified validation parameters
     * @returns Promise<IQualifiedResult>
     */
    static async checkQualified(params) {
        try {
            const response = await this.client.validateQualified({
                vatIdOwn: params.ownVatNumber,
                vatIdForeign: params.validateVatNumber,
                company: params.companyName,
                location: params.city,
                street: params.street,
                zip: params.zip,
            });
            const statusMessage = status_loader_1.StatusMessages.getStatusMessage(response.status);
            const errorCode = this.mapStatusToErrorCode(response.status);
            // Parse timestamp to extract date and time
            const timestamp = new Date(response.timestamp);
            const date = timestamp.toLocaleDateString('de-DE', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
            }); // DD.MM.YYY
            const time = timestamp.toTimeString().split(' ')[0]; // HH:MM:SS
            const result = {
                date,
                time,
                errorCode,
                errorDescription: statusMessage?.message,
                status: statusMessage?.status,
                ownVatNumber: response.vatIdOwn,
                validatedVatNumber: response.vatIdForeign,
                validFrom: response.validFrom,
                validUntil: response.validTill,
                valid: this.client.isSuccessStatus(response.status),
                companyName: params.companyName,
                city: params.city,
                zip: params.zip,
                street: params.street,
                resultName: response.company,
                resultCity: response.location,
                resultZip: response.zip,
                resultStreet: response.street,
                resultNameDescription: this.getResultDescription(response.company),
                resultCityDescription: this.getResultDescription(response.location),
                resultZipDescription: this.getResultDescription(response.zip),
                resultStreetDescription: this.getResultDescription(response.street),
            };
            if (params.includeRaw) {
                // Note: The new API doesn't provide raw XML, so we'll include the JSON response
                result.raw = JSON.stringify(response, null, 2);
            }
            return result;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }
        catch (error) {
            // Map API errors to the expected format
            const errorCode = error.http || 500;
            const timestamp = new Date();
            return {
                date: timestamp.toLocaleDateString('de-DE', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                }), // DD.MM.YYY
                time: timestamp.toTimeString().split(' ')[0],
                errorCode,
                errorDescription: error.message,
                ownVatNumber: params.ownVatNumber,
                validatedVatNumber: params.validateVatNumber,
                valid: false,
                companyName: params.companyName,
                city: params.city,
                zip: params.zip,
                street: params.street,
            };
        }
    }
    /**
     * Map status codes to HTTP-like error codes for backward compatibility
     */
    static mapStatusToErrorCode(status) {
        return STATUS_TO_ERROR_CODE_MAP[status] || 999;
    }
    /**
     * Get human-readable description for result types
     */
    static getResultDescription(resultType) {
        switch (resultType) {
            case ResultType.MATCH:
                return 'stimmt überein';
            case ResultType.NO_MATCH:
                return 'stimmt nicht überein';
            case ResultType.NOT_QUERIED:
                return 'nicht angefragt';
            case ResultType.NOT_RETURNED:
                return 'vom EU-Mitgliedsstaat nicht mitgeteilt';
            default:
                return undefined;
        }
    }
}
exports.EvatrMigrationHelper = EvatrMigrationHelper;
EvatrMigrationHelper.client = new client_1.EvatrClient();
//# sourceMappingURL=migration-helper.js.map
