import { icons } from "@/constants/icons";
import { posthog } from "@/src/config/posthog";
import { clsx } from "clsx";
import dayjs from "dayjs";
import * as SplashScreen from "expo-splash-screen";
import CustomModal from "./ui/CustomModal";

import { colors, globalStyles } from "@/constants/theme";
import { X } from "lucide-react-native";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { ms } from "react-native-size-matters";
import CustomButton from "./ui/CustomButton";

const CATEGORIES = [
  "Entertainment",
  "AI Tools",
  "Developer Tools",
  "Design",
  "Productivity",
  "Cloud",
  "Music",
  "Other",
];

const CATEGORY_COLORS: Record<string, string> = {
  Entertainment: "#ff6b6b",
  "AI Tools": "#b8d4e3",
  "Developer Tools": "#e8def8",
  Design: "#f5c542",
  Productivity: "#8fd1bd",
  Cloud: "#a8d5ff",
  Music: "#ffc0cb",
  Other: "#e0e0e0",
};

interface CreateSubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (subscription: Subscription) => void;
}

SplashScreen.preventAutoHideAsync().catch(() => {});

const CreateSubscriptionModal = ({
  visible,
  onClose,
  onSubmit,
}: CreateSubscriptionModalProps) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [frequency, setFrequency] = useState<"Monthly" | "Yearly">("Monthly");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Subscription name is required";
    }

    const parsedPrice = parseFloat(price);
    if (!price.trim() || isNaN(parsedPrice) || parsedPrice <= 0) {
      newErrors.price = "Price must be a positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const now = dayjs();
    const renewalDate =
      frequency === "Monthly"
        ? now.add(1, "month").toISOString()
        : now.add(1, "year").toISOString();

    const newSubscription: Subscription = {
      id: `sub-${Date.now()}`,
      name: name.trim(),
      price: parseFloat(price),
      currency: "USD",
      billing: frequency,
      frequency,
      category,
      status: "active",
      startDate: now.toISOString(),
      renewalDate,
      icon: icons.wallet,
      color: CATEGORY_COLORS[category],
    };

    onSubmit(newSubscription);
    posthog.capture("subscription_created", {
      subscription_id: newSubscription.id,
      subscription_name: newSubscription.name,
      subscription_category: category,
      billing_cycle: newSubscription.billing,
    });
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setName("");
    setPrice("");
    setFrequency("Monthly");
    setCategory(CATEGORIES[0]);
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const isSubmitDisabled = !name.trim() || !price.trim();

  return (
    <CustomModal visible={visible} onClose={handleClose}>
      <ScrollView style={globalStyles.modalContent}>
        {/* Backdrop — pressing this closes the modal */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <View>
            {/* Header */}
            <View className="modal-header">
              <Text className="modal-title">New Subscription</Text>
              <TouchableOpacity
                style={{
                  padding: ms(5),
                  // borderWidth: 1,
                  alignSelf: "flex-end",
                  borderRadius: ms(10),
                  backgroundColor: "#DC2626",
                }}
                onPress={handleClose}
              >
                <X size={ms(20)} color={colors.background} />
              </TouchableOpacity>
            </View>

            {/* Form Content */}
            <ScrollView className="" scrollEnabled>
              {/* Name Field */}
              <View className="auth-field">
                <Text className="auth-label">Subscription Name</Text>
                <TextInput
                  className={clsx(
                    "auth-input",
                    errors.name && "auth-input-error",
                  )}
                  placeholder="e.g., Netflix, Spotify"
                  placeholderTextColor="#999"
                  value={name}
                  onChangeText={setName}
                />
                {errors.name && (
                  <Text className="auth-error">{errors.name}</Text>
                )}
              </View>

              {/* Price Field */}
              <View className="auth-field">
                <Text className="auth-label">Price</Text>
                <TextInput
                  className={clsx(
                    "auth-input",
                    errors.price && "auth-input-error",
                  )}
                  placeholder="0.00"
                  placeholderTextColor="#999"
                  keyboardType="decimal-pad"
                  value={price}
                  onChangeText={setPrice}
                />
                {errors.price && (
                  <Text className="auth-error">{errors.price}</Text>
                )}
              </View>

              {/* Frequency Toggle */}
              <View className="auth-field">
                <Text className="auth-label">Billing Frequency</Text>
                <View className="picker-row">
                  {(["Monthly", "Yearly"] as const).map((freq) => (
                    <Pressable
                      key={freq}
                      className={clsx(
                        "picker-option",
                        frequency === freq && "picker-option-active",
                      )}
                      onPress={() => setFrequency(freq)}
                    >
                      <Text
                        className={clsx(
                          "picker-option-text",
                          frequency === freq && "picker-option-text-active",
                        )}
                      >
                        {freq}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Category Selection */}
              <View className="auth-field">
                <Text className="auth-label">Category</Text>
                <View className="category-scroll">
                  {CATEGORIES.map((cat) => (
                    <Pressable
                      key={cat}
                      className={clsx(
                        "category-chip",
                        category === cat && "category-chip-active",
                      )}
                      onPress={() => setCategory(cat)}
                    >
                      <Text
                        className={clsx(
                          "category-chip-text",
                          category === cat && "category-chip-text-active",
                        )}
                      >
                        {cat}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Submit Button */}
              <CustomButton
                onPress={handleSubmit}
                disabled={isSubmitDisabled}
                className={clsx(
                  "auth-button",
                  isSubmitDisabled && "auth-button-disabled",
                )}
                text="Create Subscription"
              />

              {/* Extra padding at bottom for scrolling */}
              <View className="h-6" />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </CustomModal>
  );
};

export default CreateSubscriptionModal;

const styles = StyleSheet.create({
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    // backgroundColor: "rgba(0,0,0,0.5)",
  },
});
