import { components } from "@/constants/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const tabBar = components.tabBar;

/**
 * Returns the total vertical space occupied by the floating tab bar,
 * including safe-area inset and the gap above it.
 * Use this as scroll content's paddingBottom so the last item
 * isn't hidden behind the bar.
 */
export const useTabBarHeight = (extraSpacing: number = 16) => {
  const insets = useSafeAreaInsets();

  const bottomInset = Math.max(insets.bottom, tabBar.horizontalInset);

  return tabBar.height + bottomInset + extraSpacing;
};
