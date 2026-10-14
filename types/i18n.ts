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
    menu: string;
    closeMenu: string;
    logout: string;
  };
  auth: {
    title: string;
    subtitle: string;
    email: string;
    password: string;
    login: string;
    invalid: string;
    signingIn: string;
    showPassword: string;
    hidePassword: string;
    emailRequired: string;
    emailInvalid: string;
    passwordRequired: string;
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
    usePacks: string;
    uploadPrescription: string;
    startsOn: string;
    expiresOn: string;
    daysRemaining: string;
    back: string;
    delete: string;
    actionFailed: string;
    packsUpdated: string;
    details: string;
    edit: string;
  };
  status: {
    active: string;
    expiringSoon: string;
    expired: string;
    issued: string;
    urgent: string;
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
    nextToExpire: string;
    prescriptions: string;
    packsLeft: string;
    packsUsedOf: string; // "{used}" and "{total}" placeholders
    daysLeftOne: string;
    daysLeftMany: string; // "{n}" placeholder
    daysLeftToday: string;
    daysAgoOne: string;
    daysAgoMany: string; // "{n}" placeholder
    attentionNone: string;
    attentionOne: string;
    attentionMany: string; // "{n}" placeholder
    decreasePacks: string;
    increasePacks: string;
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
    emptyTitle: string;
    emptyMessage: string;
    slotsUsed: string; // "{n}" and "{max}" placeholders
    removeConfirmTitle: string; // "{name}" placeholder
    removeConfirmBody: string; // "{n}" placeholder (number of prescriptions that will be deleted)
    removeConfirmBodyNone: string;
    viewPrescriptions: string;
    noActive: string;
    setPacks: string;
    setPacksLabel: string;
    setPacksApply: string;
    setPacksDoneOne: string;
    setPacksDoneMany: string; // "{n}" placeholder
    packsLeftTotal: string; // "{n}" placeholder
    setPacksConfirmTitle: string;
    setPacksConfirmBody: string; // "{packs}", "{n}" and "{name}" placeholders
  };
  person: {
    prescriptions: string;
    filterAll: string;
    filterActive: string;
    filterIssued: string;
    filterExpired: string;
    filterExpiringSoon: string;
    noPrescriptions: string;
    noPrescriptionsMessage: string;
    noMatches: string;
    filterLabel: string;
    backToPeople: string;
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
    totalPacks: string;
    packsRemaining: string;
    usePacksTitle: string;
    usePacksDescription: string;
    usePacksInvalid: string;
    totalPacksMin: string; // "{n}" placeholder
    undoIssuedConfirmTitle: string;
    undoIssuedConfirmBody: string;
    deleteConfirmTitle: string;
    deleteConfirmBody: string; // "{title}" placeholder
  };
  upload: {
    stepChoose: string;
    stepReview: string;
    stepDone: string;
    personLabel: string;
    noPeopleTitle: string;
    goToPeople: string;
    dropTitle: string;
    dropHint: string;
    pdfLimit: string;
    replaceFile: string;
    removeFile: string;
    tooLarge: string;
    readPdf: string;
    reading: string;
    readingHint: string;
    readFailed: string;
    tryAgain: string;
    chooseAnother: string;
    reviewTitle: string;
    reviewIntro: string;
    detectedHeading: string;
    fileLabel: string;
    forLabel: string;
    packsDetected: string;
    packsNotDetected: string;
    monthsDetected: string;
    confHigh: string;
    confCheck: string;
    confNone: string;
    titleRequired: string;
    monthsHeading: string;
    monthN: string;
    savedAs: string;
    addMonth: string;
    datesInvalid: string;
    noMonthsLeft: string;
    saveOne: string;
    saveMany: string;
    saving: string;
    saveFailed: string;
    back: string;
    doneTitle: string;
    doneOne: string;
    doneMany: string;
    viewPrescriptions: string;
    uploadAnother: string;
  };
  notifications: {
    title: string;
    unread: string;
    read: string;
    markAsRead: string;
    noNotifications: string;
    unreadCount: string; // "{n}" placeholder
    filterAll: string;
    today: string;
    yesterday: string;
    markedRead: string;
    caughtUpTitle: string;
    caughtUpMessage: string;
    emptyHint: string;
    severity: { critical: string; high: string; medium: string; low: string };
  };
};

export type LocaleContextValue = {
  locale: Locale;
  dir: "ltr" | "rtl";
  t: TranslationDict;
};
