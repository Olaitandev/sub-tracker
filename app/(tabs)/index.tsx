import "@/global.css";
import { Link } from "expo-router";

import { styled } from "nativewind";
import { Text } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);
export default function App() {
  return (
    <SafeAreaView className="flex-1 p-5 bg-background">
      <Text className="text-5xl font-sans-extrabold ">Home</Text>

      <Link
        href="/onboarding"
        className="p-4 mt-4 text-white rounded bg-primary font-sans-bold"
      >
        take me to onboarding
      </Link>
      <Link
        href="/(auth)/sign-in"
        className="p-4 mt-4 text-white rounded bg-primary font-sans-bold"
      >
        sign in
      </Link>
      <Link
        href="/(auth)/sign-up"
        className="p-4 mt-4 text-white rounded bg-primary font-sans-bold"
      >
        sign up
      </Link>
    </SafeAreaView>
  );
}
