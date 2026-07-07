import { colors } from "@/constants/theme";
import { SubscriptionStatus } from "@/type";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ms } from "react-native-size-matters";

export type StatusFilter = "all" | SubscriptionStatus;

type FilterOption = {
  key: StatusFilter;
  label: string;
};

const FILTER_OPTIONS: FilterOption[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "paused", label: "Paused" },
  { key: "cancelled", label: "Cancelled" },
];

type Props = {
  selected: StatusFilter;
  onSelect: (filter: StatusFilter) => void;
  counts: Record<StatusFilter, number>;
};

export default function StatusFilterPills({
  selected,
  onSelect,
  counts,
}: Props) {
  return (
    <View style={styles.row}>
      {FILTER_OPTIONS.map((option) => {
        const isActive = selected === option.key;
        const count = counts[option.key];

        return (
          <TouchableOpacity
            key={option.key}
            onPress={() => onSelect(option.key)}
            style={[styles.pill, isActive && styles.pillActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={`Filter by ${option.label}, ${count} subscriptions`}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {option.label}
            </Text>
            {count > 0 && (
              <View
                style={[styles.countBadge, isActive && styles.countBadgeActive]}
              >
                <Text
                  style={[styles.countText, isActive && styles.countTextActive]}
                >
                  {count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: ms(8),
    marginTop: ms(12),
    paddingBottom: ms(12),
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: ms(5),
    paddingHorizontal: ms(12),
    paddingVertical: ms(7),
    borderRadius: ms(999),
    backgroundColor: "#F1F5F9",
    borderWidth: ms(1),
    borderColor: "#E2E8F1",
  },
  pillActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  label: {
    fontFamily: "sans-semibold",
    fontSize: ms(12),
    color: "#62748E",
  },
  labelActive: {
    color: "#fff",
  },
  countBadge: {
    minWidth: ms(16),
    height: ms(16),
    borderRadius: ms(999),
    backgroundColor: "#E2E8F1",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: ms(4),
  },
  countBadgeActive: {
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  countText: {
    fontFamily: "sans-bold",
    fontSize: ms(10),
    color: "#62748E",
  },
  countTextActive: {
    color: "#fff",
  },
});
