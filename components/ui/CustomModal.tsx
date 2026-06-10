import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    Dimensions,
    Modal,
    PanResponder,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";
import Animated, {
    Extrapolation,
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from "react-native-reanimated";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const SPRING_CONFIG = { damping: 20, stiffness: 200, mass: 0.8 };
const DISMISS_THRESHOLD = 80;

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  scrollable?: boolean;
}

export default function BottomSheet({
  visible,
  onClose,
  children,
  scrollable = false,
}: BottomSheetProps) {
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);
  const [modalVisible, setModalVisible] = useState(false);

  // Track drag position using a plain ref so PanResponder can read/write
  // it synchronously without going through the Reanimated worklet bridge
  const dragY = useRef(0);

  const animateOpen = useCallback(() => {
    translateY.value = SCREEN_HEIGHT;
    backdropOpacity.value = 0;
    translateY.value = withSpring(0, SPRING_CONFIG);
    backdropOpacity.value = withTiming(1, { duration: 260 });
  }, []);

  const animateClose = useCallback((onDone: () => void) => {
    translateY.value = withSpring(SCREEN_HEIGHT, {
      ...SPRING_CONFIG,
      stiffness: 280,
    });
    backdropOpacity.value = withTiming(0, { duration: 220 }, (finished) => {
      if (finished) runOnJS(onDone)();
    });
  }, []);

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      requestAnimationFrame(animateOpen);
    } else {
      animateClose(() => setModalVisible(false));
    }
  }, [visible]);

  // ── PanResponder on the drag handle only ────────────────────────────────
  // Keeping it on the handle means it NEVER intercepts taps on the buttons
  // below. The handle has no tappable children so aggressive capture is fine.
  const panResponder = useRef(
    PanResponder.create({
      // Claim the responder as soon as the finger starts moving on the handle
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: () => {
        dragY.current = 0;
      },

      onPanResponderMove: (_, gestureState) => {
        const dy = gestureState.dy;
        if (dy > 0) {
          dragY.current = dy;
          // Drive the Reanimated translateY directly from the gesture
          translateY.value = dy;
          backdropOpacity.value = interpolate(
            dy,
            [0, DISMISS_THRESHOLD * 2],
            [1, 0],
            Extrapolation.CLAMP,
          );
        }
      },

      onPanResponderRelease: (_, gestureState) => {
        const { dy, vy } = gestureState;
        if (dy > DISMISS_THRESHOLD || vy > 0.8) {
          // Fast enough or far enough — dismiss
          onClose();
        } else {
          // Snap back
          translateY.value = withSpring(0, SPRING_CONFIG);
          backdropOpacity.value = withTiming(1, { duration: 150 });
        }
        dragY.current = 0;
      },

      onPanResponderTerminate: () => {
        // If the responder is stolen (e.g. by a ScrollView), snap back
        translateY.value = withSpring(0, SPRING_CONFIG);
        backdropOpacity.value = withTiming(1, { duration: 150 });
        dragY.current = 0;
      },
    }),
  ).current;

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <Animated.View
        style={[styles.backdrop, backdropStyle]}
        pointerEvents="auto"
      >
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
      </Animated.View>

      {/* Sheet */}
      <View style={styles.sheetWrapper} pointerEvents="box-none">
        <Animated.View style={[styles.sheetContainer, sheetStyle]}>
          {/* Drag handle — PanResponder lives here only */}
          <View {...panResponder.panHandlers} style={styles.dragHandleWrapper}>
            <View style={styles.dragHandle} />
          </View>

          {/* Children receive touches normally — no gesture interference */}
          {scrollable ? (
            <ScrollView
              bounces={false}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {children}
            </ScrollView>
          ) : (
            children
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheetWrapper: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
  },
  sheetContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 24,
  },
  dragHandleWrapper: {
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
  },
});
