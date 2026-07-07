// import { tabs } from "@/constants/data";
// import { colors, components } from "@/constants/theme";
// import { useAuth } from "@clerk/expo";

// import { Redirect, Tabs } from "expo-router";
// import React, { useEffect } from "react";
// import { Image, LayoutChangeEvent, Pressable, View } from "react-native";
// import Animated, {
//   useAnimatedStyle,
//   useSharedValue,
//   withSpring,
//   withTiming,
// } from "react-native-reanimated";
// import { useSafeAreaInsets } from "react-native-safe-area-context";

// const tabBar = components.tabBar;

// const SPRING_CONFIG = {
//   damping: 20,
//   stiffness: 200,
//   mass: 0.6,
// };

// interface TabIconProps {
//   focused: boolean;
//   icon: number;
//   index: number;
//   totalTabs: number;
// }

// const TabIcon = ({ focused, icon }: TabIconProps) => {
//   const scale = useSharedValue(focused ? 1 : 0.85);
//   const iconOpacity = useSharedValue(focused ? 1 : 0.9);

//   useEffect(() => {
//     scale.value = withSpring(focused ? 1 : 0.85, SPRING_CONFIG);
//     iconOpacity.value = withTiming(focused ? 1 : 0.9, { duration: 180 });
//   }, [focused]);

//   const animatedIconStyle = useAnimatedStyle(() => ({
//     transform: [{ scale: scale.value }],
//     opacity: iconOpacity.value,
//   }));

//   return (
//     <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
//       <Animated.View
//         style={[
//           {
//             width: tabBar.iconFrame,
//             height: tabBar.iconFrame,
//             alignItems: "center",
//             justifyContent: "center",
//             borderRadius: tabBar.iconFrame / 2,
//           },
//           animatedIconStyle,
//         ]}
//       >
//         <Image
//           source={icon}
//           style={{
//             width: tabBar.iconFrame * 0.5,
//             height: tabBar.iconFrame * 0.5,
//             tintColor: focused
//               ? "rgba(255,255,255,0.95)"
//               : "rgba(255,255,255,0.45)",
//           }}
//         />
//       </Animated.View>
//     </View>
//   );
// };

// interface AnimatedTabBarProps {
//   state: { index: number; routes: { key: string; name: string }[] };
//   descriptors: Record<
//     string,
//     {
//       options: {
//         title?: string;
//         tabBarIcon?: (props: { focused: boolean }) => React.ReactNode;
//       };
//     }
//   >;
//   navigation: { emit: Function; navigate: Function };
// }

// const AnimatedTabBar = ({
//   state,
//   descriptors,
//   navigation,
// }: AnimatedTabBarProps) => {
//   const insets = useSafeAreaInsets();
//   const tabCount = state.routes.length;

//   const tabWidth = useSharedValue(0);
//   const activeIndex = useSharedValue(state.index);

//   useEffect(() => {
//     activeIndex.value = withSpring(state.index, SPRING_CONFIG);
//   }, [state.index]);

//   const pillStyle = useAnimatedStyle(() => {
//     if (tabWidth.value === 0) return { opacity: 0 };
//     return {
//       opacity: 1,
//       left: (tabWidth.value - tabBar.iconFrame) / 2,
//       transform: [{ translateX: activeIndex.value * tabWidth.value }],
//     };
//   });

//   const onBarLayout = (e: LayoutChangeEvent) => {
//     tabWidth.value = e.nativeEvent.layout.width / tabCount;
//   };

//   return (
//     <View
//       style={{
//         position: "absolute",
//         bottom: Math.max(insets.bottom, tabBar.horizontalInset),
//         left: tabBar.horizontalInset,
//         right: tabBar.horizontalInset,
//         height: tabBar.height,
//         borderRadius: tabBar.radius,

//         // ── Liquid glass base ──
//         backgroundColor: "#081126",

//         // ── Glass border ──
//         borderWidth: 1,
//         borderColor: "rgba(255, 255, 255, 0.25)",

//         // ── Depth shadow ──
//         shadowColor: "#000",
//         shadowOffset: { width: 0, height: 8 },
//         shadowOpacity: 0.35,
//         shadowRadius: 24,
//         elevation: 12,

//         flexDirection: "row",
//         overflow: "hidden",
//       }}
//       onLayout={onBarLayout}
//     >
//       {/* Top specular highlight — simulates glass rim light */}
//       {/* <View
//         pointerEvents="none"
//         style={{
//           position: "absolute",
//           top: 0,
//           left: "10%",
//           right: "10%",
//           height: 1,
//           backgroundColor: "rgba(255, 255, 255, 0.55)",
//           borderRadius: 1,
//         }}
//       /> */}

//       {/* Upper gloss sweep */}
//       {/* <View
//         pointerEvents="none"
//         style={{
//           position: "absolute",
//           top: 0,
//           left: 0,
//           right: 0,
//           height: tabBar.height * 0.45,
//           backgroundColor: "rgba(255, 255, 255, 0.07)",
//           borderTopLeftRadius: tabBar.radius,
//           borderTopRightRadius: tabBar.radius,
//         }}
//       /> */}

//       {/* Sliding pill */}
//       <Animated.View
//         pointerEvents="none"
//         style={[
//           {
//             position: "absolute",
//             top: tabBar.height / 2 - tabBar.iconFrame / 2,
//             width: tabBar.iconFrame,
//             height: tabBar.iconFrame,
//             borderRadius: tabBar.iconFrame / 2,

//             // ── Pill glass fill (accent colour with gloss) ──
//             backgroundColor: colors.accent,
//             opacity: 0.88,

//             // ── Pill glow + inner rim light ──
//             shadowColor: colors.accent,
//             shadowOffset: { width: 0, height: 4 },
//             shadowOpacity: 0.6,
//             shadowRadius: 12,

//             borderWidth: 1,
//             borderColor: "rgba(255,255,255,0.40)",
//           },
//           pillStyle,
//         ]}
//       >
//         {/* Pill inner specular dome */}
//         {/* <View
//           style={{
//             position: "absolute",
//             top: 3,
//             left: "15%",
//             right: "15%",
//             height: "38%",
//             backgroundColor: "rgba(255,255,255,0.15)",
//             borderRadius: 99,
//           }}
//         /> */}
//       </Animated.View>

//       {/* Tab buttons */}
//       {state.routes.map((route, index) => {
//         const { options } = descriptors[route.key];
//         const focused = state.index === index;

//         const onPress = () => {
//           const event = navigation.emit({
//             type: "tabPress",
//             target: route.key,
//             canPreventDefault: true,
//           });
//           if (!focused && !event.defaultPrevented) {
//             navigation.navigate(route.name);
//           }
//         };

//         const tabData = tabs[index];

//         return (
//           <Pressable
//             key={route.key}
//             onPress={onPress}
//             style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
//             accessibilityRole="button"
//             accessibilityState={{ selected: focused }}
//             accessibilityLabel={options.title ?? route.name}
//           >
//             <TabIcon
//               focused={focused}
//               icon={tabData.icon}
//               index={index}
//               totalTabs={tabCount}
//             />
//           </Pressable>
//         );
//       })}
//     </View>
//   );
// };

// const TabLayout = () => {
//   const { isSignedIn, isLoaded } = useAuth();

//   if (!isLoaded) return null;
//   if (!isSignedIn) return <Redirect href="/(auth)/sign-in" />;

//   return (
//     <Tabs
//       screenOptions={{
//         headerShown: false,
//         tabBarShowLabel: false,
//         sceneStyle: { backgroundColor: "transparent" },
//       }}
//       tabBar={(props) => <AnimatedTabBar {...props} />}
//     >
//       {tabs.map((tab) => (
//         <Tabs.Screen
//           key={tab.name}
//           name={tab.name}
//           options={{ title: tab.title }}
//         />
//       ))}
//     </Tabs>
//   );
// };

// export default TabLayout;
import WelcomeTour, { CoachStep } from "@/components/ui/WelcomeTour";
import { tabs } from "@/constants/data";
import { colors, components } from "@/constants/theme";
import { useEntryToast } from "@/hooks/useEntryToast";
import { useAuth } from "@clerk/expo";
import { Redirect, Tabs } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Image, LayoutChangeEvent, Pressable, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const tabBar = components.tabBar;

const SPRING_CONFIG = {
  damping: 20,
  stiffness: 200,
  mass: 0.6,
};

interface TabIconProps {
  focused: boolean;
  icon: number;
  index: number;
  totalTabs: number;
}

// TabIcon no longer calls useEntryToast — that hook lives once in TabLayout.
const TabIcon = ({ focused, icon }: TabIconProps) => {
  const scale = useSharedValue(focused ? 1 : 0.85);
  const iconOpacity = useSharedValue(focused ? 1 : 0.9);

  useEffect(() => {
    scale.value = withSpring(focused ? 1 : 0.85, SPRING_CONFIG);
    iconOpacity.value = withTiming(focused ? 1 : 0.9, { duration: 180 });
  }, [focused]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: iconOpacity.value,
  }));

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Animated.View
        style={[
          {
            width: tabBar.iconFrame,
            height: tabBar.iconFrame,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: tabBar.iconFrame / 2,
          },
          animatedIconStyle,
        ]}
      >
        <Image
          source={icon}
          style={{
            width: tabBar.iconFrame * 0.5,
            height: tabBar.iconFrame * 0.5,
            tintColor: focused
              ? "rgba(255,255,255,0.95)"
              : "rgba(255,255,255,0.45)",
          }}
        />
      </Animated.View>
    </View>
  );
};

interface AnimatedTabBarProps {
  state: { index: number; routes: { key: string; name: string }[] };
  descriptors: Record<
    string,
    {
      options: {
        title?: string;
        tabBarIcon?: (props: { focused: boolean }) => React.ReactNode;
      };
    }
  >;
  navigation: { emit: Function; navigate: Function };
  onTabMeasured: (index: number, x: number, y: number) => void;
}

const AnimatedTabBar = ({
  state,
  descriptors,
  navigation,
  onTabMeasured,
}: AnimatedTabBarProps) => {
  const insets = useSafeAreaInsets();
  const tabCount = state.routes.length;
  const tabWidth = useSharedValue(0);
  const activeIndex = useSharedValue(state.index);
  // Refs to each tab Pressable so we can measure absolute screen position.
  const tabRefs = useRef<(View | null)[]>([]);

  useEffect(() => {
    activeIndex.value = withSpring(state.index, SPRING_CONFIG);
  }, [state.index]);

  const pillStyle = useAnimatedStyle(() => {
    if (tabWidth.value === 0) return { opacity: 0 };
    return {
      opacity: 1,
      left: (tabWidth.value - tabBar.iconFrame) / 2,
      transform: [{ translateX: activeIndex.value * tabWidth.value }],
    };
  });

  const onBarLayout = (e: LayoutChangeEvent) => {
    tabWidth.value = e.nativeEvent.layout.width / tabCount;
  };

  // After bar lays out, measure each tab button's absolute screen position.
  // We use measureInWindow so coords are relative to the screen, not the parent —
  // this is what WelcomeTour needs to position the spotlight correctly.
  const measureTab = useCallback(
    (index: number) => {
      const ref = tabRefs.current[index];
      if (!ref) return;
      ref.measureInWindow((x, y, width, height) => {
        onTabMeasured(index, x + width / 2, y + height / 2);
      });
    },
    [onTabMeasured],
  );

  return (
    <View
      style={{
        position: "absolute",
        bottom: Math.max(insets.bottom, tabBar.horizontalInset),
        left: tabBar.horizontalInset,
        right: tabBar.horizontalInset,
        height: tabBar.height,
        borderRadius: tabBar.radius,
        backgroundColor: "#081126",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.25)",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 24,
        elevation: 12,
        flexDirection: "row",
        overflow: "hidden",
      }}
      onLayout={onBarLayout}
    >
      {/* Sliding pill */}
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: "absolute",
            top: tabBar.height / 2 - tabBar.iconFrame / 2,
            width: tabBar.iconFrame,
            height: tabBar.iconFrame,
            borderRadius: tabBar.iconFrame / 2,
            backgroundColor: colors.accent,
            opacity: 0.88,
            shadowColor: colors.accent,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.6,
            shadowRadius: 12,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.40)",
          },
          pillStyle,
        ]}
      />

      {/* Tab buttons */}
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const focused = state.index === index;
        const tabData = tabs[index];

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={route.key}
            ref={(el) => {
              tabRefs.current[index] = el;
            }}
            onPress={onPress}
            onLayout={() => {
              // Small delay to let the layout settle before measuring
              // absolute window coordinates.
              setTimeout(() => measureTab(index), 100);
            }}
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
            accessibilityRole="button"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={options.title ?? route.name}
          >
            <TabIcon
              focused={focused}
              icon={tabData.icon}
              index={index}
              totalTabs={tabCount}
            />
          </Pressable>
        );
      })}
    </View>
  );
};

const TabLayout = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const { showTour, onTourDone } = useEntryToast();

  // Accumulate measured tab positions. Tour only shows once all tabs measured.
  const [coachSteps, setCoachSteps] = useState<CoachStep[]>([]);
  const measuredTabs = useRef<Record<number, { x: number; y: number }>>({});

  const onTabMeasured = useCallback((index: number, x: number, y: number) => {
    measuredTabs.current[index] = { x, y };

    const allMeasured =
      Object.keys(measuredTabs.current).length === tabs.length;

    if (allMeasured) {
      const steps: CoachStep[] = tabs.map((tab, i) => ({
        x: measuredTabs.current[i]!.x,
        y: measuredTabs.current[i]!.y,
        title: tab.title,
        description: tab.tourDescription ?? `Explore ${tab.title}`,
      }));
      setCoachSteps(steps);
    }
  }, []);

  if (!isLoaded) return null;
  if (!isSignedIn) return <Redirect href="/(auth)/sign-in" />;

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          sceneStyle: { backgroundColor: "transparent" },
        }}
        tabBar={(props) => (
          <AnimatedTabBar {...props} onTabMeasured={onTabMeasured} />
        )}
      >
        {tabs.map((tab) => (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={{ title: tab.title }}
          />
        ))}
      </Tabs>

      {/* WelcomeTour sits outside Tabs so it overlays everything including the tab bar */}
      <WelcomeTour
        visible={showTour && coachSteps.length === tabs.length}
        steps={coachSteps}
        onDone={onTourDone}
      />
    </View>
  );
};

export default TabLayout;
