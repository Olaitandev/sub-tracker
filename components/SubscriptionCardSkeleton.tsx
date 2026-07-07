import { StyleSheet, View } from "react-native";
import { ms, vs } from "react-native-size-matters";

export default function SubscriptionCardSkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.iconPlaceholder} />
      <View style={{ flex: 1, gap: vs(6) }}>
        <View style={styles.linePlaceholder} />
        <View style={[styles.linePlaceholder, { width: "40%" }]} />
      </View>
      <View style={styles.amountPlaceholder} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: ms(12),
    padding: ms(14),
    borderRadius: ms(16),
    backgroundColor: "#F1F5F9",
  },
  iconPlaceholder: {
    width: ms(40),
    height: ms(40),
    borderRadius: ms(10),
    backgroundColor: "#E2E8F1",
  },
  linePlaceholder: {
    height: vs(10),
    width: "70%",
    borderRadius: ms(4),
    backgroundColor: "#E2E8F1",
  },
  amountPlaceholder: {
    width: ms(50),
    height: vs(14),
    borderRadius: ms(4),
    backgroundColor: "#E2E8F1",
  },
});
