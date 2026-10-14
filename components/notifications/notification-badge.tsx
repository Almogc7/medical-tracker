"use client";

import { createContext, useContext } from "react";

/**
 * Lets any page tell the shell that a notification was confirmed as read, so the bell badge and dropdown update
 * immediately. It is purely client state: the notification API is untouched, and a fresh server render (the next
 * navigation or reload) provides the authoritative count again.
 */
type NotificationBadgeValue = { markRead: (id: string) => void };

export const NotificationBadgeContext = createContext<NotificationBadgeValue>({ markRead: () => {} });

export const useNotificationBadge = () => useContext(NotificationBadgeContext);
