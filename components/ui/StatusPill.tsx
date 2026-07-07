// components/StatusPill.tsx
import { SubscriptionStatus } from "@/type";
import { StyleSheet, Text, View } from "react-native";
import { ms } from "react-native-size-matters";

const STATUS_CONFIG: Record
  SubscriptionStatus,
  { label: string; bg: string; text: string }
> = {
  active: { label: "Active", bg: "#DCFCE7", text: "#16A34A" },
  paused: { label: "Paused", bg: "#FEF3C7", text: "#D97706" },
  cancelled: { label: "Cancelled", bg: "#F1F5F9", text: "#64748B" },
};

const FALLBACK_CONFIG = { label: "Unknown", bg: "#F1F5F9", text: "#64748B" };

type Props = {
  status: SubscriptionStatus | null | undefined;
};

export default function StatusPill({ status }: Props) {
  const config = status ? STATUS_CONFIG[status] ?? FALLBACK_CONFIG : FALLBACK_CONFIG;

  return (
    <View style={[styles.pill, { backgroundColor: config.bg }]}>
      <View style={[styles.dot, { backgroundColor: config.text }]} />
      <Text style={[styles.label, { color: config.text }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: ms(4),
    paddingHorizontal: ms(8),
    paddingVertical: ms(3),
    borderRadius: ms(999),
    alignSelf: "flex-start",
  },
  dot: {
    width: ms(5),
    height: ms(5),
    borderRadius: ms(999),
  },
  label: {
    fontFamily: "sans-semibold",
    fontSize: ms(10),
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
});