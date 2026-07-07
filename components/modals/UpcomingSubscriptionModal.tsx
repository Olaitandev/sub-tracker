import CustomModal from "@/components/ui/CustomModal";
import { BRAND_ICON_IMAGES } from "@/constants/icons";
import { colors, globalStyles } from "@/constants/theme";
import { formatCurrency, getInitials } from "@/lib/utils";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Calendar, Check, FileText, Repeat, X } from "lucide-react-native";
import { useState } from "react";
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ms, s, vs } from "react-native-size-matters";
import CustomButton from "../ui/CustomButton";

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

// ─── Types ────────────────────────────────────────────────────────────────────

interface UpcomingSubscriptionModalProps {
  visible: boolean;
  selectedSubscription: Subscription | null;
  onCloseUpcomingSubscriptionModal: () => void;
  markAsPaid: (paidAt: string) => Promise<void>;
}

type ModalView = "detail" | "confirm";

// ─── Main component ───────────────────────────────────────────────────────────

const UpcomingSubscriptionModal = ({
  visible,
  selectedSubscription,
  onCloseUpcomingSubscriptionModal,
  markAsPaid,
}: UpcomingSubscriptionModalProps) => {
  const [view, setView] = useState<ModalView>("detail");
  const [paidAt, setPaidAt] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const image = selectedSubscription?.icon_id
    ? BRAND_ICON_IMAGES[selectedSubscription.icon_id]
    : null;
  const bgColor = selectedSubscription?.icon_color ?? "#8E8E93";
  const initials = getInitials(selectedSubscription?.service_name ?? "");

  // Reset to detail view whenever modal opens
  function handleClose() {
    if (isSubmitting) return;
    setView("detail");
    setPaidAt(new Date());
    setShowDatePicker(false);
    setIsSubmitting(false);
    onCloseUpcomingSubscriptionModal();
  }

  function handleOpenConfirm() {
    setPaidAt(new Date());
    setView("confirm");
  }

  function handleCancelConfirm() {
    setShowDatePicker(false);
    setView("detail");
  }

  async function handleConfirmPayment() {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await markAsPaid(paidAt.toISOString());
      handleClose();
    } catch {
      // Parent's markAsPaid is responsible for showing error toasts
      setIsSubmitting(false);
    }
  }

  // ─── Brand tile (shared between both views) ──────────────────────────────

  const BrandHeader = () => (
    <View style={styles.brandHeader}>
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
      <Text style={styles.serviceName}>
        {selectedSubscription?.service_name}
      </Text>
      <Text style={styles.amount}>
        {formatCurrency(
          selectedSubscription?.amount,
          selectedSubscription?.currency_code,
        )}
      </Text>
    </View>
  );

  // ─── Detail view ─────────────────────────────────────────────────────────

  const DetailView = () => (
    <View>
      <View style={styles.closeRow}>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <X size={ms(20)} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      <BrandHeader />

      <View style={styles.detailsCard}>
        <DetailRow
          icon={<Calendar size={ms(18)} color={colors.gray} />}
          label="Next renewal"
          value={
            selectedSubscription?.next_renewal_date
              ? formatFullDate(selectedSubscription.next_renewal_date)
              : "N/A"
          }
        />
        <View style={styles.divider} />
        <DetailRow
          icon={<Repeat size={ms(18)} color={colors.gray} />}
          label="Billing cycle"
          value={selectedSubscription?.billing_cycle ?? ""}
        />
        <View style={styles.divider} />
        <DetailRow
          icon={<Calendar size={ms(18)} color={colors.gray} />}
          label="Start date"
          value={formatFullDate(selectedSubscription?.start_date ?? "")}
        />
        <View style={styles.divider} />
        <DetailRow
          icon={<Calendar size={ms(18)} color={colors.gray} />}
          label="Category"
          value={selectedSubscription?.category ?? ""}
        />

        {selectedSubscription?.notifications && (
          <>
            <View style={styles.divider} />
            <DetailRow
              icon={<Calendar size={ms(18)} color={colors.gray} />}
              label="Notifications"
              value={selectedSubscription.notifications.join(", ")}
            />
          </>
        )}

        {selectedSubscription?.notes && (
          <>
            <View style={styles.divider} />
            <DetailRow
              icon={<FileText size={ms(18)} color={colors.gray} />}
              label="Notes"
              value={selectedSubscription.notes}
            />
          </>
        )}
      </View>

      <CustomButton
        onPress={handleOpenConfirm}
        text="Mark as Paid"
        style={{ marginTop: ms(20) }}
      />
    </View>
  );

  // ─── Confirm view ─────────────────────────────────────────────────────────

  const ConfirmView = () => (
    <View>
      <View style={styles.closeRow}>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <X size={ms(20)} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      <BrandHeader />

      <View style={styles.detailsCard}>
        {/* Paid on row — tappable to open date picker */}
        <TouchableOpacity
          style={styles.detailRow}
          onPress={() => setShowDatePicker(true)}
          activeOpacity={0.7}
        >
          <Calendar size={ms(18)} color={colors.gray} />
          <View style={styles.detailTextGroup}>
            <Text style={styles.detailLabel}>Paid on</Text>
            <Text style={styles.detailValue}>{formatDateShort(paidAt)}</Text>
          </View>
          {/* Subtle edit indicator */}
          <Text style={styles.editHint}>Change</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* Amount — read-only confirmation */}
        <View style={styles.detailRow}>
          <Check size={ms(18)} color={colors.gray} />
          <View style={styles.detailTextGroup}>
            <Text style={styles.detailLabel}>Amount</Text>
            <Text style={styles.detailValue}>
              {formatCurrency(
                selectedSubscription?.amount,
                selectedSubscription?.currency_code,
              )}
            </Text>
          </View>
        </View>
      </View>

      {/* Date picker — iOS inline, Android modal */}
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
          style={{ marginTop: ms(12) }}
        />
      )}

      <CustomButton
        onPress={handleConfirmPayment}
        text={isSubmitting ? "Saving…" : "Confirm Payment"}
        style={{ marginTop: ms(20) }}
        disabled={isSubmitting}
      />

      <TouchableOpacity
        style={styles.cancelTextButton}
        onPress={handleCancelConfirm}
        disabled={isSubmitting}
      >
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <CustomModal visible={visible} onClose={handleClose}>
      <ScrollView
        style={globalStyles.modalContent}
        keyboardShouldPersistTaps="handled"
      >
        {selectedSubscription && (
          <>{view === "detail" ? <DetailView /> : <ConfirmView />}</>
        )}
      </ScrollView>
    </CustomModal>
  );
};

export default UpcomingSubscriptionModal;

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
  closeRow: {
    alignItems: "flex-end",
  },
  closeButton: {
    padding: ms(5),
    borderRadius: ms(10),
  },
  brandHeader: {
    justifyContent: "center",
    alignItems: "center",
    gap: ms(5),
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
    fontSize: ms(13),
  },
  amount: {
    fontFamily: "sans-bold",
    fontSize: ms(25),
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
  editHint: {
    fontFamily: "sans-medium",
    fontSize: ms(12),
    color: colors.primary ?? "#3B82F6",
    alignSelf: "center",
  },
  cancelTextButton: {
    alignItems: "center",
    paddingVertical: ms(14),
  },
  cancelText: {
    fontFamily: "sans-medium",
    fontSize: ms(14),
    color: colors.gray,
  },
});
