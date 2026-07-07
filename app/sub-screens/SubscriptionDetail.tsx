import CustomButton from "@/components/ui/CustomButton";
import CustomModal from "@/components/ui/CustomModal";
import { BRAND_ICON_IMAGES } from "@/constants/icons";
import { colors, globalStyles } from "@/constants/theme";
import { useMarkAsPaid } from "@/hooks/useMarkAsPaid";
import { formatCurrency, getInitials } from "@/lib/utils";
import { useAuth } from "@clerk/expo";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  Calendar,
  CircleCheck,
  Clock,
  EllipsisVertical,
  FileText,
  Pause,
  Pencil,
  RefreshCw,
  RefreshCwOff,
  Repeat,
  SkipForward,
} from "lucide-react-native";
import { styled } from "nativewind";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { ms, s, vs } from "react-native-size-matters";

const SafeAreaView = styled(RNSafeAreaView);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatFullDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateShort(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatMonthYear(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type SubscriptionDetailType = {
  id: string;
  user_id: string;
  service_name: string;
  amount: number;
  currency_code: string;
  category: string;
  icon_id: string | null;
  icon_color: string | null;
  icon_initials: string | null;
  billing_cycle: string;
  start_date: string;
  next_renewal_date: string;
  notes: string | null;
  notifications?: string[];
  is_active: boolean;
  status: string;
  created_at: string;
};

type PaymentStatus = "confirmed" | "expected" | "skipped";

type PaymentHistoryRow = {
  id: string;
  billing_date: string;
  paid_at: string | null;
  status: PaymentStatus;
  source: "auto_logged" | "user_marked";
  amount: number;
  currency_code: string;
};

// ─── Loading / error states ───────────────────────────────────────────────────

function LoadingState() {
  return (
    <View style={styles.centered}>
      <ActivityIndicator color={colors.accent} size="large" />
    </View>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <View style={styles.centered}>
      <Text style={styles.errorTitle}>Couldn't load this subscription</Text>
      <Text style={styles.errorSubtitle}>
        Check your connection and try again
      </Text>
      <TouchableOpacity onPress={onRetry} style={styles.retryButton}>
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );
}

function NotFoundState() {
  return (
    <View style={styles.centered}>
      <Text style={styles.errorTitle}>Subscription not found</Text>
      <Text style={styles.errorSubtitle}>
        It may have been removed from your account
      </Text>
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.retryButton}
      >
        <Text style={styles.retryButtonText}>Go back</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Payment history row ──────────────────────────────────────────────────────

function PaymentHistoryItem({ item }: { item: PaymentHistoryRow }) {
  const statusConfig: Record<
    PaymentStatus,
    { label: string; color: string; bg: string; icon: React.ReactNode }
  > = {
    confirmed: {
      label: "Paid",
      color: "#16A34A",
      bg: "#F0FDF4",
      icon: <CircleCheck size={ms(17)} color={colors.accent} />,
    },
    expected: {
      label: "Expected",
      color: "#D97706",
      bg: "#FFFBEB",
      icon: <Clock size={ms(17)} color="#D97706" />,
    },
    skipped: {
      label: "Skipped",
      color: "#6B7280",
      bg: "#F9FAFB",
      icon: <SkipForward size={ms(17)} color="#6B7280" />,
    },
  };

  const config = statusConfig[item.status];

  return (
    <View style={styles.historyRow}>
      {/* Left: billing month + paid on date */}
      <View style={styles.historyLeftContainer}>
        <View style={[styles.statusPill, { backgroundColor: config.bg }]}>
          {config.icon}
        </View>
        <View style={styles.historyLeft}>
          <Text style={styles.historyBillingDate}>
            {formatMonthYear(item.billing_date)}
          </Text>
          {item.paid_at && (
            <Text style={styles.historyPaidOn}>
              Paid on {formatMonthYear(item.paid_at)}
            </Text>
          )}
        </View>
      </View>

      {/* Right: amount + status pill */}
      <View style={styles.historyRight}>
        <Text style={styles.historyAmount}>
          {formatCurrency(item.amount, item.currency_code)}
        </Text>
        <View>
          <Text style={[styles.statusPillText, { color: config.color }]}>
            {config.label}
          </Text>
        </View>
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SubscriptionDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getToken } = useAuth();

  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const [subscription, setSubscription] =
    useState<SubscriptionDetailType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  // ── Options modal ─────────────────────────────────────────────────────────
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);

  // ── Mark as paid state ────────────────────────────────────────────────────
  type ConfirmView = "idle" | "confirm";
  const [confirmView, setConfirmView] = useState<ConfirmView>("idle");
  const [paidAt, setPaidAt] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Payment history state ─────────────────────────────────────────────────
  const [history, setHistory] = useState<PaymentHistoryRow[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  // ── Mark as paid hook ─────────────────────────────────────────────────────
  const { markAsPaid } = useMarkAsPaid({
    onSuccess: (updatedSubscription) => {
      setSubscription((prev) =>
        prev ? { ...prev, ...updatedSubscription } : prev,
      );
      setConfirmView("idle");
      // Refresh history after a successful mark-as-paid
      if (id) loadHistory(id);
    },
  });

  const handleConfirmPayment = async () => {
    if (!subscription || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await markAsPaid(
        subscription as unknown as Subscription,
        paidAt.toISOString(),
      );
    } catch {
      // useMarkAsPaid already shows the error toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenConfirm = () => {
    setPaidAt(new Date());
    setShowDatePicker(false);
    setConfirmView("confirm");
  };

  const handleCancelConfirm = () => {
    setShowDatePicker(false);
    setConfirmView("idle");
  };

  // ── Fetch subscription ────────────────────────────────────────────────────
  const loadSubscription = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    setNotFound(false);

    try {
      const token = await getTokenRef.current();
      if (!token) {
        setError("Session expired. Please sign in again.");
        return;
      }

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/get-subscription?id=${id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status === 404) {
        setNotFound(true);
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Failed to load subscription");
      }

      setSubscription(data.subscription);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  // ── Fetch payment history ─────────────────────────────────────────────────
  const loadHistory = useCallback(async (subscriptionId: string) => {
    setHistoryLoading(true);
    try {
      const token = await getTokenRef.current();
      if (!token) return;

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/get-payment-history?subscription_id=${subscriptionId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();
      if (!response.ok) return;
      setHistory(data.history ?? []);
    } catch {
      // Non-fatal — history section shows empty state silently
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSubscription();
  }, [loadSubscription]);

  // Load history once subscription is loaded
  useEffect(() => {
    if (id) loadHistory(id);
  }, [id]);

  // ── Render states ─────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <LoadingState />
      </SafeAreaView>
    );
  }

  if (notFound) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <NotFoundState />
      </SafeAreaView>
    );
  }

  if (error || !subscription) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <ErrorState onRetry={loadSubscription} />
      </SafeAreaView>
    );
  }

  const image = subscription?.icon_id
    ? BRAND_ICON_IMAGES[subscription.icon_id]
    : null;
  const bgColor = subscription?.icon_color ?? "#8E8E93";
  const initials = getInitials(subscription?.service_name ?? "");

  return (
    <SafeAreaView
      className="flex-1 bg-background"
      style={globalStyles.bodyPadding}
      edges={["top"]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={ms(22)} color="#0F172A" />
        </TouchableOpacity>
        <TouchableOpacity
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel="More options"
          onPress={() => setOptionsModalVisible(true)}
        >
          <EllipsisVertical size={ms(22)} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ paddingBottom: ms(20) }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Brand + name */}
        <View style={styles.brandSection}>
          <View
            style={[
              styles.brandTile,
              { backgroundColor: bgColor, borderRadius: ms(70) * 0.3 },
            ]}
          >
            {image ? (
              <Image
                source={image}
                style={{ width: ms(42), height: ms(42) }}
                resizeMode="contain"
              />
            ) : (
              <Text style={styles.brandInitials}>{initials}</Text>
            )}
          </View>
          <Text style={styles.serviceName}>{subscription.service_name}</Text>
        </View>

        {/* Amount */}
        <View style={styles.amountSection}>
          <Text style={styles.amount}>
            {formatCurrency(subscription.amount, subscription.currency_code)}
          </Text>
          <Text style={styles.amountSubtext}>{subscription.billing_cycle}</Text>
        </View>

        {/* Details card */}
        <View style={styles.detailsCard}>
          <DetailRow
            icon={<Calendar size={ms(18)} color={colors.gray} />}
            label="Next renewal"
            value={
              subscription.next_renewal_date
                ? formatFullDate(subscription.next_renewal_date)
                : "N/A"
            }
          />
          <View style={styles.divider} />
          <DetailRow
            icon={<Repeat size={ms(18)} color={colors.gray} />}
            label="Billing cycle"
            value={subscription.billing_cycle}
          />
          <View style={styles.divider} />
          <DetailRow
            icon={<Calendar size={ms(18)} color={colors.gray} />}
            label="Start date"
            value={formatFullDate(subscription.start_date)}
          />
          <View style={styles.divider} />
          <DetailRow
            icon={<Calendar size={ms(18)} color={colors.gray} />}
            label="Category"
            value={subscription.category}
          />
          {subscription.notifications && (
            <>
              <View style={styles.divider} />
              <DetailRow
                icon={<Calendar size={ms(18)} color={colors.gray} />}
                label="Notifications"
                value={subscription.notifications.join(", ")}
              />
            </>
          )}
          {subscription.notes && (
            <>
              <View style={styles.divider} />
              <DetailRow
                icon={<FileText size={ms(18)} color={colors.gray} />}
                label="Notes"
                value={subscription.notes}
              />
            </>
          )}
        </View>

        {/* ── Mark as paid ─────────────────────────────────────────────────── */}
        {subscription.status === "active" && confirmView === "idle" && (
          <TouchableOpacity
            style={styles.markPaidButton}
            accessibilityRole="button"
            accessibilityLabel="Mark as paid"
            onPress={handleOpenConfirm}
          >
            <Text style={styles.markPaidText}>Mark as Paid</Text>
          </TouchableOpacity>
        )}

        {subscription.status === "active" && confirmView === "confirm" && (
          <View style={styles.confirmCard}>
            <TouchableOpacity
              style={styles.confirmRow}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}
            >
              <Calendar size={ms(18)} color={colors.gray} />
              <View style={styles.confirmTextGroup}>
                <Text style={styles.confirmLabel}>Paid on</Text>
                <Text style={styles.confirmValue}>
                  {formatDateShort(paidAt)}
                </Text>
              </View>
              <Text style={styles.changeHint}>Change</Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={paidAt}
                mode="date"
                display={Platform.OS === "ios" ? "inline" : "default"}
                maximumDate={new Date()}
                onChange={(_, selectedDate) => {
                  if (Platform.OS === "android") setShowDatePicker(false);
                  if (selectedDate) setPaidAt(selectedDate);
                }}
                style={{ marginTop: ms(8) }}
              />
            )}

            <CustomButton
              onPress={handleConfirmPayment}
              text={isSubmitting ? "Saving…" : "Confirm Payment"}
              disabled={isSubmitting}
              style={{ marginTop: ms(12) }}
            />

            <TouchableOpacity
              style={styles.cancelTextButton}
              onPress={handleCancelConfirm}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        {subscription.status === "paused" && (
          <CustomButton
            onPress={() => {}}
            text="Activate"
            icon={<RefreshCw />}
            type="secondary"
            style={{
              width: "100%",
              paddingVertical: ms(12),
              marginTop: ms(24),
            }}
          />
        )}

        {/* ── Payment history ───────────────────────────────────────────────── */}
        <View style={styles.historySection}>
          <Text style={styles.historySectionTitle}>Payment History</Text>

          {historyLoading ? (
            <View style={styles.historyLoadingContainer}>
              <ActivityIndicator size="small" color={colors.gray} />
            </View>
          ) : history.length === 0 ? (
            <View style={styles.historyEmptyContainer}>
              <Text style={styles.historyEmptyText}>
                No payment history yet
              </Text>
            </View>
          ) : (
            <View style={styles.historyCard}>
              {history.map((item, index) => (
                <View key={item.id}>
                  <PaymentHistoryItem item={item} />
                  {index < history.length - 1 && (
                    <View style={styles.divider} />
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Options modal */}
      <CustomModal
        visible={optionsModalVisible}
        onClose={() => setOptionsModalVisible(false)}
      >
        <View style={[globalStyles.modalContent, { gap: ms(30) }]}>
          <TouchableOpacity
            style={{ flexDirection: "row", gap: ms(20), alignItems: "center" }}
          >
            <Pencil size={ms(18)} />
            <Text style={globalStyles.modalButtonText}>Edit Subscription</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ flexDirection: "row", gap: ms(20), alignItems: "center" }}
          >
            <Pause size={ms(18)} />
            <Text style={globalStyles.modalButtonText}>Pause Subscription</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ flexDirection: "row", gap: ms(20), alignItems: "center" }}
          >
            <RefreshCwOff size={ms(18)} color={colors.destructive} />
            <Text
              style={[
                globalStyles.modalButtonText,
                { color: colors.destructive },
              ]}
            >
              Cancel Subscription
            </Text>
          </TouchableOpacity>

          <CustomButton
            text="Close"
            onPress={() => setOptionsModalVisible(false)}
            type="secondary"
          />
        </View>
      </CustomModal>
    </SafeAreaView>
  );
}

// ─── Detail row ───────────────────────────────────────────────────────────────

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailRow}>
      {icon}
      <View style={styles.detailTextGroup}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: ms(8),
    paddingHorizontal: ms(30),
  },
  errorTitle: {
    fontFamily: "sans-semibold",
    fontSize: ms(15),
    color: "#0F172A",
    textAlign: "center",
  },
  errorSubtitle: {
    fontFamily: "sans-regular",
    fontSize: ms(13),
    color: colors.gray,
    textAlign: "center",
  },
  retryButton: {
    marginTop: ms(12),
    paddingHorizontal: ms(20),
    paddingVertical: ms(10),
    backgroundColor: colors.accent,
    borderRadius: ms(999),
  },
  retryButtonText: {
    fontFamily: "sans-semibold",
    fontSize: ms(13),
    color: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: ms(10),
    justifyContent: "space-between",
  },
  brandSection: {
    alignItems: "center",
    gap: ms(10),
    marginTop: ms(10),
  },
  brandTile: {
    width: ms(70),
    height: ms(70),
    justifyContent: "center",
    alignItems: "center",
  },
  brandInitials: {
    color: "#fff",
    fontFamily: "sans-bold",
    fontSize: ms(22),
  },
  serviceName: {
    fontFamily: "sans-bold",
    fontSize: ms(18),
    color: "#0F172A",
  },
  amountSection: {
    alignItems: "center",
    marginTop: ms(20),
  },
  amount: {
    fontFamily: "sans-bold",
    fontSize: ms(32),
    color: "#0F172A",
  },
  amountSubtext: {
    fontFamily: "sans-medium",
    fontSize: ms(13),
    color: colors.gray,
    marginTop: ms(2),
  },
  detailsCard: {
    marginTop: ms(24),
    backgroundColor: "#FFFFFF",
    borderRadius: ms(16),
    borderWidth: ms(1),
    borderColor: "#E2E8F1",
    paddingHorizontal: s(14),
    paddingVertical: vs(4),
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: ms(12),
    paddingVertical: vs(12),
  },
  detailTextGroup: {
    flex: 1,
    gap: ms(2),
  },
  detailLabel: {
    fontFamily: "sans-medium",
    fontSize: ms(11),
    color: colors.gray,
  },
  detailValue: {
    fontFamily: "sans-semibold",
    fontSize: ms(14),
    color: "#0F172A",
  },
  divider: {
    height: ms(1),
    backgroundColor: "#F1F5F9",
  },
  markPaidButton: {
    marginTop: ms(24),
    backgroundColor: colors.accent,
    borderRadius: ms(14),
    paddingVertical: ms(12),
    alignItems: "center",
  },
  markPaidText: {
    fontFamily: "sans-semibold",
    fontSize: ms(15),
    color: "#fff",
  },
  confirmCard: {
    marginTop: ms(20),
    marginBottom: ms(4),
    backgroundColor: "#FFFFFF",
    borderRadius: ms(16),
    borderWidth: ms(1),
    borderColor: "#E2E8F1",
    paddingHorizontal: s(14),
    paddingVertical: vs(12),
  },
  confirmRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: ms(12),
    paddingVertical: vs(8),
  },
  confirmTextGroup: {
    flex: 1,
    gap: ms(2),
  },
  confirmLabel: {
    fontFamily: "sans-medium",
    fontSize: ms(11),
    color: colors.gray,
  },
  confirmValue: {
    fontFamily: "sans-semibold",
    fontSize: ms(14),
    color: "#0F172A",
  },
  changeHint: {
    fontFamily: "sans-medium",
    fontSize: ms(12),
    color: colors.accent ?? "#00C889",
    alignSelf: "center",
  },
  cancelTextButton: {
    alignItems: "center",
    paddingVertical: ms(12),
  },
  cancelText: {
    fontFamily: "sans-medium",
    fontSize: ms(14),
    color: colors.gray,
  },
  // ── Payment history ─────────────────────────────────────────────────────
  historySection: {
    marginTop: ms(40),
    marginBottom: ms(40),
  },
  historySectionTitle: {
    fontFamily: "sans-bold",
    fontSize: ms(15),
    color: "#0F172A",
    marginBottom: ms(12),
  },
  historyLoadingContainer: {
    paddingVertical: ms(24),
    alignItems: "center",
  },
  historyEmptyContainer: {
    paddingVertical: ms(24),
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: ms(16),
    borderWidth: ms(1),
    borderColor: "#E2E8F1",
  },
  historyEmptyText: {
    fontFamily: "sans-medium",
    fontSize: ms(13),
    color: colors.gray,
  },
  historyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: ms(16),
    borderWidth: ms(1),
    borderColor: "#E2E8F1",
    paddingHorizontal: s(14),
    paddingVertical: vs(4),
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: vs(12),
  },
  historyLeft: {
    gap: ms(2),
  },
  historyBillingDate: {
    fontFamily: "sans-semibold",
    fontSize: ms(13),
    color: "#0F172A",
  },
  historyPaidOn: {
    fontFamily: "sans-regular",
    fontSize: ms(11),
    color: colors.gray,
  },
  historyRight: {
    alignItems: "flex-end",
    gap: ms(4),
  },
  historyAmount: {
    fontFamily: "sans-semibold",
    fontSize: ms(13),
    color: "#0F172A",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: ms(4),
    paddingHorizontal: ms(8),
    paddingVertical: ms(3),
    borderRadius: ms(999),
  },
  statusPillText: {
    fontFamily: "sans-medium",
    fontSize: ms(11),
  },
  historyLeftContainer: {
    flexDirection: "row",
    gap: ms(10),
  },
});
