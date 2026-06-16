/**
 * SubTrack — Onboarding Screen
 *
 * - Skip → router.replace("/(auth)/signup") + marks onboarding done
 * - AsyncStorage + Zod persists first-launch flag
 * - Slide copy: staggered translateX + opacity driven by scrollX (UI thread)
 * - Card: scale + opacity parallax
 * - Last step auth buttons → completeOnboarding()
 */

import { colors } from "@/constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  ArrowRight,
  BellRing,
  Clapperboard,
  Cloud,
  CreditCard,
  Sparkles,
} from "lucide-react-native";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from "react-native";
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { ms, vs } from "react-native-size-matters";

const STORAGE_KEY = "subtrack:onboarding";

/**
 * Mark onboarding as complete and persist to device.
 * Call this on Skip, Continue on last step, or any auth button tap.
 */
async function markOnboardingComplete(): Promise<void> {
  const payload = {
    hasSeenOnboarding: true,
    completedAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

/**
 * Read onboarding state from device.
 * Returns null on first launch or if stored data is corrupt.
 *
 * Usage in app/_layout.tsx:
 *
 *   useEffect(() => {
 *     getOnboardingState().then((state) => {
 *       if (state?.hasSeenOnboarding) {
 *         router.replace("/(auth)/signup");
 *       }
 *     });
 *   }, []);
 */
export async function getOnboardingState(): Promise<OnboardingState | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return OnboardingStateSchema.parse(JSON.parse(raw));
  } catch {
    // Corrupt / outdated shape — treat as first launch
    await AsyncStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

// ─── Navigation helper ────────────────────────────────────────────────────────

async function completeOnboarding(): Promise<void> {
  await markOnboardingComplete();
  console.log("completed onboarding");
  router.replace("../(auth)/sign-up");
}

// ─── Types ────────────────────────────────────────────────────────────────────

type StepId = "track" | "remind" | "insights" | "toggle";

interface Step {
  id: StepId;
  eyebrow: string;
  title: string;
  description: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const STEPS: Step[] = [
  {
    id: "track",
    eyebrow: "WELCOME TO SUBTRACK",
    title: "Track Every Subscription",
    description:
      "Bring every recurring payment into one calm, beautiful place — from streaming to software.",
  },
  {
    id: "remind",
    eyebrow: "Stay ahead",
    title: "Never Miss a Payment",
    description:
      "Gentle, timely nudges before each renewal so a charge never catches you off guard.",
  },
  {
    id: "insights",
    eyebrow: "Clarity",
    title: "See Where Your Money Goes",
    description:
      "Understand your spending at a glance with elegant breakdowns of every category.",
  },
  {
    id: "toggle",
    eyebrow: "Almost there",
    title: "Enable Reminders",
    description:
      "Turn on smart notifications and let SubTrack watch your renewals for you.",
  },
  // {
  //   id: "account",
  //   eyebrow: "One last step",
  //   title: "Save & sync everywhere",
  //   description:
  //     "Free account. Encrypted. Syncs across all your devices instantly.",

  // },
];

// ─── Constants ────────────────────────────────────────────────────────────────

const { width: W, height: H } = Dimensions.get("window");
const SPRING_CFG = { damping: 22, stiffness: 240 };

// Copy slides this many px on enter/exit
const TRAVEL = 32;

// ─── Progress Dot ─────────────────────────────────────────────────────────────

function Dot({
  index,
  scrollX,
  accent,
}: {
  index: number;
  scrollX: Animated.SharedValue<number>;
  accent: string;
}) {
  const style = useAnimatedStyle(() => {
    const dist = Math.abs(scrollX.value / W - index);
    return {
      width: interpolate(dist, [0, 1], [22, 6], "clamp"),
      opacity: interpolate(dist, [0, 1], [1, 0.2], "clamp"),
      backgroundColor: accent,
    };
  });
  return <Animated.View style={[styles.dot, style]} />;
}

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({ value, onPress }: { value: boolean; onPress: () => void }) {
  const x = useSharedValue(value ? 20 : 2);
  const bg = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    x.value = withSpring(value ? 20 : 2, SPRING_CFG);
    bg.value = withTiming(value ? 1 : 0, { duration: 200 });
  }, [value]);

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
  }));
  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      bg.value,
      [0, 1],
      ["#d1d5db", colors.accent],
    ),
  }));

  return (
    <Pressable onPress={onPress} hitSlop={10} accessibilityRole="switch">
      <Animated.View style={[styles.track, trackStyle]}>
        <Animated.View style={[styles.thumb, thumbStyle]} />
      </Animated.View>
    </Pressable>
  );
}

// ─── Slide ────────────────────────────────────────────────────────────────────
//
// Animation layers (all UI-thread, driven by scrollX):
//
//   Card     → scale [1 → 0.93] + opacity [1 → 0.65] as page leaves view
//   Eyebrow  → translateX ±TRAVEL*1.6 + opacity [1 → 0] (fastest, leads)
//   Title    → translateX ±TRAVEL     + opacity [1 → 0] (mid)
//   Body     → translateX ±TRAVEL*0.6 + opacity [1 → 0] (slowest, trails)
//
// The three different travel distances create a staggered parallax effect
// without needing separate useSharedValues or JS-thread timers.

function Slide({
  step,
  index,
  scrollX,
  notifOn,
  onToggle,
}: {
  step: Step;
  index: number;
  scrollX: Animated.SharedValue<number>;
  notifOn: boolean;
  onToggle: () => void;
}) {
  // pos: 0 = centred, negative = page coming from right, positive = leaving left
  const cardStyle = useAnimatedStyle(() => {
    const dist = Math.abs(scrollX.value / W - index);
    return {
      transform: [{ scale: interpolate(dist, [0, 1], [1, 0.93], "clamp") }],
      opacity: interpolate(dist, [0, 0.7], [1, 0.6], "clamp"),
    };
  });

  const eyebrowStyle = useAnimatedStyle(() => {
    const pos = scrollX.value / W - index;
    return {
      opacity: interpolate(Math.abs(pos), [0, 0.35], [1, 0], "clamp"),
      transform: [
        {
          translateX: interpolate(
            pos,
            [-1, 0, 1],
            [TRAVEL * 1.6, 0, -TRAVEL * 1.6],
            "clamp",
          ),
        },
      ],
    };
  });

  const titleStyle = useAnimatedStyle(() => {
    const pos = scrollX.value / W - index;
    return {
      opacity: interpolate(Math.abs(pos), [0, 0.45], [1, 0], "clamp"),
      transform: [
        {
          translateX: interpolate(
            pos,
            [-1, 0, 1],
            [TRAVEL, 0, -TRAVEL],
            "clamp",
          ),
        },
      ],
    };
  });

  const bodyStyle = useAnimatedStyle(() => {
    const pos = scrollX.value / W - index;
    return {
      opacity: interpolate(Math.abs(pos), [0, 0.55], [1, 0], "clamp"),
      transform: [
        {
          translateX: interpolate(
            pos,
            [-1, 0, 1],
            [TRAVEL * 0.6, 0, -TRAVEL * 0.6],
            "clamp",
          ),
        },
      ],
    };
  });

  return (
    <View style={styles.slide} className="flex flex-col ">
      {/* ── Card ── */}

      {/* track */}
      {step.id === "track" && (
        <Animated.View className="relative items-center justify-center flex-1 ">
          <View className="relative items-center justify-center ">
            <View
              style={{
                width: ms(180),
                height: ms(200),
                position: "absolute",
                top: ms(5),
              }}
              className="p-4  rounded-3xl bg-linear-to-r from-[#D9DFF9] via-[#D9DFF9] to-[#D9DFF9] flex flex-col justify-between z-10 absolute  rotate-12 right-5 top-2 opacity-70"
            ></View>
            <View
              style={{
                width: ms(180),
                height: ms(200),
                position: "absolute",
                top: ms(5),
              }}
              className="p-4  rounded-3xl bg-linear-to-r from-[#D2E7FB] via-[#D2E7FB] to-[#D2E7FB] flex flex-col justify-between z-20 absolute -rotate-12 left-5  opacity-70"
            />
            <View
              style={{ width: ms(180), height: ms(200) }}
              className="p-4  rounded-3xl bg-linear-to-br from-[#00C889]  via-accent to-[#00A16C] flex flex-col justify-between z-30 shadow-2xl"
            >
              <View className="flex flex-row justify-between">
                <Sparkles color="#ffffff80" className="text-white/50" />
                <Text className="text-sm font-bold text-white/50">ACTIVE</Text>
              </View>
              <View>
                <Text className="text-sm text-white/50">Total Monthly</Text>
                <Text className="text-3xl font-bold text-white/90">
                  $148.50
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>
      )}

      {/* remind */}
      {step.id === "remind" && (
        <Animated.View className="relative items-center justify-center flex-1 ">
          <View className="flex gap-3">
            <View className=" bg-white shadow-2xl w-[300px] h-[70px] rounded-2xl flex flex-row gap-3 items-center px-3">
              <View className="bg-accent/10 h-[40px] w-[40px] flex items-center justify-center rounded-full">
                <BellRing color={colors.accent} />
              </View>
              <View>
                <Text className="font-semibold ">Spotify Premium</Text>
                <Text className="text-sm text-destructive">Due in 2 days</Text>
              </View>
            </View>
            <View className=" bg-white shadow-2xl w-[300px] h-[70px] rounded-2xl flex flex-row gap-3 items-center px-3">
              <View className="bg-accent/10 h-[40px] w-[40px] flex items-center justify-center rounded-full">
                <Clapperboard color={colors.accent} />
              </View>
              <View>
                <Text className="font-semibold ">Netflix Premium</Text>
                <Text className="text-sm text-destructive">Due in 5 days</Text>
              </View>
            </View>
            <View className=" bg-white shadow-2xl w-[300px] h-[70px] rounded-2xl flex flex-row gap-3 items-center px-3">
              <View className="bg-accent/10 h-[40px] w-[40px] flex items-center justify-center rounded-full">
                <Cloud color={colors.accent} />
              </View>
              <View>
                <Text className="font-semibold ">iCloud + Storage</Text>
                <Text className="text-sm text-destructive">Due in 9 days</Text>
              </View>
            </View>
          </View>
        </Animated.View>
      )}

      {/* insight */}
      {step.id === "insights" && (
        <Animated.View className="relative items-center justify-center flex-1">
          <View className=" bg-white shadow-2xl gap-5 flex flex-col justify-between h-[300px] w-[300px] rounded-3xl px-4 py-10">
            <View className="flex flex-row gap-2 ">
              <View className="flex flex-col items-center justify-end">
                <View className="bg-gray-300 h-[50px] w-[35px] rounded-2xl"></View>
                <Text className="text-xs">Mon</Text>
              </View>
              <View className="flex flex-col items-center justify-end">
                <View className="bg-gray-300 h-[100px] w-[35px] rounded-2xl"></View>
                <Text className="text-xs">Tue</Text>
              </View>
              <View className="flex flex-col items-center justify-end">
                <View className="bg-gray-300 h-[80px] w-[35px] rounded-2xl"></View>
                <Text className="text-xs">Wed</Text>
              </View>
              <View className="flex flex-col items-center justify-end">
                <View className="bg-accent h-[120px] w-[35px] rounded-2xl"></View>
                <Text className="text-xs">Thur</Text>
              </View>
              <View className="flex flex-col items-center justify-end">
                <View className="bg-gray-300 h-[70px] w-[35px] rounded-2xl"></View>
                <Text className="text-xs">Wed</Text>
              </View>
              <View className="flex flex-col items-center justify-end">
                <View className="bg-gray-300 h-[90px] w-[35px] rounded-2xl"></View>
                <Text className="text-xs">Wed</Text>
              </View>
            </View>
            <View className="gap-2">
              <View className="flex flex-row items-center justify-between">
                <View className="flex flex-row items-center gap-2">
                  <View className="bg-green-500 rounded-full size-2" />
                  <Text className="text-sm">Entertainment</Text>
                </View>
                <Text className="text-sm font-semibold">42%</Text>
              </View>
              <View className="flex flex-row items-center justify-between">
                <View className="flex flex-row items-center gap-2">
                  <View className="bg-green-500 rounded-full size-2" />
                  <Text className="text-sm">Productivity</Text>
                </View>
                <Text className="text-sm font-semibold">31%</Text>
              </View>
              <View className="flex flex-row items-center justify-between">
                <View className="flex flex-row items-center gap-2">
                  <View className="bg-green-500 rounded-full size-2" />
                  <Text className="text-sm">Utilities</Text>
                </View>
                <Text className="text-sm font-semibold">27%</Text>
              </View>
            </View>
          </View>
        </Animated.View>
      )}

      {/* toggle */}
      {step.id === "toggle" && (
        <Animated.View className="relative items-center justify-center flex-1 mx-5">
          <View>
            <View className="h-[100px] justify-center flex items-center w-[100px] bg-accent/10 rounded-2xl shadow-2xl">
              <BellRing size={40} color={colors.accent} />
            </View>
          </View>
          <Animated.View
            style={[styles.toggleCard, bodyStyle]}
            className="w-full py-5 mt-7"
          >
            <View style={styles.toggleLeft}>
              <Text style={styles.toggleLabel}>Payment reminders</Text>
              <Text style={styles.toggleSub}>
                A few days before each charge
              </Text>
            </View>
            <Toggle value={notifOn} onPress={onToggle} />
          </Animated.View>
        </Animated.View>
      )}

      {/* ── Copy (staggered parallax) ── */}
      <View
        className="flex flex-col items-center gap-4 text-center pt-30"
        style={{
          marginBottom: vs(90),
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Animated.Text
          style={[eyebrowStyle, { fontSize: ms(12), lineHeight: ms(20) }]}
          className="font-semibold text-center text-accent text-nowrap"
          numberOfLines={1}
        >
          {step.eyebrow.toUpperCase()}
        </Animated.Text>

        <Animated.Text
          style={[styles.title, titleStyle]}
          className="text-center "
        >
          {step.title}
        </Animated.Text>

        <Animated.Text className="text-center text-gray-500 ">
          {step.description}
        </Animated.Text>
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function OnboardingScreen() {
  const listRef = useRef<FlatList>(null);
  const scrollX = useSharedValue(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [notifOn, toggleNotif] = useReducer((s: boolean) => !s, false);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollX.value = e.contentOffset.x;
    },
  });

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const idx = viewableItems[0]?.index;
      if (idx != null) setActiveIndex(idx);
    },
    [],
  );

  const getItemLayout = useCallback(
    (_: ArrayLike<Step> | null | undefined, index: number) => ({
      length: W,
      offset: W * index,
      index,
    }),
    [],
  );

  const goNext = useCallback(() => {
    if (activeIndex < STEPS.length - 1) {
      listRef.current?.scrollToIndex({
        index: activeIndex + 1,
        animated: true,
      });
    }
  }, [activeIndex]);

  // Skip: persist flag then navigate
  const handleSkip = useCallback(async () => {
    await completeOnboarding();
  }, []);

  const isLast = activeIndex === STEPS.length - 1;
  const currentStep = STEPS[activeIndex];

  return (
    <View className="bg-background" style={styles.root}>
      <SafeAreaView style={styles.root}>
        <StatusBar hidden />
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.logo}>
            <View className="rounded-full bg-accent w-[32px] h-[32px] justify-center items-center">
              <Text style={styles.logoMarkTxt}>
                <CreditCard color="white" />
              </Text>
            </View>
            <Text style={styles.logoTxt}>SubTrack</Text>
          </View>

          {!isLast && (
            <Pressable
              hitSlop={12}
              onPress={handleSkip}
              accessibilityRole="button"
              accessibilityLabel="Skip onboarding"
            >
              <Text className="text-gray-500 text-md">Skip</Text>
            </Pressable>
          )}
        </View>
        {/* ── Slides ── */}
        <Animated.FlatList
          ref={listRef}
          data={STEPS}
          keyExtractor={(s) => s.id}
          renderItem={({ item, index }) => (
            <Slide
              step={item}
              index={index}
              scrollX={scrollX}
              notifOn={notifOn}
              onToggle={toggleNotif}
            />
          )}
          horizontal
          pagingEnabled
          bounces={false}
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={scrollHandler}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
          getItemLayout={getItemLayout}
        />
        {/* ── Footer ── */}
        <View style={styles.footer}>
          <View style={styles.dots} className="items-center justify-center ">
            {STEPS.map((_, i) => (
              <Dot key={i} index={i} scrollX={scrollX} accent={colors.accent} />
            ))}
          </View>

          <TouchableOpacity
            onPress={isLast ? completeOnboarding : goNext}
            style={styles.cta}
            accessibilityRole="button"
            // accessibilityLabel={isLast ? "Get started" : "Continue"}
            className="bg-accent! flex items-center flex-row justify-center gap-2"
          >
            <Text style={styles.ctaTxt}>
              {/* {isLast
              ? "Get Started"
              : activeIndex === 3 && notifOn
                ? "All set — Continue"
                : "Next"} */}

              {isLast ? "Get Started" : "Next"}
            </Text>
            <ArrowRight color="white" size={20} />
          </TouchableOpacity>

          <Text style={styles.hint}>Swipe to explore</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 4,
    paddingBottom: 8,
  },
  logo: { flexDirection: "row", alignItems: "center", gap: 8 },
  logoMark: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  logoMarkTxt: { fontSize: 16, fontWeight: "800", color: "#fff" },
  logoTxt: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: -0.3,
  },
  skip: { fontSize: 14, fontWeight: "500", color: "#9ca3af" },

  slide: {
    width: W,
    paddingHorizontal: 30,
    paddingTop: 80,
    flex: 1,
    justifyContent: "space-between",
  },

  card: {
    borderRadius: 24,
    overflow: "hidden",
    // marginBottom: 28,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cardStrip: { height: 6, width: "100%" },
  cardBody: {
    height: H * 0.36,
    alignItems: "center",
    justifyContent: "center",
  },
  cardEmoji: { fontSize: 80 },

  chip: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#ffffffee",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  chipTR: { top: 20, right: 16 },
  chipBL: { bottom: 20, left: 16 },
  chipDot: { width: 7, height: 7, borderRadius: 4 },
  chipTxt: { fontSize: 12, fontWeight: "600", color: "#374151" },

  copy: { flex: 1, paddingHorizontal: 4, overflow: "hidden" },
  eyebrow: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.8,
    marginBottom: 6,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: -0.8,
    lineHeight: vs(29),
    // marginBottom: vs(10),
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: "#6b7280",
    maxWidth: 310,
  },

  toggleCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  toggleLeft: { gap: 2 },
  toggleLabel: { fontSize: 14, fontWeight: "600", color: "#111827" },
  toggleSub: { fontSize: 12, color: "#9ca3af" },

  track: {
    width: 46,
    height: 27,
    borderRadius: 14,
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  thumb: {
    width: 23,
    height: 23,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },

  authBlock: { gap: 10, marginTop: 20 },
  authPrimary: {
    backgroundColor: "#111827",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
  },
  authPrimaryTxt: { color: "#fff", fontSize: 15, fontWeight: "700" },
  authSecondary: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  authSecondaryTxt: { color: "#374151", fontSize: 15, fontWeight: "600" },

  footer: { paddingHorizontal: 24, paddingBottom: 20, gap: 12 },
  dots: { flexDirection: "row", alignItems: "center", gap: 5 },
  dot: { height: 7, borderRadius: 3 },
  cta: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  ctaTxt: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  hint: {
    textAlign: "center",
    fontSize: 12,
    color: "#d1d5db",
    fontWeight: "500",
  },
});
