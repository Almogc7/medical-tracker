"use client";

import { useMemo, useState } from "react";

import { fill, badgeStyles, toneStyles } from "@/components/prescriptions/prescription-format";
import { groupByDay, severityTone, unreadCount, type NotificationItem } from "@/components/notifications/notifications-model";
import { BellIcon, CheckIcon } from "@/components/layout/nav-icons";
import { Banner } from "@/components/ui/banner";
import { useNotificationBadge } from "@/components/notifications/notification-badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterTabs } from "@/components/ui/filter-tabs";
import { useLocale } from "@/components/ui/locale-provider";
import { useAsyncAction } from "@/components/ui/use-async-action";
import { cn } from "@/utils/cn";

const press = "touch-manipulation select-none active:scale-[0.98] active:brightness-95";
const card = "rounded-[var(--radius-panel)] border border-border bg-surface";

/**
 * Notifications page. `onMarkAsRead` is the only thing that talks to the backend and is injected, so the view
 * can be driven by a mock in the preview harness. An item only turns "read" after `onMarkAsRead` resolves.
 */
export function NotificationsView({ items: initial, onMarkAsRead }: { items: NotificationItem[]; onMarkAsRead: (id: string) => Promise<void> }) {
  const { t } = useLocale();
  const [items, setItems] = useState(initial);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [justRead, setJustRead] = useState(false);
  const { run, failed, clearFailed } = useAsyncAction();
  const { markRead } = useNotificationBadge();

  const unread = unreadCount(items);
  const visible = useMemo(() => (filter === "unread" ? items.filter((i) => !i.isRead) : items), [filter, items]);
  const groups = useMemo(() => groupByDay(visible), [visible]);

  async function markAsRead(id: string) {
    setBusyId(id);
    setJustRead(false);
    clearFailed();
    const ok = await run(() => onMarkAsRead(id));
    setBusyId(null);
    if (ok) {
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      markRead(id); // update the shell bell (badge + dropdown) now that the server confirmed it
      setJustRead(true);
    }
  }

  const dayLabel = (key: string) => (key === "today" ? t.notifications.today : key === "yesterday" ? t.notifications.yesterday : key);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">{t.notifications.title}</h1>
        {items.length > 0 ? (
          unread > 0 ? (
            <p className="rounded-full bg-accent-subtle px-3 py-1 text-xs font-semibold tabular-nums text-accent">{fill(t.notifications.unreadCount, { n: unread })}</p>
          ) : (
            <p className="flex items-center gap-1.5 rounded-full bg-border-subtle px-3 py-1 text-xs font-medium text-foreground-muted"><CheckIcon /> {t.notifications.caughtUpTitle}</p>
          )
        ) : null}
      </div>

      {items.length > 0 ? (
        <div className="mb-4">
          <FilterTabs
            label={t.notifications.title}
            value={filter}
            onChange={(v) => setFilter(v as "all" | "unread")}
            items={[
              { value: "all", label: t.notifications.filterAll },
              { value: "unread", label: unread ? `${t.notifications.unread} (${unread})` : t.notifications.unread },
            ]}
          />
        </div>
      ) : null}

      {/* Result of the last action: success is announced politely, failure assertively (Banner sets the roles). */}
      {justRead ? <Banner tone="success" className="mb-3">{t.notifications.markedRead}</Banner> : null}
      {failed ? <Banner tone="error" className="mb-3">{t.common.actionFailed}</Banner> : null}

      {items.length === 0 ? (
        <div className={card}>
          <EmptyState icon={<BellIcon />} title={t.notifications.noNotifications} message={t.notifications.emptyHint} />
        </div>
      ) : visible.length === 0 ? (
        <div className={card}>
          <EmptyState icon={<CheckIcon className="size-6" />} title={t.notifications.caughtUpTitle} message={t.notifications.caughtUpMessage} />
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <section key={group.dayKey} aria-label={dayLabel(group.dayKey)}>
              <h2 className="text-xs font-semibold text-foreground-muted" dir="auto">{dayLabel(group.dayKey)}</h2>
              <ul className="mt-2 space-y-3">
                {group.items.map((item) => {
                  const tone = severityTone[item.severity];
                  const pending = busyId === item.id;
                  return (
                    <li
                      key={item.id}
                      className={cn(
                        "rounded-[var(--radius-panel)] border border-border border-s-4 p-4",
                        item.isRead ? "border-s-border bg-canvas" : cn("bg-surface", toneStyles[tone].stripe),
                      )}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium", badgeStyles[tone].pill, item.isRead && "opacity-70")}>
                              <span aria-hidden="true" className={cn("size-1.5 rounded-full", badgeStyles[tone].dot)} />
                              {t.notifications.severity[item.severity]}
                            </span>
                            <time title={item.timestamp} dateTime={item.timestamp.replace(" ", "T")} dir="ltr" className="text-xs tabular-nums text-foreground-muted">{item.time}</time>
                            {!item.isRead ? <span className="sr-only">{t.notifications.unread}</span> : null}
                          </div>
                          <p className={cn("mt-2 text-sm leading-snug text-foreground", item.isRead ? "font-medium text-foreground-muted" : "font-semibold")} dir="auto">{item.title}</p>
                          <p className="mt-1 text-sm leading-relaxed text-foreground-muted" dir="auto">{item.message}</p>
                        </div>
                        {item.isRead ? (
                          <p className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-foreground-muted"><CheckIcon /> {t.notifications.read}</p>
                        ) : (
                          <Button type="button" variant="secondary" size="sm" loading={pending} disabled={busyId !== null} onClick={() => markAsRead(item.id)} className={cn("w-full shrink-0 sm:w-auto", press)}>
                            {t.notifications.markAsRead}
                          </Button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
