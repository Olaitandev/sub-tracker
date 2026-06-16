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

interface CustomModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  scrollable?: boolean;
}

export default function CustomModal({
  visible,
  onClose,
  children,
  scrollable = false,
}: CustomModalProps) {
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);
  const [modalVisible, setModalVisible] = useState(false);

  const dragY = useRef(0);
  const isClosing = useRef(false);

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

  // Single entry point for closing — always animates first, then notifies parent
  const handleClose = useCallback(() => {
    if (isClosing.current) return;
    isClosing.current = true;
    animateClose(() => {
      setModalVisible(false);
      isClosing.current = false;
      onClose();
    });
  }, [animateClose, onClose]);

  useEffect(() => {
    if (visible) {
      isClosing.current = false;
      setModalVisible(true);
      requestAnimationFrame(animateOpen);
    } else if (modalVisible && !isClosing.current) {
      // visible became false from outside (e.g. parent-driven close)
      handleClose();
    }
  }, [visible]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: () => {
        dragY.current = 0;
      },

      onPanResponderMove: (_, gestureState) => {
        const dy = gestureState.dy;
        if (dy > 0) {
          dragY.current = dy;
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
          handleClose();
        } else {
          translateY.value = withSpring(0, SPRING_CONFIG);
          backdropOpacity.value = withTiming(1, { duration: 150 });
        }
        dragY.current = 0;
      },

      onPanResponderTerminate: () => {
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
      onRequestClose={handleClose}
    >
      <Animated.View
        style={[styles.backdrop, backdropStyle]}
        pointerEvents="auto"
      >
        <Pressable
          style={StyleSheet.absoluteFillObject}
          onPress={handleClose}
        />
      </Animated.View>

      <View style={styles.sheetWrapper} pointerEvents="box-none">
        <Animated.View style={[styles.sheetContainer, sheetStyle]}>
          <View {...panResponder.panHandlers} style={styles.dragHandleWrapper}>
            <View style={styles.dragHandle} />
          </View>

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
    backgroundColor: "rgba(0,0,0,0.6)",
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
