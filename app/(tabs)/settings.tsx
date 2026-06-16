import { useAuth } from "@clerk/expo";
import { useRouter, type Href } from "expo-router";
import { styled } from "nativewind";
import { usePostHog } from "posthog-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const Settings = () => {
  const { signOut } = useAuth();
  const router = useRouter();
  const posthog = usePostHog();

  const handleLogout = async () => {
    posthog.capture("user_signed_out");
    posthog.reset();
    await signOut();
    // router.replace("/(auth)/sign-in" as Href);
    router.replace("/" as Href);
  };

  return (
    <SafeAreaView className="flex-1 p-5 bg-background" edges={["top"]}>
      <View className="flex-1">
        <Text className="mb-6 text-xl font-bold">Settings</Text>

        <Pressable
          className="items-center p-4 rounded-lg bg-destructive"
          onPress={handleLogout}
        >
          <Text className="text-base font-semibold text-white">Logout</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default Settings;

const styles = StyleSheet.create({});
