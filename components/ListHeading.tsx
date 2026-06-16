import { colors } from "@/constants/theme";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ms, vs } from "react-native-size-matters";

const ListHeading = ({
  title,
  subtitle,
  disabled,
}: {
  title: string;
  subtitle: string;
  disabled?: boolean;
}) => {
  return (
    <View className="" style={styles.listHeadingContainer}>
      <Text className="" style={styles.listHeadingTitle}>
        {title}
      </Text>
      <TouchableOpacity className="" disabled={disabled}>
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
    fontSize: ms(19),
  },
  listHeadingSubtitle: {
    fontFamily: "sans-bold",
    fontSize: ms(13),
    color: colors.accent,
  },
});
