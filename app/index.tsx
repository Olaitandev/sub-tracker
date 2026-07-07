import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";
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
  const onboardingStatus = useOnboardingStatus();

  const [timerDone, setTimerDone] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setTimerDone(true), 1500);
    return () => clearTimeout(t);
  }, []);

  if (!isLoaded || !timerDone || onboardingStatus === "loading") {
    return (
      <SafeAreaView className="items-center justify-center flex-1 bg-accent">
        <View className="flex flex-col">
          <Image
            source={require("@/assets/images/splash-pattern.png")}
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

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  if (onboardingStatus === "incomplete") {
    return (
      <Redirect
        href={{
          pathname: "/(auth)/user-info",
          params: { entry: "complete_onboarding" },
        }}
      />
    );
  }

  return <Redirect href="/(tabs)" />;
}
