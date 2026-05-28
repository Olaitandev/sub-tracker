import { Link, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

const SubsriptionDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <View>
      <Text>subcription details: {id}</Text>
      <Link href="/">Go back</Link>
    </View>
  );
};

export default SubsriptionDetails;

const styles = StyleSheet.create({});
