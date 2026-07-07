import { globalStyles } from "@/constants/theme";
import { markOnboardingComplete } from "@/hooks/useOnboardingStatus";
import { useAuth } from "@clerk/expo";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { styled } from "nativewind";
import { usePostHog } from "posthog-react-native";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { ms, s, vs } from "react-native-size-matters";
import CustomButton from "../../components/ui/CustomButton";
import CustomModal from "../../components/ui/CustomModal";

const SafeAreaView = styled(RNSafeAreaView);

const CURRENCIES = [
  { id: "1", code: "USD", name: "US Dollar", icon: "$" },
  { id: "2", code: "EUR", name: "Euro", icon: "€" },
  { id: "3", code: "GBP", name: "British Pound", icon: "£" },
  { id: "4", code: "NGN", name: "Nigerian Naira", icon: "₦" },
  { id: "5", code: "CAD", name: "Canadian Dollar", icon: "$" },
  { id: "6", code: "AUD", name: "Australian Dollar", icon: "$" },
  { id: "7", code: "JPY", name: "Japanese Yen", icon: "¥" },
  { id: "8", code: "CHF", name: "Swiss Franc", icon: "₣" },
  { id: "9", code: "CNY", name: "Chinese Yuan", icon: "¥" },
  { id: "10", code: "INR", name: "Indian Rupee", icon: "₹" },
  { id: "11", code: "BRL", name: "Brazilian Real", icon: "R$" },
  { id: "12", code: "ZAR", name: "South African Rand", icon: "R" },
  { id: "13", code: "AED", name: "UAE Dirham", icon: "د.إ" },
  { id: "14", code: "SGD", name: "Singapore Dollar", icon: "$" },
  { id: "15", code: "MXN", name: "Mexican Peso", icon: "$" },
];

type Gender = "male" | "female" | "prefer_not_to_say";

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;

const UserInfo = () => {
  const { getToken, userId } = useAuth();
  const posthog = usePostHog();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [selectedGender, setSelectedGender] = useState<Gender | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<
    (typeof CURRENCIES)[number] | null
  >(CURRENCIES[0]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currencyModal, setCurrencyModal] = useState(false);
  const [genderModal, setGenderModal] = useState(false);

  const isFormValid =
    firstName.trim().length >= 1 &&
    lastName.trim().length >= 1 &&
    selectedGender !== null &&
    selectedCurrency !== null;

  const handleSelectCurrency = (currency: (typeof CURRENCIES)[number]) => {
    setSelectedCurrency(currency);
    setCurrencyModal(false);
  };

  const handleSelectGender = (gender: Gender) => {
    setSelectedGender(gender);
    setGenderModal(false);
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    if (!isFormValid) return;

    setLoading(true);
    setError(null);

    try {
      const token = await getToken();

      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/complete-onboarding`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            gender: selectedGender,
            defaultCurrency: selectedCurrency!.code,
          }),
        },
      );

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "Something went wrong");
      }

      posthog.capture("onboarding_completed", {
        gender: selectedGender,
        default_currency: selectedCurrency!.code,
      });

      await markOnboardingComplete(userId!);
      router.replace({ pathname: "/(tabs)", params: { entry: "onboarding" } });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      posthog.capture("onboarding_failed", { error: message });
    } finally {
      setLoading(false);
    }
  };

  const genderLabel = GENDER_OPTIONS.find(
    (g) => g.value === selectedGender,
  )?.label;

  return (
    <SafeAreaView className="flex-1">
      <StatusBar translucent />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="auth-scroll"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="auth-content">
            {/* Branding */}
            <View className="auth-brand-block">
              <View className="auth-logo-wrap">
                <View className="auth-logo-mark">
                  <Text className="auth-logo-mark-text">S</Text>
                </View>
              </View>
              <Text className="auth-title">Tell us about you</Text>
              <Text className="auth-subtitle">
                Personalise your SubTrack experience
              </Text>
            </View>

            {/* Form */}
            <View className="p-5 mt-16 border rounded-3xl border-border">
              <View className="auth-form">
                {/* First Name */}
                <View className="auth-field">
                  <Text className="auth-label">First Name</Text>
                  <TextInput
                    className="auth-input"
                    autoCapitalize="words"
                    value={firstName}
                    placeholder="John"
                    placeholderTextColor="rgba(0, 0, 0, 0.4)"
                    onChangeText={setFirstName}
                    autoComplete="given-name"
                    returnKeyType="next"
                    style={{
                      paddingHorizontal: s(10),
                      paddingVertical: vs(10),
                    }}
                  />
                  {submitted && firstName.trim().length < 1 && (
                    <Text className="mt-1 text-destructive">
                      Please enter your first name
                    </Text>
                  )}
                </View>

                {/* Last Name */}
                <View className="auth-field">
                  <Text className="auth-label">Last Name</Text>
                  <TextInput
                    className="auth-input"
                    autoCapitalize="words"
                    value={lastName}
                    placeholder="Doe"
                    placeholderTextColor="rgba(0, 0, 0, 0.4)"
                    onChangeText={setLastName}
                    autoComplete="family-name"
                    returnKeyType="done"
                    style={{
                      paddingHorizontal: s(10),
                      paddingVertical: vs(10),
                    }}
                  />
                  {submitted && lastName.trim().length < 1 && (
                    <Text className="mt-1 text-destructive">
                      Please enter your last name
                    </Text>
                  )}
                </View>

                {/* Gender */}
                <View className="auth-field">
                  <Text className="auth-label">Gender</Text>
                  <TouchableOpacity
                    onPress={() => setGenderModal(true)}
                    className="flex-row items-center justify-between"
                    style={styles.selectInput}
                  >
                    {selectedGender ? (
                      <View className="flex-row items-center gap-2">
                        <View className="items-center justify-center w-8 h-8 rounded-full bg-emerald-50">
                          <Text className="font-bold text-accent">
                            {selectedGender === "male"
                              ? "♂"
                              : selectedGender === "female"
                                ? "♀"
                                : "–"}
                          </Text>
                        </View>
                        <Text className="text-black font-sans-medium">
                          {genderLabel}
                        </Text>
                      </View>
                    ) : (
                      <Text className="text-gray-400">Select your gender</Text>
                    )}
                    <Text className="text-gray-400">⌄</Text>
                  </TouchableOpacity>
                  {submitted && !selectedGender && (
                    <Text className="mt-1 text-destructive">
                      Please select your gender
                    </Text>
                  )}
                </View>

                {/* Currency */}
                <View className="auth-field">
                  <Text className="auth-label">Default Currency</Text>
                  <TouchableOpacity
                    onPress={() => setCurrencyModal(true)}
                    className="flex-row items-center justify-between"
                    style={styles.selectInput}
                  >
                    {selectedCurrency ? (
                      <View className="flex-row items-center gap-2">
                        <View className="items-center justify-center w-8 h-8 rounded-full bg-emerald-50">
                          <Text className="font-bold text-accent">
                            {selectedCurrency.icon}
                          </Text>
                        </View>
                        <Text className="text-black font-sans-medium">
                          {selectedCurrency.code} — {selectedCurrency.name}
                        </Text>
                      </View>
                    ) : (
                      <Text className="text-gray-400">
                        Select your currency
                      </Text>
                    )}
                    <Text className="text-gray-400">⌄</Text>
                  </TouchableOpacity>
                  {submitted && !selectedCurrency && (
                    <Text className="mt-1 text-destructive">
                      Please select a currency
                    </Text>
                  )}
                </View>

                {/* API error */}
                {error && (
                  <Text className="-mt-2 text-sm text-center text-destructive">
                    {error}
                  </Text>
                )}

                <CustomButton
                  onPress={handleSubmit}
                  text="Continue"
                  disabled={submitted && !isFormValid}
                  loading={loading}
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Gender Modal */}
      <CustomModal visible={genderModal} onClose={() => setGenderModal(false)}>
        <View style={globalStyles.modalContent}>
          <View style={globalStyles.modalHeader}>
            <Text style={globalStyles.modalTitle}>Select Gender</Text>
          </View>
          {GENDER_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={globalStyles.modalButton}
              onPress={() => handleSelectGender(option.value)}
            >
              <Text
                style={[
                  globalStyles.modalButtonText,
                  selectedGender === option.value &&
                    globalStyles.selectedCurrencyText,
                ]}
              >
                {option.label}
              </Text>
              {selectedGender === option.value && (
                <View style={globalStyles.checkmark}>
                  <Text style={globalStyles.checkmarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </CustomModal>

      {/* Currency Modal */}
      <CustomModal
        visible={currencyModal}
        onClose={() => setCurrencyModal(false)}
      >
        <View style={globalStyles.modalContent}>
          <View style={globalStyles.modalHeader}>
            <Text style={globalStyles.modalTitle}>Select Currency</Text>
          </View>
          {CURRENCIES.map((currency) => (
            <TouchableOpacity
              key={currency.id}
              style={globalStyles.modalButton}
              onPress={() => handleSelectCurrency(currency)}
            >
              <Text
                style={[
                  globalStyles.modalButtonText,
                  selectedCurrency?.code === currency.code &&
                    globalStyles.selectedCurrencyText,
                ]}
              >
                {currency.icon}
                {"  "}
                {currency.code} — {currency.name}
              </Text>
              {selectedCurrency?.code === currency.code && (
                <View style={globalStyles.checkmark}>
                  <Text style={globalStyles.checkmarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </CustomModal>
    </SafeAreaView>
  );
};

export default UserInfo;

const styles = StyleSheet.create({
  selectInput: {
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
    paddingHorizontal: s(10),
    paddingVertical: vs(7),
    borderRadius: ms(10),
    height: ms(47),
  },
});
