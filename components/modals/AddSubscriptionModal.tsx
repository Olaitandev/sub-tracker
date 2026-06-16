import CustomModal from "@/components/ui/CustomModal";
import { colors, globalStyles } from "@/constants/theme";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { ReceiptText, RefreshCcwDot, X } from "lucide-react-native";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Divider } from "react-native-paper";
import { ms, s, vs } from "react-native-size-matters";
import CustomButton from "../ui/CustomButton";

type Type = "subscription" | "bill";

interface Props {
  visible: boolean;
  onClose: () => void;
  selected: string;
  setSelected: (type: Type) => void;
  onProceed: () => void;
}

const subscriptionTypes = [
  {
    id: "subscription",
    title: "Subscriptions",
    description: "Track a new recurring expense eg Netflix, spotify etc",
    color: "#2BD2C5",
    icon: <RefreshCcwDot size={ms(20)} color={colors.success} />,
  },
  {
    id: "bill",
    title: "Bill",
    description: " Add a new bill payment e.g Rent, Loans etc",
    color: "#F44336",
    icon: <ReceiptText size={ms(20)} color={colors.destructive} />,
  },
];
const AddSubscriptionModal: React.FC<Props> = ({
  visible,
  onClose,
  selected,
  setSelected,
  onProceed,
}) => {
  return (
    <CustomModal visible={visible} onClose={onClose}>
      <ScrollView style={globalStyles.modalContent}>
        <View>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={{ fontFamily: "sans-bold", fontSize: ms(15) }}>
              Choose type
            </Text>
            <TouchableOpacity
              style={{
                borderRadius: ms(10),
              }}
              onPress={() => {
                onClose();
              }}
            >
              <X size={ms(20)} color={colors.foreground} />
            </TouchableOpacity>
          </View>
          <Divider style={{ marginTop: ms(15) }} />
        </View>
        <View style={{ marginVertical: ms(30), gap: ms(10) }}>
          {subscriptionTypes.map((subscription) => {
            const isSelected = subscription.id === selected;
            return (
              <Pressable
                key={subscription.id}
                style={[
                  styles.card,
                  {
                    borderColor: isSelected ? colors.accent : "#eee",
                    borderWidth: isSelected ? ms(1.5) : ms(1),
                    backgroundColor: isSelected ? "#F9FFFE" : "#fff",
                  },
                ]}
                onPress={() => setSelected(subscription.id as Type)}
              >
                <View style={{ gap: ms(15) }}>
                  {/* icon */}
                  <Text>{subscription.icon}</Text>
                  {/* name */}
                  <View style={{ gap: ms(5) }}>
                    <Text style={styles.title}>{subscription.title}</Text>
                    {/* description */}
                    <Text style={styles.description}>
                      {subscription.description}
                    </Text>
                  </View>
                </View>
                <View>
                  {isSelected ? (
                    <Ionicons
                      name="checkmark-circle"
                      size={ms(20)}
                      color={colors.accent}
                    />
                  ) : (
                    <FontAwesome
                      name="circle-thin"
                      size={ms(20)}
                      color={colors.gray}
                    />
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
        <CustomButton
          text="Proceed"
          onPress={() => {
            onProceed();
          }}
          disabled={selected === ""}
        />
      </ScrollView>
    </CustomModal>
  );
};

export default AddSubscriptionModal;

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: s(10),
    paddingVertical: vs(15),
    borderRadius: ms(15),
  },

  title: {
    fontFamily: "sans-medium",
    fontSize: ms(13),
  },
  description: {
    fontFamily: "sans-regular",
    fontSize: ms(10),
    color: colors.gray,
  },
});
