import { Subscription } from "@/type";

// Days-before-renewal window in which a subscription counts as "due soon".
// NOTE: billing_cycle is currently a loose `string` on Subscription — worth
// tightening to a literal union (see flag below) so this map can't silently
// miss a key.
const DUE_SOON_WINDOW_DAYS: Record<string, number> = {
  Weekly: 3,
  Monthly: 15,
  Quarterly: 30,
  "Every 6 Months": 45, // not specified — assumption, confirm
  Yearly: 60,
  Custom: 15, // not specified — assumption, confirm
};

function getDaysUntil(dateString: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateString);
  target.setHours(0, 0, 0, 0);
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((target.getTime() - today.getTime()) / msPerDay);
}

/**
 * Active subscriptions that are due within their billing-cycle-specific
 * window, with notifications enabled, sorted soonest-due first.
 * Overdue items (negative days) are included and sort to the top.
 */
export function getUpcomingSubscriptions(
  subscriptions: Subscription[],
): Subscription[] {
  return (
    subscriptions
      .filter((sub) => sub.status === "active")
      // .filter((sub) => sub.notifications_enabled !== false)
      .filter((sub) => {
        if (!sub.next_renewal_date) return false;
        const window = DUE_SOON_WINDOW_DAYS[sub.billing_cycle];
        const daysUntil = getDaysUntil(sub.next_renewal_date);
        return window === undefined ? true : daysUntil <= window;
      })
      .sort(
        (a, b) =>
          getDaysUntil(a.next_renewal_date as string) -
          getDaysUntil(b.next_renewal_date as string),
      )
  );
}
