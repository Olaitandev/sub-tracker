import AddSubscriptionModal from "@/components/modals/AddSubscriptionModal";
import SubscriptionCard from "@/components/SubscriptionCard";
import { useToast } from "@/components/ui/NotificationService";
import StatusFilterPills, {
  StatusFilter,
} from "@/components/ui/StatusFilterPill";
import { colors, globalStyles } from "@/constants/theme";
import { useTabBarHeight } from "@/hooks/useTabBarHeight";
import { useAuth } from "@clerk/expo";
import { router, useLocalSearchParams } from "expo-router";
import { Search } from "lucide-react-native";
import { styled } from "nativewind";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { FAB } from "react-native-paper";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { ms } from "react-native-size-matters";

const SafeAreaView = styled(RNSafeAreaView);

// ─── Types ────────────────────────────────────────────────────────────────────

export type Subscription = {
  id: string;
  user_id: string;
  service_name: string;
  amount: number;
  currency_code: string;
  category_id: number | null;
  icon_id: string | null;
  icon_color: string | null;
  icon_initials: string | null;
  billing_cycle: string;
  start_date: string;
  next_renewal_date: string;
  notes: string | null;
  notifications: string[];
  is_active: boolean;
  created_at: string;
  status: "active" | "paused" | "cancelled";
};

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({
  hasSearch,
  hasFilter,
}: {
  hasSearch: boolean;
  hasFilter: boolean;
}) {
  const title = hasSearch
    ? "No results found"
    : hasFilter
      ? "Nothing here yet"
      : "No subscriptions yet";

  const subtitle = hasSearch
    ? "Try a different search term"
    : hasFilter
      ? "Switch tabs to see other subscriptions"
      : "Tap + Add to track your first subscription";

  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySubtitle}>{subtitle}</Text>
    </View>
  );
}
// ─── Error state ──────────────────────────────────────────────────────────────

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>Couldn&apos;t load subscriptions</Text>
      <Text style={styles.emptySubtitle}>
        Check your connection and try again
      </Text>
      <TouchableOpacity onPress={onRetry} style={styles.retryButton}>
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SubscriptionsScreen() {
  const { getToken } = useAuth();
  const { showSuccess } = useToast();
  const tabBarHeight = useTabBarHeight();
  const { justAdded } = useLocalSearchParams<{ justAdded?: string }>();

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

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

        // console.log(data);

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

  // ── Toast on new subscription ─────────────────────────────────────────────

  useEffect(() => {
    if (justAdded === "true") {
      showSuccess("success", "Subscription saved");
    }
  }, [justAdded]);

  // ── Search ────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return subscriptions.filter((s) => {
      const matchesStatus = statusFilter === "all" || s.status === statusFilter;
      const matchesSearch =
        !q ||
        s.service_name.toLowerCase().includes(q) ||
        s.billing_cycle.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [subscriptions, searchQuery, statusFilter]);

  const statusCounts = useMemo(() => {
    return {
      all: subscriptions.length,
      active: subscriptions.filter((s) => s.status === "active").length,
      paused: subscriptions.filter((s) => s.status === "paused").length,
      cancelled: subscriptions.filter((s) => s.status === "cancelled").length,
    };
  }, [subscriptions]);

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
  // ── Render ────────────────────────────────────────────────────────────────

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.accent} size="large" />
        </View>
      );
    }

    if (error) {
      return <ErrorState onRetry={() => loadSubscriptions("load")} />;
    }

    return (
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SubscriptionCard
            subscription={item}
            onPress={() => {
              router.push(`/sub-screens/SubscriptionDetail?id=${item.id}`);
            }}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: ms(10) }} />}
        ListEmptyComponent={
          <EmptyState
            hasSearch={!!searchQuery.trim()}
            hasFilter={statusFilter !== "all"}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: tabBarHeight + ms(20) },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadSubscriptions("refresh")}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
      />
    );
  };

  return (
    <SafeAreaView
      className="flex-1 bg-background"
      style={globalStyles.bodyPadding}
      edges={["top"]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={globalStyles.pageTitle}>Subscriptions</Text>
        {/* <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/sub-screens/CreateSubscription")}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity> */}
      </View>

      {/* Search bar */}
      <View style={styles.searchBar}>
        <Search size={ms(16)} color={colors.gray} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search subscriptions..."
          placeholderTextColor={colors.gray}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCorrect={false}
          autoCapitalize="none"
          clearButtonMode="while-editing"
        />
      </View>

      {/* Status filter */}
      <StatusFilterPills
        selected={statusFilter}
        onSelect={setStatusFilter}
        counts={statusCounts}
      />

      {renderContent()}

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
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: ms(10),
  },
  addButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: ms(14),
    paddingVertical: ms(7),
    borderRadius: ms(999),
  },
  addButtonText: {
    fontFamily: "sans-semibold",
    fontSize: ms(13),
    color: "#fff",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: ms(10),
    backgroundColor: "#F1F5F9",
    borderWidth: ms(1),
    borderColor: "#E2E8F1",
    borderRadius: ms(13),
    paddingHorizontal: ms(14),
    height: ms(46),
    marginTop: ms(12),
  },
  searchInput: {
    flex: 1,
    fontFamily: "sans-regular",
    fontSize: ms(14),
    color: "#0F172A",
    height: "100%",
  },
  summaryText: {
    fontFamily: "sans-medium",
    fontSize: ms(12),
    color: colors.gray,
    marginTop: ms(12),
    marginBottom: ms(4),
  },
  listContent: {
    paddingTop: ms(10),
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: ms(80),
    gap: ms(8),
  },
  emptyTitle: {
    fontFamily: "sans-semibold",
    fontSize: ms(15),
    color: "#0F172A",
  },
  emptySubtitle: {
    fontFamily: "sans-regular",
    fontSize: ms(13),
    color: colors.gray,
    textAlign: "center",
  },
  retryButton: {
    marginTop: ms(12),
    paddingHorizontal: ms(20),
    paddingVertical: ms(10),
    backgroundColor: colors.accent,
    borderRadius: ms(999),
  },
  retryButtonText: {
    fontFamily: "sans-semibold",
    fontSize: ms(13),
    color: "#fff",
  },
});
