// components/ui/WelcomeTour.tsx
//
// Shown once to new users arriving from onboarding (entry === "onboarding").
// Phase 1: confetti burst for 2.5s.
// Phase 2: coach mark walkthrough — one step per tab, user taps to advance.
//
// Usage: render in your (tabs)/_layout.tsx and pass tab button positions via refs.
// The parent measures each tab button and passes the coords down as `steps`.

import { useEffect, useState } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const SPOTLIGHT_SIZE = 72;
const TOOLTIP_WIDTH = 240;

export interface CoachStep {
  x: number; // center x of the target element
  y: number; // center y of the target element
  title: string;
  description: string;
}

interface WelcomeTourProps {
  visible: boolean;
  steps: CoachStep[];
  onDone: () => void;
}

type Phase = "confetti" | "coach" | "done";

export default function WelcomeTour({
  visible,
  steps,
  onDone,
}: WelcomeTourProps) {
  const [phase, setPhase] = useState<Phase>("confetti");
  const [stepIndex, setStepIndex] = useState(0);

  const spotlightX = useSharedValue(SCREEN_WIDTH / 2);
  const spotlightY = useSharedValue(SCREEN_HEIGHT / 2);
  const spotlightScale = useSharedValue(0);

  const currentStep = steps[stepIndex];

  // Reset state when tour becomes visible.
  useEffect(() => {
    if (visible) {
      setPhase("confetti");
      setStepIndex(0);
      spotlightScale.value = 0;

      // After confetti, transition to coach marks.
      const t = setTimeout(() => {
        setPhase("coach");
        if (steps[0]) {
          spotlightX.value = steps[0].x;
          spotlightY.value = steps[0].y;
          spotlightScale.value = withSpring(1, { damping: 14, stiffness: 160 });
        }
      }, 2500);

      return () => clearTimeout(t);
    }
  }, [visible]);

  // Animate spotlight to new position on step change.
  useEffect(() => {
    if (phase !== "coach" || !currentStep) return;
    spotlightX.value = withSpring(currentStep.x, {
      damping: 18,
      stiffness: 180,
    });
    spotlightY.value = withSpring(currentStep.y, {
      damping: 18,
      stiffness: 180,
    });
  }, [stepIndex, phase]);

  const spotlightStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: spotlightX.value - SPOTLIGHT_SIZE / 2 },
      { translateY: spotlightY.value - SPOTLIGHT_SIZE / 2 },
      { scale: spotlightScale.value },
    ],
  }));

  const handleNext = () => {
    if (stepIndex < steps.length - 1) {
      setStepIndex((i) => i + 1);
    } else {
      spotlightScale.value = withTiming(0, { duration: 200 });
      setTimeout(() => {
        setPhase("done");
        onDone();
      }, 200);
    }
  };

  const handleSkip = () => {
    spotlightScale.value = withTiming(0, { duration: 150 });
    setTimeout(() => {
      setPhase("done");
      onDone();
    }, 150);
  };

  if (!visible || phase === "done") return null;

  // Tooltip position: above spotlight if near bottom of screen, else below.
  const tooltipTop = currentStep
    ? currentStep.y > SCREEN_HEIGHT * 0.7
      ? currentStep.y - SPOTLIGHT_SIZE / 2 - 120
      : currentStep.y + SPOTLIGHT_SIZE / 2 + 16
    : 0;

  const tooltipLeft = currentStep
    ? Math.min(
        Math.max(currentStep.x - TOOLTIP_WIDTH / 2, 16),
        SCREEN_WIDTH - TOOLTIP_WIDTH - 16,
      )
    : 0;

  return (
    <Modal
      transparent
      animationType="none"
      visible={visible}
      statusBarTranslucent
    >
      {/* Phase 1: Confetti */}
      {phase === "confetti" && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <ConfettiCannon
            count={180}
            origin={{ x: SCREEN_WIDTH / 2, y: -20 }}
            autoStart
            fadeOut
            fallSpeed={3000}
            colors={["#10b981", "#34d399", "#6ee7b7", "#ffffff", "#a7f3d0"]}
          />
        </View>
      )}

      {/* Phase 2: Coach marks */}
      {phase === "coach" && currentStep && (
        <>
          {/* Dark overlay with cutout — implemented as 4 rects around the spotlight */}
          <Pressable style={StyleSheet.absoluteFill} onPress={handleNext}>
            {/* Top */}
            <View
              style={[
                styles.overlayRect,
                {
                  top: 0,
                  left: 0,
                  right: 0,
                  height: currentStep.y - SPOTLIGHT_SIZE / 2,
                },
              ]}
            />
            {/* Bottom */}
            <View
              style={[
                styles.overlayRect,
                {
                  top: currentStep.y + SPOTLIGHT_SIZE / 2,
                  left: 0,
                  right: 0,
                  bottom: 0,
                },
              ]}
            />
            {/* Left */}
            <View
              style={[
                styles.overlayRect,
                {
                  top: currentStep.y - SPOTLIGHT_SIZE / 2,
                  left: 0,
                  width: currentStep.x - SPOTLIGHT_SIZE / 2,
                  height: SPOTLIGHT_SIZE,
                },
              ]}
            />
            {/* Right */}
            <View
              style={[
                styles.overlayRect,
                {
                  top: currentStep.y - SPOTLIGHT_SIZE / 2,
                  left: currentStep.x + SPOTLIGHT_SIZE / 2,
                  right: 0,
                  height: SPOTLIGHT_SIZE,
                },
              ]}
            />
          </Pressable>

          {/* Animated spotlight ring */}
          <Animated.View
            style={[styles.spotlight, spotlightStyle]}
            pointerEvents="none"
          />

          {/* Tooltip */}
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(150)}
            key={stepIndex}
            style={[styles.tooltip, { top: tooltipTop, left: tooltipLeft }]}
          >
            <Text style={styles.tooltipTitle}>{currentStep.title}</Text>
            <Text style={styles.tooltipDescription}>
              {currentStep.description}
            </Text>

            <View style={styles.tooltipFooter}>
              <Pressable onPress={handleSkip} hitSlop={10}>
                <Text style={styles.skipText}>Skip</Text>
              </Pressable>
              <View style={styles.stepIndicators}>
                {steps.map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.dot,
                      i === stepIndex ? styles.dotActive : styles.dotInactive,
                    ]}
                  />
                ))}
              </View>
              <Pressable onPress={handleNext} hitSlop={10}>
                <Text style={styles.nextText}>
                  {stepIndex === steps.length - 1 ? "Done" : "Next"}
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        </>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlayRect: {
    position: "absolute",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  spotlight: {
    position: "absolute",
    width: SPOTLIGHT_SIZE,
    height: SPOTLIGHT_SIZE,
    borderRadius: SPOTLIGHT_SIZE / 2,
    borderWidth: 2.5,
    borderColor: "#10b981",
    backgroundColor: "transparent",
  },
  tooltip: {
    position: "absolute",
    width: TOOLTIP_WIDTH,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  tooltipTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111",
    marginBottom: 4,
  },
  tooltipDescription: {
    fontSize: 13,
    color: "#6b7280",
    lineHeight: 18,
    marginBottom: 14,
  },
  tooltipFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  skipText: {
    fontSize: 13,
    color: "#9ca3af",
    fontWeight: "500",
  },
  nextText: {
    fontSize: 13,
    color: "#10b981",
    fontWeight: "700",
  },
  stepIndicators: {
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    backgroundColor: "#10b981",
    width: 16,
  },
  dotInactive: {
    backgroundColor: "#d1d5db",
  },
});
