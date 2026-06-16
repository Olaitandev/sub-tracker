import CustomModal from "@/components/ui/CustomModal";
import { colors, globalStyles } from "@/constants/theme";
import { formatSubscriptionDateTime } from "@/lib/utils";
import {
  BellRing,
  CalendarPlus,
  CalendarSync,
  Info,
  NotepadText,
  Repeat,
  Tag,
  X,
} from "lucide-react-native";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Divider } from "react-native-paper";
import { ms, s, vs } from "react-native-size-matters";
import CustomButton from "../ui/CustomButton";

interface UpcomingSubscriptionModalProps {
  visible: boolean;
  selectedSubscription: Subscription | null;
  onCloseUpcomingSubscriptionModal: () => void;
  markAsPaid: () => void;
}

const UpcomingSubscriptionModal = ({
  visible,
  selectedSubscription,
  onCloseUpcomingSubscriptionModal,
  markAsPaid,
}: UpcomingSubscriptionModalProps) => {
  return (
    <CustomModal visible={visible} onClose={onCloseUpcomingSubscriptionModal}>
      <ScrollView style={globalStyles.modalContent}>
        {selectedSubscription && (
          <View style={{}}>
            <View className="">
              <TouchableOpacity
                style={{
                  padding: ms(5),
                  // borderWidth: 1,
                  alignSelf: "flex-end",
                  borderRadius: ms(10),
                  // backgroundColor: "#DC2626",
                }}
                onPress={() => {
                  onCloseUpcomingSubscriptionModal();
                }}
              >
                <X size={ms(20)} color={colors.foreground} />
              </TouchableOpacity>
            </View>
            <View
              // className="border"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: ms(5),
              }}
            >
              <Image
                source={selectedSubscription.icon}
                style={{ height: vs(50), width: s(50) }}
                resizeMode="contain"
              />
              <Text style={{ fontFamily: "sans-bold", fontSize: ms(13) }}>
                {selectedSubscription.name}
              </Text>
              <Text style={{ fontFamily: "sans-bold", fontSize: ms(25) }}>
                ${selectedSubscription.price}
              </Text>
            </View>
            {/* <View className="flex items-center justify-center ">
                <Text
                  className="border "
                  style={{
                    paddingHorizontal: ms(10),
                    paddingVertical: ms(3),
                    borderRadius: ms(10),
                    fontFamily: "sans-medium",
                  }}
                >
                  Due in 3 days
                </Text>
              </View> */}
            <View
              style={{
                borderRadius: ms(20),
                paddingHorizontal: ms(15),
                paddingVertical: ms(20),
                gap: ms(12),
                marginTop: ms(40),
                marginBottom: ms(40),
              }}
              className="flex flex-col shadow-xl outline outline-accent outline-[0.2]"
            >
              <View className="flex flex-row items-center justify-between ">
                <View
                  className="flex flex-row items-center"
                  style={{ gap: ms(5) }}
                >
                  <View
                    className=" bg-foreground"
                    style={{ padding: ms(5), borderRadius: ms(9) }}
                  >
                    <Info size={ms(15)} color="#fff" />
                  </View>
                  <Text style={{ fontFamily: "sans-medium", fontSize: ms(11) }}>
                    Status
                  </Text>
                </View>
                <Text
                  style={{
                    fontFamily: "sans-bold",
                    fontSize: ms(11),
                    paddingHorizontal: ms(7),
                    paddingVertical: ms(4),
                    borderRadius: ms(20),
                    color: colors.background,
                  }}
                  className="bg-destructive "
                >
                  Due in 3 days
                </Text>
              </View>
              <Divider />
              <View className="flex flex-row items-center justify-between ">
                <View
                  className="flex flex-row items-center"
                  style={{ gap: ms(5) }}
                >
                  <View
                    className=" bg-foreground"
                    style={{ padding: ms(5), borderRadius: ms(9) }}
                  >
                    <CalendarPlus size={ms(15)} color="#fff" />
                  </View>
                  <Text style={{ fontFamily: "sans-medium", fontSize: ms(11) }}>
                    Started
                  </Text>
                </View>
                <Text
                  style={{ fontFamily: "sans-bold", fontSize: ms(11) }}
                  className=""
                >
                  {formatSubscriptionDateTime(selectedSubscription.startDate)}
                </Text>
              </View>
              <Divider />
              <View className="flex flex-row items-center justify-between ">
                <View
                  className="flex flex-row items-center"
                  style={{ gap: ms(5) }}
                >
                  <View
                    className=" bg-foreground"
                    style={{ padding: ms(5), borderRadius: ms(9) }}
                  >
                    <CalendarSync size={ms(15)} color="#fff" />
                  </View>
                  <Text style={{ fontFamily: "sans-medium", fontSize: ms(11) }}>
                    Next Billing
                  </Text>
                </View>
                <Text
                  style={{ fontFamily: "sans-bold", fontSize: ms(11) }}
                  className=""
                >
                  {formatSubscriptionDateTime(selectedSubscription.renewalDate)}
                </Text>
              </View>
              <Divider />
              <View className="flex flex-row items-center justify-between ">
                <View
                  className="flex flex-row items-center"
                  style={{ gap: ms(5) }}
                >
                  <View
                    className=" bg-foreground"
                    style={{ padding: ms(5), borderRadius: ms(9) }}
                  >
                    <Tag size={ms(15)} color="#fff" />
                  </View>
                  <Text style={{ fontFamily: "sans-medium", fontSize: ms(11) }}>
                    Category
                  </Text>
                </View>
                <Text
                  style={{ fontFamily: "sans-bold", fontSize: ms(11) }}
                  className=""
                >
                  {selectedSubscription.category}
                </Text>
              </View>
              <Divider />
              <View className="flex flex-row items-center justify-between ">
                <View
                  className="flex flex-row items-center"
                  style={{ gap: ms(5) }}
                >
                  <View
                    className=" bg-foreground"
                    style={{ padding: ms(5), borderRadius: ms(9) }}
                  >
                    <Repeat size={ms(15)} color="#fff" />
                  </View>
                  <Text style={{ fontFamily: "sans-medium", fontSize: ms(11) }}>
                    Repeat
                  </Text>
                </View>
                <Text
                  style={{ fontFamily: "sans-bold", fontSize: ms(11) }}
                  className=""
                >
                  {selectedSubscription.billing}
                </Text>
              </View>
              <Divider />
              <View className="flex flex-row items-center justify-between ">
                <View
                  className="flex flex-row items-center"
                  style={{ gap: ms(5) }}
                >
                  <View
                    className=" bg-foreground"
                    style={{ padding: ms(5), borderRadius: ms(9) }}
                  >
                    <BellRing size={ms(15)} color="#fff" />
                  </View>
                  <Text style={{ fontFamily: "sans-medium", fontSize: ms(11) }}>
                    Reminder
                  </Text>
                </View>
                <Text
                  style={{ fontFamily: "sans-bold", fontSize: ms(11) }}
                  className=""
                >
                  3 days before
                </Text>
              </View>
              <Divider />
              <View className="flex flex-row items-center justify-between">
                <View
                  className="flex flex-row items-center"
                  style={{ gap: ms(5) }}
                >
                  <View
                    className=" bg-foreground"
                    style={{ padding: ms(5), borderRadius: ms(9) }}
                  >
                    <NotepadText size={ms(15)} color="#fff" />
                  </View>
                  <Text style={{ fontFamily: "sans-medium", fontSize: ms(11) }}>
                    Notes
                  </Text>
                </View>
                <Text
                  style={{ fontFamily: "sans-bold", fontSize: ms(11) }}
                  className=""
                ></Text>
              </View>
            </View>
            <CustomButton
              onPress={() => {
                markAsPaid();
              }}
              text="Mark as Paid"
            />
          </View>
        )}
      </ScrollView>
    </CustomModal>
  );
};

export default UpcomingSubscriptionModal;

const styles = StyleSheet.create({});
