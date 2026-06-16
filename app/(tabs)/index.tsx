import ListHeading from "@/components/ListHeading";
import AddSubscriptionModal from "@/components/modals/AddSubscriptionModal";
import UpcomingSubscriptionModal from "@/components/modals/UpcomingSubscriptionModal";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import { HOME_BALANCE, HOME_SUBSCRIPTIONS, HOME_USER } from "@/constants/data";
import { colors } from "@/constants/theme";
import "@/global.css";
import { useTabBarHeight } from "@/hooks/useTabBarHeight";
import { formatCurrency } from "@/lib/utils";
import { StatusBar } from "expo-status-bar";
import { BellDot, Info, TrendingDown } from "lucide-react-native";
import { styled } from "nativewind";
import { usePostHog } from "posthog-react-native";
import { useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { FAB } from "react-native-paper";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { ms, s, vs } from "react-native-size-matters";

const SafeAreaView = styled(RNSafeAreaView);
export default function App() {
  const [refreshing, setRefreshing] = useState(false);
  const posthog = usePostHog();
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);

  // for add subscription modal
  const [selected, setSelected] = useState("");
  const [addSubscriptionModal, setAddSubscriptionModal] = useState(false);

  const subscriptionSelected = () => {
    // Check if store exists before routing
    // if (!storeExists) {
    //   showError("Store Not Found", "Set up your store before adding products.");
    //   closeProductModal();
    //   return;
    // }

    // console.log(selected);
    switch (selected) {
      case "subscription":
        // router.push("/(dashboard)/screens/AddDigitalProduct");
        console.log("subscription selected");
        break;

      case "bill":
        // router.push("/(dashboard)/screens/AddPhysicalProduct");
        console.log("bill selected");
        break;

      default:
        console.warn("Unknown product type selected");
    }

    setAddSubscriptionModal(false);
  };

  // for view upcoming payments modal
  const [subscriptionDetailsModal, setSubscriptionDetailsModal] =
    useState(false);
  const [selectedSubscription, setSelectedSubscription] =
    useState<Subscription | null>(null);

  const [subscriptions, setSubscriptions] =
    useState<Subscription[]>(HOME_SUBSCRIPTIONS);

  const onCloseUpcomingSubscriptionModal = () => {
    setSelectedSubscription(null);
    setSubscriptionDetailsModal(false);
  };

  const markAsPaid = () => {
    console.log("mark paid");
  };

  const tabBarHeight = useTabBarHeight();

  const handleCreateSubscription = (newSubscription: Subscription) => {
    setSubscriptions((prev) => [newSubscription, ...prev]);
    posthog.capture("subscription_created", {
      subscription_id: newSubscription.id,
      subscription_name: newSubscription.name,
      subscription_category: newSubscription.category ?? null,
      billing_cycle: newSubscription.billing ?? null,
    });
  };

  return (
    <>
      <SafeAreaView
        className="flex-1 bg-background"
        style={{ paddingTop: ms(15) }}
        edges={["top"]}
      >
        <StatusBar translucent />
        <View>
          <FlatList
            ListHeaderComponent={() => (
              <View style={{ marginHorizontal: ms(15) }}>
                <View className="">
                  <View style={styles.header}>
                    <View
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        gap: ms(8),
                      }}
                    >
                      <View className="" style={styles.profileImageContainer}>
                        <Image
                          source={require("@/assets/images/avatar.jpg")}
                          className=""
                          style={styles.profileImage}
                        />
                      </View>
                      <View>
                        <Text className="" style={styles.profileName}>
                          Good Morning, {HOME_USER.name} 👋
                        </Text>
                        <Text className="" style={styles.profileNameSubtitle}>
                          Here's your subscription overview
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity style={styles.notificationContainer}>
                      <BellDot color="#62748E" size={ms(20)} />
                    </TouchableOpacity>
                  </View>
                  {/* <Pressable
                    onPress={() => setIsModalVisible(true)}
                    className="active:opacity-60"
                  >
                    <Image source={icons.add} className="home-add-icon" />
                  </Pressable> */}
                </View>

                <View
                  className="bg-linear-to-br from-[#00C889]  via-accent to-[#00A16C]"
                  style={styles.bannerContainer}
                >
                  <View className="flex flex-row items-center justify-between">
                    <Text
                      className="text-[#CDECDD]"
                      style={{ fontFamily: "sans-bold", fontSize: ms(13) }}
                    >
                      MONTHLY RECURRING
                    </Text>
                    <TouchableOpacity className="">
                      <Info size={ms(18)} color="#CDECDD" className="" />
                    </TouchableOpacity>
                  </View>
                  <View
                    className="flex flex-row items-baseline"
                    style={{ gap: ms(8) }}
                  >
                    <Text
                      className="text-white "
                      style={{ fontFamily: "sans-bold", fontSize: ms(27) }}
                    >
                      {formatCurrency(HOME_BALANCE.amount)}
                    </Text>
                    <Text
                      className="text-[#CDECDD] "
                      style={{ fontFamily: "sans-regular", fontSize: ms(13) }}
                    >
                      / month
                    </Text>
                  </View>
                  <View
                    className="flex flex-row items-center"
                    style={{ gap: s(8) }}
                  >
                    <View
                      className="flex flex-row items-center bg-[#55BD8E]"
                      style={{
                        gap: ms(7),
                        paddingHorizontal: s(6),
                        paddingVertical: vs(2),
                        borderRadius: ms(90),
                      }}
                    >
                      <TrendingDown color="white" size={ms(15)} />
                      <Text
                        className="text-white font-sans-bold"
                        style={{ fontSize: ms(10) }}
                      >
                        4.2%
                      </Text>
                    </View>
                    <View>
                      <Text
                        className="text-[#CDECDD] "
                        style={{ fontFamily: "sans-regular", fontSize: ms(10) }}
                      >
                        from last month
                      </Text>
                    </View>
                  </View>
                </View>
                <View
                  style={{
                    justifyContent: "center",
                    display: "flex",
                    alignItems: "center",
                    marginTop: vs(9),
                  }}
                >
                  <TouchableOpacity>
                    <Text style={{ color: colors.gray }}>
                      12 active subscription
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* <View className="mt-5">
                  <View className="home-upcoming-section">
                    <ListHeading title="Upcoming" />

                    <FlatList
                      data={UPCOMING_SUBSCRIPTIONS}
                      renderItem={({ item }) => (
                        <UpcomingSubscriptionCard data={item} />
                      )}
                      keyExtractor={(item) => item.id}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      ListEmptyComponent={<Text>No upcoming renewals yet</Text>}
                    />
                  </View>
                </View> */}
                <ListHeading title="Upcoming Payments" subtitle="See all" />
              </View>
            )}
            data={subscriptions.slice(0, 9)}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <UpcomingSubscriptionCard
                {...item}
                expanded={expandedSubscriptionId === item.id}
                onPress={() => {
                  setSelectedSubscription(item);
                  setSubscriptionDetailsModal(true);
                  // const isExpanding = expandedSubscriptionId !== item.id;
                  // setExpandedSubscriptionId((prev) =>
                  //   prev === item.id ? null : item.id,
                  // );
                  // if (isExpanding) {
                  //   posthog.capture("subscription_expanded", {
                  //     subscription_id: item.id,
                  //     subscription_name: item.name,
                  //     subscription_category: item.category ?? null,
                  //     billing_cycle: item.billing ?? null,
                  //   });
                  // }
                }}
              />
            )}
            extraData={expandedSubscriptionId}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View className="h-4" />}
            ListEmptyComponent={<Text>No active subscriptions yet</Text>}
            contentContainerClassName="pb-20"
            contentContainerStyle={{ paddingBottom: tabBarHeight }}
            refreshing={refreshing}
            onRefresh={() => {
              console.log("refreshing");
            }}
          />
        </View>
      </SafeAreaView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setAddSubscriptionModal(true)}
        visible={true}
        color="white"
      />

      <AddSubscriptionModal
        visible={addSubscriptionModal}
        onClose={() => {
          setAddSubscriptionModal(false);
          setSelected("");
        }}
        selected={selected}
        setSelected={setSelected}
        onProceed={subscriptionSelected}
      />

      <UpcomingSubscriptionModal
        visible={subscriptionDetailsModal}
        selectedSubscription={selectedSubscription}
        onCloseUpcomingSubscriptionModal={onCloseUpcomingSubscriptionModal}
        markAsPaid={markAsPaid}
      />
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    // gap: ms(15),
  },
  profileImageContainer: {
    height: ms(40),
    width: ms(40),
    borderRadius: ms(10),
    borderColor: "#B8D7FF",
    borderWidth: ms(1.8),
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    padding: 24,
  },
  profileImage: {
    width: ms(39),
    height: ms(39),
    borderRadius: ms(8),
  },
  profileName: {
    fontFamily: "sans-bold",
    fontSize: ms(14),
  },
  profileNameSubtitle: {
    fontFamily: "sans-medium",
    color: colors.gray,
    fontSize: ms(11),
  },
  notificationContainer: {
    height: ms(40),
    width: ms(40),
    borderRadius: ms(999),
    borderWidth: ms(1),
    borderColor: "#E2E8F1",
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
    backgroundColor: "#F1F5F9",
  },
  bannerContainer: {
    height: vs(130),
    padding: ms(23),
    borderRadius: ms(20),
    marginTop: vs(20),
    justifyContent: "space-between",
  },
  fab: {
    position: "absolute",
    margin: ms(20),
    right: 0,
    bottom: ms(100),
    borderRadius: ms(999),
    backgroundColor: colors.accent,
    padding: ms(2),
    color: "#ffffff",
  },
});
