import { MaterialIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useEffect } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useToast as useToastNotifications } from "react-native-toast-notifications";
import { colors } from "../../constants/theme";

// Custom hook for easy notification usage with beautiful toast notifications
export const useToast = () => {
  const toast = useToastNotifications();

  const showSuccess = (
    title: string,
    description?: string,
    delay: number = 0,
  ) => {
    setTimeout(() => {
      toast.show(description ? `${title}|${description}` : title, {
        type: "success",
        placement: "top",
        duration: 4000,
        animationType: "slide-in",
      });
    }, delay);
  };

  const showError = (
    title: string,
    description?: string,
    delay: number = 0,
  ) => {
    setTimeout(() => {
      toast.show(description ? `${title}|${description}` : title, {
        type: "danger",
        placement: "top",
        duration: 4000,
        animationType: "slide-in",
      });
    }, delay);
  };

  const showWarning = (
    title: string,
    description?: string,
    delay: number = 0,
  ) => {
    setTimeout(() => {
      toast.show(description ? `${title}|${description}` : title, {
        type: "warning",
        placement: "top",
        duration: 4000,
        animationType: "slide-in",
      });
    }, delay);
  };

  const showInfo = (title: string, description?: string, delay: number = 0) => {
    setTimeout(() => {
      toast.show(description ? `${title}|${description}` : title, {
        type: "normal",
        placement: "top",
        duration: 4000,
        animationType: "slide-in",
      });
    }, delay);
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};

// Per-type visual config
const TOAST_CONFIG = {
  success: {
    icon: "check-circle" as const,
    tint: colors.accent,
  },
  danger: {
    icon: "error" as const,
    tint: colors.destructive,
  },
  warning: {
    icon: "warning" as const,
    tint: colors.primary,
  },
  normal: {
    icon: "info" as const,
    tint: colors.primary,
  },
} as const;

// Custom Toast Renderer Component
export const CustomToast = ({ toast }: any) => {
  const message = toast.message as string;
  const [title, description] = message.split("|");
  const duration = toast.duration ?? 4000;

  const config =
    TOAST_CONFIG[toast.type as keyof typeof TOAST_CONFIG] ??
    TOAST_CONFIG.normal;

  const progress = useSharedValue(1);

  useEffect(() => {
    progress.value = withTiming(0, {
      duration,
      easing: Easing.linear,
    });
  }, [duration]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <View style={styles.shadowWrap}>
      <BlurView
        intensity={Platform.OS === "ios" ? 60 : 100}
        tint="dark"
        experimentalBlurMethod={
          Platform.OS === "android" ? "dimezisBlurView" : undefined
        }
        style={styles.blur}
      >
        {/* colored tint sits on top of the blur, type-specific */}
        <View style={[styles.tint, { backgroundColor: `${config.tint}E6` }]} />

        <View style={styles.content}>
          <View style={styles.iconBadge}>
            <MaterialIcons name={config.icon} size={20} color="#fff" />
          </View>

          <View style={styles.textWrap}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            {description ? (
              <Text style={styles.description} numberOfLines={2}>
                {description}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, progressStyle]} />
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  shadowWrap: {
    minWidth: "90%",
    marginHorizontal: 16,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 10,
  },
  blur: {
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  tint: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  description: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    fontWeight: "400",
    lineHeight: 17,
    marginTop: 2,
  },
  progressTrack: {
    height: 3,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.55)",
  },
});
