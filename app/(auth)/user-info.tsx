import { globalStyles } from "@/constants/theme";
import { Link, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { styled } from "nativewind";
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
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { ms, s, vs } from "react-native-size-matters";
import CustomButton from "../../components/ui/CustomButton";
import CustomModal from "../../components/ui/CustomModal";
const SafeAreaView = styled(RNSafeAreaView);

const UserInfo = () => {
  const [fullName, setFullName] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [selectedCurrencyIcon, setSelectedCurrencyIcon] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const currencies = [
    { id: "1", name: "USD", icon: "$" },
    { id: "2", name: "Euro", icon: "£" },
    { id: "3", name: "Pounds", icon: "€" },
    { id: "4", name: "Naira", icon: "₦" },
  ];

  const [currencyModal, setCurrencyModal] = useState(false);

  const handleSelectCurrency = (currency: any) => {
    setSelectedCurrency(currency.name);
    setSelectedCurrencyIcon(currency.icon);
    setCurrencyModal(false);
  };

  const isFormValid =
    fullName.trim().length >= 2 && selectedCurrency.length > 0;

  const handleSubmit = async () => {
    setSubmitted(true);
    setLoading(true);
    if (!isFormValid) return;

    try {
      router.replace("/(tabs)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <StatusBar translucent />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 "
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
                {/* <View>
                  <Text className="auth-wordmark">SubTrack</Text>
                  <Text className="auth-wordmark-sub">SUBSCRIPTIONS</Text>
                </View> */}
              </View>
              <Text className="auth-title">User Info</Text>
              <Text className="auth-subtitle">
                Choose your preferred currency
              </Text>
            </View>

            {/* Sign-Up Form */}
            <View className="p-5 mt-16 border rounded-3xl border-border">
              <View className="auth-form">
                <View className="auth-field">
                  <Text className="auth-label">Full Name</Text>
                  <TextInput
                    className={`auth-input`}
                    autoCapitalize="none"
                    value={fullName}
                    placeholder="john doe"
                    placeholderTextColor="rgba(0, 0, 0, 0.4)"
                    onChangeText={setFullName}
                    keyboardType="default"
                    style={{
                      paddingHorizontal: s(10),
                      paddingVertical: vs(10),
                    }}
                  />
                  {submitted && fullName.trim().length < 2 && (
                    <Text className="mt-1 text-destructive">
                      Please enter your full name
                    </Text>
                  )}
                </View>
                <View className="auth-field">
                  <Text className="auth-label">Currency</Text>
                  <TouchableOpacity
                    onPress={() => setCurrencyModal(true)}
                    className="flex-row items-center justify-between"
                    style={styles.currencyInput}
                  >
                    {selectedCurrency ? (
                      <View className="flex-row items-center gap-2">
                        <View className="items-center justify-center w-8 h-8 rounded-full bg-emerald-50">
                          <Text className="font-bold text-accent">
                            {selectedCurrencyIcon}
                          </Text>
                        </View>

                        <Text className="text-black font-sans-medium ">
                          {selectedCurrency}
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

                <CustomButton
                  onPress={handleSubmit}
                  text="Continue"
                  disabled={!isFormValid}
                  loading={loading}
                />
              </View>
            </View>

            {/* Sign-In Link */}
            <View className="auth-link-row">
              <Text className="auth-link-copy">Already have an account?</Text>
              <Link href="/(auth)/sign-in" asChild>
                <Pressable>
                  <Text className="auth-link">Sign In</Text>
                </Pressable>
              </Link>
            </View>

            {/* Required for Clerk's bot protection */}
            <View nativeID="clerk-captcha" />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modals */}

      <CustomModal
        visible={currencyModal}
        onClose={() => setCurrencyModal(false)}
      >
        <View style={globalStyles.modalContent}>
          <View style={globalStyles.modalHeader}>
            <Text style={globalStyles.modalTitle}>Select Currency</Text>
          </View>

          {currencies.map((currency, index) => (
            <TouchableOpacity
              key={index}
              style={globalStyles.modalButton}
              onPress={() => handleSelectCurrency(currency)}
            >
              <Text
                style={[
                  globalStyles.modalButtonText,
                  selectedCurrency === currency.name &&
                    globalStyles.selectedCurrencyText,
                ]}
              >
                {currency.name}
              </Text>
              {selectedCurrency === currency.name && (
                <View style={globalStyles.checkmark}>
                  <Text style={globalStyles.checkmarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}

          {/* <Button
            style={{}}
            onPress={() => setCurrencyModal(false)}
            text="Continue"
          /> */}
        </View>
      </CustomModal>
    </SafeAreaView>
  );
};

export default UserInfo;

const styles = StyleSheet.create({
  currencyText: {
    fontSize: ms(13),
    paddingVertical: vs(0.2),
  },
  currencyInput: {
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
    paddingHorizontal: s(10),
    paddingVertical: vs(7),
    borderRadius: ms(10),
    height: ms(47),
  },
});
// px-4 py-4 border rounded-2xl border-border font-sans-medium text-primary;
