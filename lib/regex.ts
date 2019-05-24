'use strict';
export const REGEX = {
  WINDOWS: /^win/,
  MAC_OS: /^darwin/,
  LINUX: /^linux/,
  CARRIAGE_RETURN_LINE_FEED: /\r?\n/g,
  // "centos6" {64ec13bb-5889-4352-aee9-0f1c2a17923d}
  VBOX_E_INVALID_OBJECT_STATE: /VBOX_E_INVALID_OBJECT_STATE/,
  ESCAPED_QUOTE: /\"/,
  UUID_PARSE: /UUID\: ([a-f0-9\-]+)$/,
  DOUBLE_BACKSLASH: /\\/g
};
