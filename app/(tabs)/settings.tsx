import { useAuth } from "@clerk/expo";
import { useRouter, type Href } from "expo-router";
import { styled } from "nativewind";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const settings = () => {
  const { signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.replace("/(auth)/sign-in" as Href);
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <View className="flex-1">
        <Text className="text-xl font-bold mb-6">Settings</Text>

        <Pressable
          className="bg-red-500 rounded-lg p-4 items-center"
          onPress={handleLogout}
        >
          <Text className="text-white font-semibold text-base">Logout</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default settings;

const styles = StyleSheet.create({});
