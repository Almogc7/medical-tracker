export const APP_NAME = "Prescription Tracker";

export const LOCALES = ["en", "he"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const EXPIRATION_THRESHOLDS = [30, 14, 7, 3, 2, 1] as const;
export const WHATSAPP_ALERT_THRESHOLD_DAYS = [3, 2, 1] as const;
export const MAX_TRACKED_PEOPLE = 4;

export const MAX_UPLOAD_SIZE_BYTES = 8 * 1024 * 1024;

export const SESSION_COOKIE = "pt_session";
export const LOCALE_COOKIE = "pt_locale";
