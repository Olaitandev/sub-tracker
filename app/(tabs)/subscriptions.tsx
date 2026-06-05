import SubscriptionCard from "@/components/SubscriptionCard";
import { HOME_SUBSCRIPTIONS } from "@/constants/data";
import { styled } from "nativewind";
import { useMemo, useState } from "react";
import {
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    View
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

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
      <SubscriptionCard
        {...item}
        expanded={expandedId === item.id}
        onPress={() => handleCardPress(item.id)}
      />
    </StyledView>
  );

  const renderEmptyState = () => (
    <StyledView className="flex-1 justify-center items-center">
      <Text className="text-text-secondary text-center text-lg">
        {searchQuery ? "No subscriptions found" : "No subscriptions yet"}
      </Text>
    </StyledView>
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StyledView className="p-5 pb-0">
        {/* Search Header */}
        <Text className="text-2xl font-pbold mb-4">Subscriptions</Text>

        {/* Search Input */}
        <StyledView className="flex-row items-center bg-card rounded-lg px-4 py-3 mb-5 border border-gray-200">
          <StyledTextInput
            className="flex-1 text-text font-pregular text-base"
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
    </SafeAreaView>
  );
};

export default Subscriptions;

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
  },
});
