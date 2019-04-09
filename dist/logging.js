"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var log4js_1 = require("log4js");
log4js_1.configure({
    appenders: {
        out: {
            type: 'stdout',
            layout: {
                type: 'pattern',
                pattern: "%[[%d{yyyy-MM-dd hh:mm:ss.SSS}] [%p] %c - %]%m",
            }
        }
    },
    categories: { default: { appenders: ['out'], level: 'info' } }
});
exports.logging = log4js_1.getLogger("VirtualBox");
