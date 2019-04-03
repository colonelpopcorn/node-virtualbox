export const REGEX = {
    WINDOWS: /^win/,
    MAC_OS: /^darwin/,
    LINUX: /^linux/,
    CARRIAGE_RETURN_LINE_FEED: /\r?\n/g,
    // "centos6" {64ec13bb-5889-4352-aee9-0f1c2a17923d}
    VBOX_OS_GUID: /^"(.+)" \{(.+)\}$/,
    VBOX_E_INVALID_OBJECT_STATE: /VBOX_E_INVALID_OBJECT_STATE/,
    SNAPSHOT_PARSE :/^(CurrentSnapshotUUID|SnapshotName|SnapshotUUID).*\="(.*)"$/,
    UUID_PARSE: /UUID\: ([a-f0-9\-]+)$/,
    DOUBLE_BACKSLASH: /\\/g
}