import { StyleSheet } from "react-native";
import { ms, s, vs } from "react-native-size-matters";

export const colors = {
  background: "#f9fafc",
  foreground: "#081126",
  card: "#fff8e7",
  muted: "#f6eecf",
  mutedForeground: "rgba(0, 0, 0, 0.6)",
  primary: "#081126",
  accent: "#13AD74",
  border: "rgba(0, 0, 0, 0.1)",
  success: "#16a34a",
  destructive: "#dc2626",
  subscription: "#8fd1bd",
  gray: "#8FA1B9",
} as const;

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  14: 56,
  16: 64,
  18: 72,
  20: 80,
  24: 96,
  30: 120,
} as const;

export const components = {
  tabBar: {
    height: spacing[18],
    horizontalInset: spacing[5],
    radius: spacing[8],
    iconFrame: spacing[12],
    itemPaddingVertical: spacing[2],
  },
} as const;

export const globalStyles = StyleSheet.create({
  // for Buttons

  primaryButton: {
    backgroundColor: colors.accent,
    paddingVertical: vs(12),
    borderRadius: ms(12),
    alignItems: "center",
    justifyContent: "center",
    // marginTop: hp(2.5),
  },

  secondaryButton: {
    backgroundColor: colors.background,
    paddingVertical: vs(12),
    borderRadius: ms(10),
    alignItems: "center",
    justifyContent: "center",
    // marginTop: hp(2.5),
  },

  buttonText: {
    fontSize: ms(13),
    fontWeight: "500",
    color: "#ffffff",
    fontFamily: "sans-bold",
  },
  disabled: {
    opacity: 0.5,
  },

  // end of button

  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  modalContent: {
    backgroundColor: "#fff",
    paddingHorizontal: ms(20),
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: vs(25),
    gap: 10,
  },
  modalHeader: {
    paddingBottom: s(10),
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    marginBottom: vs(1),
  },
  modalTitle: {
    fontSize: ms(13),
    fontWeight: "600",
    color: "#000",
    textAlign: "center",
    borderColor: colors.accent,
    fontFamily: "sans-semibold",
  },
  modalButton: {
    paddingVertical: vs(10),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalButtonText: {
    fontSize: ms(13),
    fontWeight: "500",
    fontFamily: "sans-medium",
  },
  selectedCurrencyText: {
    fontWeight: "600",
    color: colors.accent,
  },
  checkmark: {
    width: s(15),
    height: vs(14),
    borderRadius: ms(999),
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmarkText: {
    color: "#fff",
    fontSize: ms(10),
    fontWeight: "bold",
    // fontFamily: FONTS.regular,
  },
});

export const theme = {
  colors,
  spacing,
  components,
  globalStyles,
} as const;
