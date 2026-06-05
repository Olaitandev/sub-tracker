import CreateSubscriptionModal from "@/components/CreateSubscriptionModal";
import ListHeading from "@/components/ListHeading";
import SubscriptionCard from "@/components/SubscriptionCard";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import {
    HOME_BALANCE,
    HOME_SUBSCRIPTIONS,
    HOME_USER,
    UPCOMING_SUBSCRIPTIONS,
} from "@/constants/data";
import { icons } from "@/constants/icons";
import "@/global.css";
import { formatCurrency } from "@/lib/utils";
import dayjs from "dayjs";

import { styled } from "nativewind";
import { usePostHog } from "posthog-react-native";
import { useState } from "react";
import { FlatList, Image, Pressable, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);
export default function App() {
  const posthog = usePostHog();
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [subscriptions, setSubscriptions] =
    useState<Subscription[]>(HOME_SUBSCRIPTIONS);
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
      <SafeAreaView className="flex-1 p-5 bg-background">
        <View>
          <FlatList
            ListHeaderComponent={() => (
              <>
                <View className="home-header">
                  <View className="home-user">
                    <Image
                      source={require("@/assets/images/avatar.png")}
                      className="home-avatar"
                    />
                    <Text className="home-user-name">{HOME_USER.name}</Text>
                  </View>
                  <Pressable
                    onPress={() => setIsModalVisible(true)}
                    className="active:opacity-60"
                  >
                    <Image source={icons.add} className="home-add-icon" />
                  </Pressable>
                </View>
                <View className="home-balance-card">
                  <Text className="home-balance-label">Balance</Text>

                  <View className="home-balance-row">
                    <Text className="home-balance-amount">
                      {formatCurrency(HOME_BALANCE.amount)}
                    </Text>
                    <Text className="home-balance-date">
                      {dayjs(HOME_BALANCE.nextRenewalDate).format("MM/DD")}
                    </Text>
                  </View>
                </View>
                <View className="mt-5">
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
                </View>
                <ListHeading title="All Subscriptions" />
              </>
            )}
            data={subscriptions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <SubscriptionCard
                {...item}
                expanded={expandedSubscriptionId === item.id}
                onPress={() => {
                  const isExpanding = expandedSubscriptionId !== item.id;
                  setExpandedSubscriptionId((prev) =>
                    prev === item.id ? null : item.id,
                  );
                  if (isExpanding) {
                    posthog.capture("subscription_expanded", {
                      subscription_id: item.id,
                      subscription_name: item.name,
                      subscription_category: item.category ?? null,
                      billing_cycle: item.billing ?? null,
                    });
                  }
                }}
              />
            )}
            extraData={expandedSubscriptionId}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View className="h-4" />}
            ListEmptyComponent={<Text>No active subscriptions yet</Text>}
            contentContainerClassName="pb-20"
          />
        </View>
      </SafeAreaView>
      <CreateSubscriptionModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={handleCreateSubscription}
      />
    </>
  );
}
