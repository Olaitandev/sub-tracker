import { useAuth } from "@clerk/expo";
import { Redirect } from "expo-router";
import { styled } from "nativewind";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { s, vs } from "react-native-size-matters";

const SafeAreaView = styled(RNSafeAreaView);

export default function Index() {
  const { isLoaded, isSignedIn } = useAuth();
  const [ready, setReady] = useState(false);

  const [timerDone, setTimerDone] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setTimerDone(true), 1500);
    return () => clearTimeout(t);
  }, []);

  // Show splash while Clerk is loading OR timer hasn't finished
  if (!isLoaded || !timerDone) {
    return (
      <SafeAreaView className="items-center justify-center flex-1 bg-accent">
        <View className="flex flex-col ">
          <Image
            source={require("@/assets/images/splash-pattern.png")}
            className=""
            resizeMode="contain"
            style={{ width: s(460), height: vs(400) }}
          />
          <View className="mt-20">
            <ActivityIndicator size="large" color="#fff" />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(onboarding)" />;
}
