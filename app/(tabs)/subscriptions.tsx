import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import { HOME_SUBSCRIPTIONS } from "@/constants/data";
import { colors } from "@/constants/theme";
import { styled } from "nativewind";
import { useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, View } from "react-native";
import { FAB } from "react-native-paper";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { ms } from "react-native-size-matters";

const SafeAreaView = styled(RNSafeAreaView);
const StyledTextInput = styled(TextInput);
const StyledView = styled(View);
const Subscriptions = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filter subscriptions based on search query
  const filteredSubscriptions = useMemo(() => {
    if (!searchQuery.trim()) {
      return HOME_SUBSCRIPTIONS;
    }

    const query = searchQuery.toLowerCase();
    return HOME_SUBSCRIPTIONS.filter(
      (sub) =>
        sub.name.toLowerCase().includes(query) ||
        sub.category?.toLowerCase().includes(query) ||
        sub.plan?.toLowerCase().includes(query),
    );
  }, [searchQuery]);

  const handleCardPress = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const renderSubscriptionCard = ({ item }: { item: Subscription }) => (
    <StyledView className="mb-3">
      <UpcomingSubscriptionCard
        {...item}
        expanded={expandedId === item.id}
        onPress={() => handleCardPress(item.id)}
      />
    </StyledView>
  );

  const renderEmptyState = () => (
    <StyledView className="items-center justify-center flex-1">
      <Text className="text-lg text-center text-text-secondary">
        {searchQuery ? "No subscriptions found" : "No subscriptions yet"}
      </Text>
    </StyledView>
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <StyledView className="p-5 pb-0">
        {/* Search Header */}
        <Text className="mb-4 text-2xl font-pbold">Subscriptions</Text>

        {/* Search Input */}
        <StyledView className="flex-row items-center px-4 py-3 mb-5 border border-gray-200 rounded-lg bg-card">
          <StyledTextInput
            className="flex-1 text-base text-text font-pregular"
            placeholder="Search by name, category..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </StyledView>
      </StyledView>

      {/* Subscriptions List */}
      {filteredSubscriptions.length > 0 ? (
        <FlatList
          data={filteredSubscriptions}
          renderItem={renderSubscriptionCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          scrollEnabled
          nestedScrollEnabled
        />
      ) : (
        renderEmptyState()
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => console.log("Pressed")}
        visible={true}
        color="white"
      />
    </SafeAreaView>
  );
};

export default Subscriptions;

const styles = StyleSheet.create({
  listContent: {
    // paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
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
