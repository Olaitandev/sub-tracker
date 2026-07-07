// import ListHeading from "@/components/ListHeading";
// import AddSubscriptionModal from "@/components/modals/AddSubscriptionModal";
// import UpcomingSubscriptionModal from "@/components/modals/UpcomingSubscriptionModal";
// import SubscriptionCard from "@/components/SubscriptionCard";
// import SubscriptionCardSkeleton from "@/components/SubscriptionCardSkeleton";
// import { HOME_BALANCE, HOME_USER } from "@/constants/data";
// import { colors, globalStyles } from "@/constants/theme";
// import "@/global.css";
// import { useTabBarHeight } from "@/hooks/useTabBarHeight";
// import { getUpcomingSubscriptions } from "@/lib/subscriptions";
// import { formatCurrency } from "@/lib/utils";
// import { useAuth } from "@clerk/expo";
// import { useRouter } from "expo-router";
// import { StatusBar } from "expo-status-bar";
// import { BellDot, Info, TrendingDown } from "lucide-react-native";
// import { styled } from "nativewind";
// import { usePostHog } from "posthog-react-native";
// import { useCallback, useEffect, useMemo, useState } from "react";
// import {
//   FlatList,
//   Image,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { FAB } from "react-native-paper";
// import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
// import { ms, s, vs } from "react-native-size-matters";

// const SafeAreaView = styled(RNSafeAreaView);
// export default function App() {
//   const { getToken } = useAuth();
//   const [refreshing, setRefreshing] = useState(false);
//   const posthog = usePostHog();
//   const router = useRouter();
//   const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
//     string | null
//   >(null);

//   // for add subscription modal
//   const [selected, setSelected] = useState("");
//   const [addSubscriptionModal, setAddSubscriptionModal] = useState(false);

//   const subscriptionSelected = () => {
//     switch (selected) {
//       case "subscription":
//         router.push("/sub-screens/CreateSubscription");
//         break;

//       case "bill":
//         router.push("/sub-screens/CreateBill");
//         break;

//       default:
//         console.warn("Unknown product type selected");
//     }

//     setAddSubscriptionModal(false);
//   };

//   // for view upcoming payments modal
//   const [subscriptionDetailsModal, setSubscriptionDetailsModal] =
//     useState(false);
//   const [selectedSubscription, setSelectedSubscription] =
//     useState<Subscription | null>(null);

//   const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isRefreshing, setIsRefreshing] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const SKELETON_PLACEHOLDER_ARRAY = [1, 2, 3];

//   const onCloseUpcomingSubscriptionModal = () => {
//     setSelectedSubscription(null);
//     setSubscriptionDetailsModal(false);
//   };

//   const markAsPaid = () => {
//     console.log("mark paid");
//   };

//   const tabBarHeight = useTabBarHeight();

//   // ── Fetch ─────────────────────────────────────────────────────────────────

//   const loadSubscriptions = useCallback(
//     async (mode: "load" | "refresh") => {
//       if (mode === "load") setIsLoading(true);
//       else setIsRefreshing(true);
//       setError(null);

//       try {
//         const token = await getToken();
//         if (!token) {
//           setError("Session expired. Please sign in again.");
//           return;
//         }

//         const response = await fetch(
//           `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/get-subscriptions`,
//           {
//             headers: {
//               "Content-Type": "application/json",
//               Authorization: `Bearer ${token}`,
//             },
//           },
//         );

//         const data = await response.json();

//         // console.log(data);

//         if (!response.ok) {
//           throw new Error(data.message ?? "Failed to fetch subscriptions");
//         }

//         setSubscriptions(data.subscriptions ?? []);
//       } catch (err) {
//         setError(err instanceof Error ? err.message : "Something went wrong");
//       } finally {
//         if (mode === "load") setIsLoading(false);
//         else setIsRefreshing(false);
//       }
//     },
//     [getToken],
//   );

//   useEffect(() => {
//     loadSubscriptions("load");
//   }, []);

//   const upcomingSubscriptions = useMemo(
//     () => getUpcomingSubscriptions(subscriptions).slice(0, 5),
//     [subscriptions],
//   );
//   return (
//     <>
//       <SafeAreaView
//         className="flex-1 bg-background"
//         style={[globalStyles.bodyPadding, { paddingTop: ms(15) }]}
//         edges={["top"]}
//       >
//         <StatusBar translucent />
//         <View>
//           <FlatList
//             ListHeaderComponent={() => (
//               <View>
//                 <View className="">
//                   <View style={styles.header}>
//                     <View
//                       style={{
//                         display: "flex",
//                         flexDirection: "row",
//                         alignItems: "center",
//                         gap: ms(8),
//                       }}
//                     >
//                       <View className="" style={styles.profileImageContainer}>
//                         <Image
//                           source={require("@/assets/images/avatar.jpg")}
//                           className=""
//                           style={styles.profileImage}
//                         />
//                       </View>
//                       <View>
//                         <Text className="" style={styles.profileName}>
//                           Good Morning, {HOME_USER.name} 👋
//                         </Text>
//                         <Text className="" style={styles.profileNameSubtitle}>
//                           Here&apos;s your subscription overview
//                         </Text>
//                       </View>
//                     </View>

//                     <TouchableOpacity style={styles.notificationContainer}>
//                       <BellDot color="#62748E" size={ms(20)} />
//                     </TouchableOpacity>
//                   </View>
//                   {/* <Pressable
//                     onPress={() => setIsModalVisible(true)}
//                     className="active:opacity-60"
//                   >
//                     <Image source={icons.add} className="home-add-icon" />
//                   </Pressable> */}
//                 </View>

//                 <View
//                   className="bg-linear-to-br from-[#00C889]  via-accent to-[#00A16C]"
//                   style={styles.bannerContainer}
//                 >
//                   <View className="flex flex-row items-center justify-between">
//                     <Text
//                       className="text-[#CDECDD]"
//                       style={{ fontFamily: "sans-bold", fontSize: ms(13) }}
//                     >
//                       MONTHLY RECURRING
//                     </Text>
//                     <TouchableOpacity className="">
//                       <Info size={ms(18)} color="#CDECDD" className="" />
//                     </TouchableOpacity>
//                   </View>
//                   <View
//                     className="flex flex-row items-baseline"
//                     style={{ gap: ms(8) }}
//                   >
//                     <Text
//                       className="text-white "
//                       style={{ fontFamily: "sans-bold", fontSize: ms(27) }}
//                     >
//                       {formatCurrency(HOME_BALANCE.amount)}
//                     </Text>
//                     <Text
//                       className="text-[#CDECDD] "
//                       style={{ fontFamily: "sans-regular", fontSize: ms(13) }}
//                     >
//                       / month
//                     </Text>
//                   </View>
//                   <View
//                     className="flex flex-row items-center"
//                     style={{ gap: s(8) }}
//                   >
//                     <View
//                       className="flex flex-row items-center bg-[#55BD8E]"
//                       style={{
//                         gap: ms(7),
//                         paddingHorizontal: s(6),
//                         paddingVertical: vs(2),
//                         borderRadius: ms(90),
//                       }}
//                     >
//                       <TrendingDown color="white" size={ms(15)} />
//                       <Text
//                         className="text-white font-sans-bold"
//                         style={{ fontSize: ms(10) }}
//                       >
//                         4.2%
//                       </Text>
//                     </View>
//                     <View>
//                       <Text
//                         className="text-[#CDECDD] "
//                         style={{ fontFamily: "sans-regular", fontSize: ms(10) }}
//                       >
//                         from last month
//                       </Text>
//                     </View>
//                   </View>
//                 </View>
//                 <View
//                   style={{
//                     justifyContent: "center",
//                     display: "flex",
//                     alignItems: "center",
//                     marginTop: vs(9),
//                   }}
//                 >
//                   {subscriptions.length > 0 && (
//                     <TouchableOpacity
//                       onPress={() => router.push("/(tabs)/subscriptions")}
//                     >
//                       <Text style={{ color: colors.gray }}>
//                         {subscriptions.length} active subscription
//                       </Text>
//                     </TouchableOpacity>
//                   )}
//                 </View>

//                 <ListHeading
//                   title="Upcoming Payments"
//                   subtitle="See all"
//                   onPress={() => router.push("/(tabs)/subscriptions")}
//                 />
//               </View>
//             )}
//             data={
//               isLoading ? SKELETON_PLACEHOLDER_ARRAY : upcomingSubscriptions
//             }
//             keyExtractor={(item, index) =>
//               isLoading ? `skeleton-${index}` : (item as Subscription).id
//             }
//             renderItem={({ item }) =>
//               isLoading || isRefreshing ? (
//                 <SubscriptionCardSkeleton />
//               ) : (
//                 <SubscriptionCard
//                   subscription={item as Subscription}
//                   onPress={() => {
//                     setSelectedSubscription(item as Subscription);
//                     setSubscriptionDetailsModal(true);
//                   }}
//                 />
//               )
//             }
//             extraData={expandedSubscriptionId}
//             showsVerticalScrollIndicator={false}
//             ItemSeparatorComponent={() => <View className="h-4" />}
//             ListEmptyComponent={
//               isLoading ? null : error ? (
//                 <View
//                   style={{
//                     marginTop: vs(40),
//                     alignItems: "center",
//                     paddingHorizontal: ms(20),
//                   }}
//                 >
//                   <Text
//                     style={{
//                       color: colors.gray,
//                       fontSize: ms(14),
//                       fontFamily: "sans-medium",
//                       textAlign: "center",
//                     }}
//                   >
//                     {error}
//                   </Text>
//                   <TouchableOpacity
//                     onPress={() => loadSubscriptions("load")}
//                     style={{ marginTop: vs(12) }}
//                   >
//                     <Text
//                       style={{
//                         color: colors.accent ?? "#00C889",
//                         fontSize: ms(13),
//                         fontFamily: "sans-bold",
//                       }}
//                     >
//                       Try again
//                     </Text>
//                   </TouchableOpacity>
//                 </View>
//               ) : (
//                 <View style={{ marginTop: vs(40), alignItems: "center" }}>
//                   <Text
//                     style={{
//                       color: colors.gray,
//                       fontSize: ms(14),
//                       fontFamily: "sans-medium",
//                     }}
//                   >
//                     No active subscriptions yet
//                   </Text>
//                   <Text
//                     style={{
//                       color: colors.gray,
//                       fontSize: ms(10),
//                       fontFamily: "sans-medium",
//                       marginTop: vs(4),
//                     }}
//                   >
//                     Tap the + button below to add your first subscription
//                   </Text>
//                 </View>
//               )
//             }
//             contentContainerClassName="pb-20"
//             contentContainerStyle={{ paddingBottom: tabBarHeight }}
//             refreshing={refreshing}
//             onRefresh={() => {
//               console.log("refreshing");
//               loadSubscriptions("refresh");
//             }}
//           />
//         </View>
//       </SafeAreaView>

//       <FAB
//         icon="plus"
//         style={globalStyles.fab}
//         onPress={() => setAddSubscriptionModal(true)}
//         visible={true}
//         color="white"
//       />

//       <AddSubscriptionModal
//         visible={addSubscriptionModal}
//         onClose={() => {
//           setAddSubscriptionModal(false);
//           setSelected("");
//         }}
//         selected={selected}
//         setSelected={setSelected}
//         onProceed={subscriptionSelected}
//       />

//       <UpcomingSubscriptionModal
//         visible={subscriptionDetailsModal}
//         selectedSubscription={selectedSubscription}
//         onCloseUpcomingSubscriptionModal={onCloseUpcomingSubscriptionModal}
//         markAsPaid={markAsPaid}
//       />
//     </>
//   );
// }

// const styles = StyleSheet.create({
//   header: {
//     display: "flex",
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     // gap: ms(15),
//   },
//   profileImageContainer: {
//     height: ms(40),
//     width: ms(40),
//     borderRadius: ms(10),
//     borderColor: "#B8D7FF",
//     borderWidth: ms(1.8),
//     display: "flex",
//     justifyContent: "center",
//     alignItems: "center",
//     overflow: "hidden",
//     padding: 24,
//   },
//   profileImage: {
//     width: ms(39),
//     height: ms(39),
//     borderRadius: ms(8),
//   },
//   profileName: {
//     fontFamily: "sans-bold",
//     fontSize: ms(14),
//   },
//   profileNameSubtitle: {
//     fontFamily: "sans-medium",
//     color: colors.gray,
//     fontSize: ms(11),
//   },
//   notificationContainer: {
//     height: ms(40),
//     width: ms(40),
//     borderRadius: ms(999),
//     borderWidth: ms(1),
//     borderColor: "#E2E8F1",
//     justifyContent: "center",
//     alignItems: "center",
//     display: "flex",
//     backgroundColor: "#F1F5F9",
//   },
//   bannerContainer: {
//     height: vs(130),
//     padding: ms(23),
//     borderRadius: ms(20),
//     marginTop: vs(20),
//     justifyContent: "space-between",
//   },
// });

import ListHeading from "@/components/ListHeading";
import AddSubscriptionModal from "@/components/modals/AddSubscriptionModal";
import UpcomingSubscriptionModal from "@/components/modals/UpcomingSubscriptionModal";
import SubscriptionCard from "@/components/SubscriptionCard";
import SubscriptionCardSkeleton from "@/components/SubscriptionCardSkeleton";
import { useToast } from "@/components/ui/NotificationService";
import { HOME_BALANCE, HOME_USER } from "@/constants/data";
import { colors, globalStyles } from "@/constants/theme";
import "@/global.css";
import { useMarkAsPaid } from "@/hooks/useMarkAsPaid";
import { useTabBarHeight } from "@/hooks/useTabBarHeight";
import { getUpcomingSubscriptions } from "@/lib/subscriptions";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@clerk/expo";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { BellDot, Info, TrendingDown } from "lucide-react-native";
import { styled } from "nativewind";
import { usePostHog } from "posthog-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  const { getToken } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const posthog = usePostHog();
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);

  // Stable ref for getToken — avoids markAsPaid re-creating on every render
  const getTokenRef = useRef(getToken);
  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  // for add subscription modal
  const [selected, setSelected] = useState("");
  const [addSubscriptionModal, setAddSubscriptionModal] = useState(false);

  const subscriptionSelected = () => {
    switch (selected) {
      case "subscription":
        router.push("/sub-screens/CreateSubscription");
        break;
      case "bill":
        router.push("/sub-screens/CreateBill");
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

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const SKELETON_PLACEHOLDER_ARRAY = [1, 2, 3];

  const onCloseUpcomingSubscriptionModal = () => {
    setSelectedSubscription(null);
    setSubscriptionDetailsModal(false);
  };

  const tabBarHeight = useTabBarHeight();
  // ── Mark as Paid ──────────────────────────────────────────────────────────
  // paidAt: ISO timestamp of when the user says they paid
  // billing_date on the server = the subscription's current next_renewal_date
  // (the cycle being closed — always set server-side, never passed from client)

  // ── Mark as paid ──────────────────────────────────────────────────────────
  const { markAsPaid } = useMarkAsPaid({
    onSuccess: (updatedSubscription) => {
      setSubscriptions((prev) =>
        prev.map((s) =>
          s.id === updatedSubscription.id ? updatedSubscription : s,
        ),
      );
    },
  });

  // UpcomingSubscriptionModal expects (paidAt: string) => Promise<void>
  // We curry in the selectedSubscription here so the modal stays decoupled
  const handleMarkAsPaid = async (paidAt: string): Promise<void> => {
    if (!selectedSubscription) return;
    await markAsPaid(selectedSubscription, paidAt);
  };

  // ── Fetch ─────────────────────────────────────────────────────────────────

  const loadSubscriptions = useCallback(
    async (mode: "load" | "refresh") => {
      if (mode === "load") setIsLoading(true);
      else setIsRefreshing(true);
      setError(null);

      try {
        const token = await getToken();
        if (!token) {
          setError("Session expired. Please sign in again.");
          return;
        }

        const response = await fetch(
          `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/get-subscriptions`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message ?? "Failed to fetch subscriptions");
        }

        setSubscriptions(data.subscriptions ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        if (mode === "load") setIsLoading(false);
        else setIsRefreshing(false);
      }
    },
    [getToken],
  );

  useEffect(() => {
    loadSubscriptions("load");
  }, []);

  const upcomingSubscriptions = useMemo(
    () => getUpcomingSubscriptions(subscriptions).slice(0, 5),
    [subscriptions],
  );

  return (
    <>
      <SafeAreaView
        className="flex-1 bg-background"
        style={[globalStyles.bodyPadding, { paddingTop: ms(15) }]}
        edges={["top"]}
      >
        <StatusBar translucent />
        <View>
          <FlatList
            ListHeaderComponent={() => (
              <View>
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
                          Here&apos;s your subscription overview
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity style={styles.notificationContainer}>
                      <BellDot color="#62748E" size={ms(20)} />
                    </TouchableOpacity>
                  </View>
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
                  {subscriptions.length > 0 && (
                    <TouchableOpacity
                      onPress={() => router.push("/(tabs)/subscriptions")}
                    >
                      <Text style={{ color: colors.gray }}>
                        {subscriptions.length} active subscription
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                <ListHeading
                  title="Upcoming Payments"
                  subtitle="See all"
                  onPress={() => router.push("/(tabs)/subscriptions")}
                />
              </View>
            )}
            data={
              isLoading ? SKELETON_PLACEHOLDER_ARRAY : upcomingSubscriptions
            }
            keyExtractor={(item, index) =>
              isLoading ? `skeleton-${index}` : (item as Subscription).id
            }
            renderItem={({ item }) =>
              isLoading || isRefreshing ? (
                <SubscriptionCardSkeleton />
              ) : (
                <SubscriptionCard
                  subscription={item as Subscription}
                  onPress={() => {
                    setSelectedSubscription(item as Subscription);
                    setSubscriptionDetailsModal(true);
                  }}
                />
              )
            }
            extraData={expandedSubscriptionId}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View className="h-4" />}
            ListEmptyComponent={
              isLoading ? null : error ? (
                <View
                  style={{
                    marginTop: vs(40),
                    alignItems: "center",
                    paddingHorizontal: ms(20),
                  }}
                >
                  <Text
                    style={{
                      color: colors.gray,
                      fontSize: ms(14),
                      fontFamily: "sans-medium",
                      textAlign: "center",
                    }}
                  >
                    {error}
                  </Text>
                  <TouchableOpacity
                    onPress={() => loadSubscriptions("load")}
                    style={{ marginTop: vs(12) }}
                  >
                    <Text
                      style={{
                        color: colors.accent ?? "#00C889",
                        fontSize: ms(13),
                        fontFamily: "sans-bold",
                      }}
                    >
                      Try again
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={{ marginTop: vs(40), alignItems: "center" }}>
                  <Text
                    style={{
                      color: colors.gray,
                      fontSize: ms(14),
                      fontFamily: "sans-medium",
                    }}
                  >
                    No active subscriptions yet
                  </Text>
                  <Text
                    style={{
                      color: colors.gray,
                      fontSize: ms(10),
                      fontFamily: "sans-medium",
                      marginTop: vs(4),
                    }}
                  >
                    Tap the + button below to add your first subscription
                  </Text>
                </View>
              )
            }
            contentContainerClassName="pb-20"
            contentContainerStyle={{ paddingBottom: tabBarHeight }}
            refreshing={refreshing}
            onRefresh={() => {
              console.log("refreshing");
              loadSubscriptions("refresh");
            }}
          />
        </View>
      </SafeAreaView>

      <FAB
        icon="plus"
        style={globalStyles.fab}
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
        markAsPaid={handleMarkAsPaid}
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
});
