import { colors } from "@/constants/theme";
import { formatCurrency, formatSubscriptionDateTime } from "@/lib/utils";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ms, s, vs } from "react-native-size-matters";

const UpcomingSubscriptionCard = ({
  name,
  price,
  currency,
  icon,
  billing,
  color,
  category,
  renewalDate,
  plan,
  expanded,
  onPress,
  paymentMethod,
  startDate,
  status,
}: UpcomingSubscriptionCardProps) => {
  const fallback = "Not provided";

  return (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={onPress}
      className="shadow"
    >
      <View className="flex flex-row justify-between">
        <View className="flex flex-row " style={{ gap: ms(13) }}>
          <Image
            source={icon}
            className=""
            style={styles.image}
            resizeMode="contain"
          />
          <View
            className=""
            style={{
              display: "flex",
              flexDirection: "column",
              // justifyContent: "space-between",
              // paddingVertical: vs(8),
              gap: ms(8),
            }}
          >
            <Text className="" numberOfLines={1} style={styles.title}>
              {name}
            </Text>
            <Text
              numberOfLines={1}
              ellipsizeMode=""
              style={{ color: colors.gray, fontSize: ms(9) }}
            >
              {category?.trim() ||
                plan?.trim() ||
                (renewalDate ? formatSubscriptionDateTime(renewalDate) : "") ||
                fallback}
            </Text>
            <Text
              numberOfLines={1}
              style={{
                fontFamily: "sans-medium",
                fontSize: ms(10),
                paddingHorizontal: ms(10),
                paddingVertical: ms(4),
                borderRadius: ms(20),
                color: colors.background,
                backgroundColor: colors.destructive,
                alignSelf: "flex-start",
              }}
            >
              Due in 3 days
            </Text>
          </View>
        </View>
        <View
          className=""
          style={{
            display: "flex",
            flexDirection: "column",
            // justifyContent: "space-between",
            gap: ms(8),
            paddingVertical: vs(8),
          }}
        >
          <Text className="" numberOfLines={1} style={styles.currency}>
            {formatCurrency(price, currency)}
          </Text>
          <Text
            className=""
            numberOfLines={1}
            style={{
              fontFamily: "sans-regular",
              fontSize: ms(9),
              color: colors.gray,
            }}
          >
            {billing}
          </Text>
        </View>
      </View>
      {/* <View
        className="flex flex-row items-center justify-center"
        style={{ gap: ms(5) }}
      >
        <View
          className=""
          style={{
            width: ms(7),
            height: ms(7),
            backgroundColor: "red",
            borderRadius: ms(999),
          }}
        />
        <Text
          numberOfLines={1}
          style={{ color: "red", fontFamily: "sans-regular" }}
        >
          Due in 10 days
        </Text>
      </View> */}
    </TouchableOpacity>
  );
};

export default UpcomingSubscriptionCard;
const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#fff",
    borderRadius: ms(20),
    paddingVertical: vs(15),
    paddingHorizontal: s(10),
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.1,
    // shadowRadius: 12,
    elevation: 4,
    marginHorizontal: ms(15),
  },
  image: {
    height: vs(50),
    width: s(50),
  },
  title: {
    fontFamily: "sans-bold",
    fontSize: ms(13),
  },
  currency: {
    fontFamily: "sans-bold",
    fontSize: ms(12),
  },
});
