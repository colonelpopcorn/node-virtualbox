'use strict';
import { configure, getLogger, Logger } from 'log4js';

configure({
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

export const logging: Logger = getLogger("VirtualBox");
