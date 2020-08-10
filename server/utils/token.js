"use strict";
exports.__esModule = true;
exports.getExpiration = void 0;
exports.getExpiration = function () { return Math.floor(Date.now() / 1000 + 12 * 24 * 3600); };
