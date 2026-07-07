import { styled } from "nativewind";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { ms } from "react-native-size-matters";
const SafeAreaView = styled(RNSafeAreaView);
const CreateBill = () => {
  return (
    <SafeAreaView
      className="flex-1 bg-background"
      style={{ paddingTop: ms(15) }}
      edges={["top"]}
    >
      <StatusBar translucent />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View>
            <Text>hello create bill</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CreateBill;

const styles = StyleSheet.create({});
