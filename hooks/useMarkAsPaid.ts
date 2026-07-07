// hooks/useMarkAsPaid.ts
import { useToast } from "@/components/ui/NotificationService";
import { useAuth } from "@clerk/expo";
import { usePostHog } from "posthog-react-native";
import { useEffect, useRef } from "react";

interface UseMarkAsPaidOptions {
  // Called on success with the updated subscription returned from the server.
  // The caller is responsible for updating its own local state.
  onSuccess: (updatedSubscription: Subscription) => void;
}

interface UseMarkAsPaidReturn {
  // Call this when the user confirms payment.
  // subscriptionId  — the subscription being marked paid
  // paidAt          — ISO timestamp the user selected (defaults to now in the modal)
  markAsPaid: (subscription: Subscription, paidAt: string) => Promise<void>;
}

export function useMarkAsPaid({
  onSuccess,
}: UseMarkAsPaidOptions): UseMarkAsPaidReturn {
  const { getToken } = useAuth();
  const { showError, showSuccess } = useToast();
  const posthog = usePostHog();

  // Stable ref — avoids stale closure on getToken without adding it
  // as a dependency that causes re-renders
  const getTokenRef = useRef(getToken);
  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  const markAsPaid = async (
    subscription: Subscription,
    paidAt: string,
  ): Promise<void> => {
    const token = await getTokenRef.current();
    if (!token) {
      showError("Session expired. Please sign in again.");
      throw new Error("No token");
    }

    let res: Response;
    let data: { message?: string; subscription?: Subscription };
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      res = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/mark-as-paid`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            subscription_id: subscription.id,
            paid_at: paidAt,
          }),
          signal: controller.signal,
        },
      );
      clearTimeout(timeoutId);
      data = await res.json();
      showSuccess("Subscription marked as paid.");
    } catch {
      showError("Network error. Please check your connection and try again.");
      throw new Error("Network error");
    }

    if (!res.ok) {
      showError(data.message ?? "Failed to mark as paid. Please try again.");
      throw new Error(data.message ?? "Failed to mark as paid");
    }

    onSuccess(data.subscription);

    posthog.capture("Payment Recorded", {
      subscription_id: subscription.id,
      source: "user_marked",
      billing_cycle: subscription.billing_cycle,
    });
  };

  return { markAsPaid };
}
