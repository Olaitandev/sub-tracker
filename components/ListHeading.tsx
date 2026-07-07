import { colors } from "@/constants/theme";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ms, vs } from "react-native-size-matters";

const ListHeading = ({
  title,
  subtitle,
  disabled,
  onPress,
}: {
  title: string;
  subtitle: string;
  disabled?: boolean;
  onPress: () => void;
}) => {
  return (
    <View className="" style={styles.listHeadingContainer}>
      <Text className="" style={styles.listHeadingTitle}>
        {title}
      </Text>
      <TouchableOpacity className="" disabled={disabled} onPress={onPress}>
        <Text
          style={styles.listHeadingSubtitle}
          className={disabled ? "text-black!" : ""}
        >
          {subtitle}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ListHeading;

const styles = StyleSheet.create({
  listHeadingContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: vs(15),
    alignItems: "center",
  },
  listHeadingTitle: {
    fontFamily: "sans-bold",
    fontSize: ms(16),
  },
  listHeadingSubtitle: {
    fontFamily: "sans-bold",
    fontSize: ms(12),
    color: colors.accent,
  },
});
