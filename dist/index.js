"use strict";
/**
 * evatr-api
 *
 * Checks a VAT-ID using the eVatR REST-API of the German Federal Central Tax Office (Bundeszentralamt für Steuern, BZSt)
 *
 * @author Krzysztof Tomasz Zembrowski <open-source@rechtlogisch.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvatrMigrationHelper = exports.StatusMessages = exports.EvatrApiUpdater = exports.EvatrUtils = exports.QUALIFIED_RESULT_CODES = exports.STATUS_MESSAGES = exports.EvatrClient = void 0;
// Export main client
var client_1 = require("./client");
Object.defineProperty(exports, "EvatrClient", { enumerable: true, get: function () { return client_1.EvatrClient; } });
// Export constants
var constants_1 = require("./constants");
Object.defineProperty(exports, "STATUS_MESSAGES", { enumerable: true, get: function () { return constants_1.STATUS_MESSAGES; } });
Object.defineProperty(exports, "QUALIFIED_RESULT_CODES", { enumerable: true, get: function () { return constants_1.QUALIFIED_RESULT_CODES; } });
// Export utilities
var utils_1 = require("./utils");
Object.defineProperty(exports, "EvatrUtils", { enumerable: true, get: function () { return utils_1.EvatrUtils; } });
var api_updater_1 = require("./api-updater");
Object.defineProperty(exports, "EvatrApiUpdater", { enumerable: true, get: function () { return api_updater_1.EvatrApiUpdater; } });
var status_loader_1 = require("./status-loader");
Object.defineProperty(exports, "StatusMessages", { enumerable: true, get: function () { return status_loader_1.StatusMessages; } });
// Export migration helper for backward compatibility
var migration_helper_1 = require("./migration-helper");
Object.defineProperty(exports, "EvatrMigrationHelper", { enumerable: true, get: function () { return migration_helper_1.EvatrMigrationHelper; } });
//# sourceMappingURL=index.js.map