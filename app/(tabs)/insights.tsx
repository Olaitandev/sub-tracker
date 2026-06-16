import { styled } from "nativewind";
import { StyleSheet, Text } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const insights = () => {
  return (
    <SafeAreaView className="flex-1 p-5 bg-background" edges={["top"]}>
      <Text>insights</Text>
    </SafeAreaView>
  );
};

export default insights;

const styles = StyleSheet.create({});
