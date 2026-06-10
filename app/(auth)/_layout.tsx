import "@/global.css";
import { useAuth } from "@clerk/expo";
import { Stack, useRouter } from "expo-router";

export default function RootLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  // if (!isLoaded) {
  //   return null;
  // }

  // if (isSignedIn) {
  //   return <Redirect href="/(tabs)" />;
  // }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade_from_bottom",
        animationDuration: 200,
      }}
    />
  );
}
