import type { Locale } from "@/lib/constants";

export type TranslationDict = {
  appName: string;
  sidebar: {
    dashboard: string;
    people: string;
    upload: string;
    notifications: string;
  };
  navbar: {
    hello: string;
    notifications: string;
    language: string;
    logout: string;
  };
  auth: {
    title: string;
    subtitle: string;
    email: string;
    password: string;
    login: string;
    invalid: string;
  };
  common: {
    loading: string;
    save: string;
    cancel: string;
    confirm: string;
    actions: string;
    empty: string;
    notes: string;
    viewPdf: string;
    markIssued: string;
    undoIssued: string;
    uploadPrescription: string;
    startsOn: string;
    expiresOn: string;
    daysRemaining: string;
    back: string;
    delete: string;
  };
  status: {
    active: string;
    expiringSoon: string;
    expired: string;
    issued: string;
  };
  dashboard: {
    title: string;
    summary: {
      active: string;
      expiringSoon: string;
      expired: string;
      issued: string;
    };
    upcomingExpirations: string;
    urgentAlerts: string;
    recentActivity: string;
    perPerson: string;
  };
  people: {
    title: string;
    activeCount: string;
    issuedCount: string;
    nearestExpiration: string;
    manageTitle: string;
    addPerson: string;
    removePerson: string;
    fullName: string;
    optionalNote: string;
    maxReached: string;
    addSuccess: string;
    removeSuccess: string;
  };
  person: {
    prescriptions: string;
    filterAll: string;
    filterActive: string;
    filterIssued: string;
    filterExpired: string;
    filterExpiringSoon: string;
  };
  prescriptions: {
    table: {
      title: string;
      status: string;
      startDate: string;
      expirationDate: string;
      daysRemaining: string;
      actions: string;
    };
    detail: string;
    reviewMessage: string;
    uploadHelper: string;
    fileTooLarge: string;
    invalidFile: string;
    parseError: string;
    confirmIssue: string;
    monthlyDetected: string;
    removeMonth: string;
    saveAllMonths: string;
    nothingToSave: string;
    noPeopleAvailable: string;
    selectPersonBeforeSave: string;
  };
  notifications: {
    title: string;
    unread: string;
    read: string;
    markAsRead: string;
    noNotifications: string;
  };
};

export type LocaleContextValue = {
  locale: Locale;
  dir: "ltr" | "rtl";
  t: TranslationDict;
};
