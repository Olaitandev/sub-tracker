import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

const SignUp = () => {
  return (
    <View>
      <Text>sign-up</Text>
      <Link href="/(auth)/sign-up">Create Account</Link>
    </View>
  );
};

export default SignUp;

const styles = StyleSheet.create({});
