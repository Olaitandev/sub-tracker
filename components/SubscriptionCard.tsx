import { BRAND_ICON_IMAGES } from "@/constants/icons";
import { colors } from "@/constants/theme";
import { formatCurrency, getInitials } from "@/lib/utils";
import { Subscription } from "@/type";
import { CalendarArrowUp } from "lucide-react-native";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ms, s, vs } from "react-native-size-matters";

function formatAbsoluteRenewalDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDueInDays(isoDate: string): string {
  const diffDays = Math.ceil(
    (new Date(isoDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays < 0) {
    const daysOverdue = Math.abs(diffDays);
    return `Overdue by ${daysOverdue} day${daysOverdue === 1 ? "" : "s"}`;
  }
  if (diffDays === 0) return "Due today";
  if (diffDays === 1) return "Due tomorrow";
  return `Due in ${diffDays} days`;
}

function getRenewalUrgencyColor(isoDate: string): string {
  const diffDays = Math.ceil(
    (new Date(isoDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays < 0) return "#EF4444"; // overdue — red
  if (diffDays <= 3) return "#F97316"; // urgent — orange
  if (diffDays <= 7) return "#EAB308"; // soon — yellow
  return colors.gray; // normal — muted
}

// ─── Brand tile ───────────────────────────────────────────────────────────────

type BrandTileProps = {
  iconId: string | null;
  iconColor: string | null;
  iconInitials: string | null;
  size: number;
};

function BrandTile({ iconId, iconColor, iconInitials, size }: BrandTileProps) {
  const image = iconId ? BRAND_ICON_IMAGES[iconId] : null;
  const bgColor = iconColor ?? "#8E8E93";
  const initials = iconInitials ?? "?";

  return (
    <View
      style={[
        styles.brandTile,
        {
          width: size,
          height: size,
          borderRadius: size * 0.3,
          backgroundColor: bgColor,
        },
      ]}
    >
      {image ? (
        <Image
          source={image}
          style={{ width: size * 0.6, height: size * 0.6 }}
          resizeMode="contain"
        />
      ) : (
        <Text
          style={[styles.brandTileInitials, { fontSize: size * 0.3 }]}
          numberOfLines={1}
        >
          {initials}
        </Text>
      )}
    </View>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

type Props = {
  subscription: Subscription;
  onPress?: () => void;
};

export default function SubscriptionCard({ subscription, onPress }: Props) {
  const {
    service_name,
    amount,
    currency_code,
    billing_cycle,
    next_renewal_date,
    icon_id,
    icon_color,
    icon_initials,
  } = subscription;

  const renewalColor = next_renewal_date
    ? getRenewalUrgencyColor(next_renewal_date)
    : colors.gray;
  const accentColor = icon_color ?? colors.accent;
  const initials = icon_initials ?? getInitials(service_name);

  return (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <BrandTile
        iconId={icon_id}
        iconColor={icon_color}
        iconInitials={initials}
        size={ms(50)}
      />

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.serviceName} numberOfLines={1}>
            {service_name}
          </Text>
          <Text style={styles.amount}>
            {formatCurrency(amount, currency_code)}
          </Text>
        </View>

        <View style={styles.bottomRow}>
          {/* renew in june 12 */}
          <View style={styles.renewalInfo}>
            <CalendarArrowUp size={ms(15)} color={colors.gray} />
            <Text style={styles.renewalDateText}>
              Renews{"    "}
              {next_renewal_date
                ? formatAbsoluteRenewalDate(next_renewal_date)
                : "N/A"}
            </Text>
          </View>

          <View style={styles.cycleChip}>
            <Text style={styles.cycleChipText}>{billing_cycle}</Text>
          </View>
        </View>

        <View style={{ marginTop: ms(7) }}>
          {/* due in how many days */}
          <Text style={[styles.renewalLabel, { color: renewalColor }]}>
            {next_renewal_date ? formatDueInDays(next_renewal_date) : "N/A"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: ms(20),
    borderWidth: ms(1),
    borderColor: "#E2E8F1",
    paddingVertical: vs(15),
    paddingHorizontal: s(10),
    gap: ms(12),
    overflow: "hidden",
    marginHorizontal: ms(2),
    elevation: 4,
  },
  // Thin vertical stripe on the far left using the brand colour
  accentBar: {
    position: "absolute",
    left: 0,
    top: ms(12),
    bottom: ms(12),
    width: ms(3),
    borderRadius: ms(999),
  },
  brandTile: {
    justifyContent: "center",
    alignItems: "center",
    marginLeft: ms(6),
  },
  brandTileInitials: {
    color: "#fff",
    fontFamily: "sans-bold",
    textAlign: "center",
  },
  content: {
    flex: 1,
    gap: ms(6),
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: ms(8),
  },
  serviceName: {
    flex: 1,
    fontFamily: "sans-semibold",
    fontSize: ms(14),
    color: "#0F172A",
  },
  amount: {
    fontFamily: "sans-bold",
    fontSize: ms(15),
    color: "#0F172A",
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cycleChip: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: ms(8),
    paddingVertical: ms(3),
    borderRadius: ms(999),
  },
  cycleChipText: {
    fontFamily: "sans-medium",
    fontSize: ms(11),
    color: "#62748E",
  },
  renewalLabel: {
    fontFamily: "sans-medium",
    fontSize: ms(12),
  },
  renewalInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: ms(4),
  },
  renewalDateText: {
    fontFamily: "sans-medium",
    fontSize: ms(12),
    color: colors.gray,
  },
});
