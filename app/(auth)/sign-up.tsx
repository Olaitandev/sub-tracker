import { colors, globalStyles } from "@/constants/theme";
import { useAuth, useSignUp } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ChevronLeft, Eye, EyeOff } from "lucide-react-native";
import { styled } from "nativewind";
import { usePostHog } from "posthog-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { ms, s, vs } from "react-native-size-matters";
import CustomButton from "../../components/ui/CustomButton";

const SafeAreaView = styled(RNSafeAreaView);

const SignUp = () => {
  const { signUp, errors, fetchStatus } = useSignUp();
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const posthog = usePostHog();
  const [loading, setLoading] = useState(false);
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [navigating, setNavigating] = useState(false);

  // Validation states
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  // Client-side validation
  const emailValid =
    emailAddress.length === 0 ||
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress);
  const passwordValid = password.length === 0 || password.length >= 8;
  const formValid =
    emailAddress.length > 0 && password.length >= 8 && emailValid;

  const handleSubmit = async () => {
    if (!formValid) return;
    setLoading(true);
    const { error } = await signUp.password({
      emailAddress,
      password,
    });

    if (error) {
      console.error(JSON.stringify(error, null, 2));
      setLoading(false);
      posthog.capture("user_sign_up_failed", {
        error_message: error.message,
      });
      return;
    }

    // Send verification email
    if (!error) {
      await signUp.verifications.sendEmailCode();
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    await signUp.verifications.verifyEmailCode({
      code,
    });

    if (signUp.status === "complete") {
      setNavigating(true);
      await signUp.finalize({
        // Redirect the user to the home page after signing up
        navigate: ({ session }) => {
          // Handle session tasks
          // See https://clerk.com/docs/guides/development/custom-flows/authentication/session-tasks
          if (session?.currentTask) {
            console.log(session?.currentTask);
            return;
          }

          router.push({
            pathname: "/(auth)/user-info",
            params: { entry: "sign_up" },
          });
          setLoading(false);
        },
      });
    } else {
      // Check why the sign-up is not complete
      console.error("Sign-up attempt not complete:", signUp);
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoadingOtp(true);
    try {
      await signUp.verifications.sendEmailCode();
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setLoadingOtp(false);
    }
  };

  // Don't show anything if already signed in or sign-up is complete
  if (signUp.status === "complete" || isSignedIn) {
    return null;
  }

  // Show verification screen if email needs verification
  if (
    signUp.status === "missing_requirements" &&
    signUp.unverifiedFields.includes("email_address") &&
    signUp.missingFields.length === 0
  ) {
    return (
      <SafeAreaView
        className="flex-1 bg-background"
        style={globalStyles.bodyPadding}
      >
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
            <View>
              <TouchableOpacity
                onPress={() => signUp.reset()}
                style={{
                  borderWidth: 1,
                  // padding: ms(5),
                  width: ms(30),
                  height: ms(30),
                  alignItems: "center",
                  borderRadius: ms(10),
                  justifyContent: "center",
                  backgroundColor: colors.primary,
                }}
              >
                <ChevronLeft color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={{ paddingTop: ms(10), flexGrow: 1 }}>
              {/* Branding */}
              <View className="auth-brand-block">
                <View className="auth-logo-wrap">
                  <View className="auth-logo-mark">
                    <Text className="auth-logo-mark-text">S</Text>
                  </View>
                  <View>
                    <Text className="auth-wordmark">SubTrack</Text>
                    <Text className="auth-wordmark-sub">SUBSCRIPTIONS</Text>
                  </View>
                </View>
                <Text className="auth-title">Verify your email</Text>
                <Text className="auth-subtitle">
                  We sent a verification code to {emailAddress}
                </Text>
              </View>

              {/* Verification Form */}
              <View className="auth-card">
                <View className="auth-form">
                  <View className="auth-field">
                    <Text className="auth-label">Verification Code</Text>
                    <TextInput
                      className="auth-input"
                      value={code}
                      placeholder="Enter 6-digit code"
                      placeholderTextColor="rgba(0, 0, 0, 0.4)"
                      onChangeText={setCode}
                      keyboardType="number-pad"
                      autoComplete="one-time-code"
                      maxLength={6}
                    />
                    {errors.fields.code && (
                      <Text className="auth-error">
                        {errors.fields.code.message}
                      </Text>
                    )}
                  </View>

                  {/* <Pressable
                    className={`auth-button ${(!code || fetchStatus === "fetching") && "auth-button-disabled"}`}
                    onPress={handleVerify}
                    disabled={!code || fetchStatus === "fetching"}
                  >
                    <Text className="auth-button-text">
                      {fetchStatus === "fetching"
                        ? "Verifying..."
                        : "Verify Email"}
                    </Text>
                  </Pressable> */}

                  <CustomButton
                    text="Verify Email"
                    onPress={handleVerify}
                    loading={loading}
                    disabled={
                      !code || code.length < 6 || fetchStatus === "fetching"
                    }
                  />

                  <CustomButton
                    text="Resend Code"
                    onPress={handleResendOtp}
                    loading={loadingOtp}
                    disabled={fetchStatus === "fetching"}
                    type="secondary"
                  />

                  {/* <Pressable
                    className="auth-secondary-button"
                    onPress={() => signUp.verifications.sendEmailCode()}
                    disabled={fetchStatus === "fetching"}
                  >
                    <Text className="auth-secondary-button-text">
                      Resend Code
                    </Text>
                  </Pressable> */}
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
        {navigating && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "#fff",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 999,
            }}
          >
            <ActivityIndicator size="large" color="#10b981" />
            <Text
              style={{
                marginTop: 12,
                color: "#6b7280",
                fontFamily: "your-font",
              }}
            >
              Setting up your account...
            </Text>
          </View>
        )}
      </SafeAreaView>
    );
  }

  // Main sign-up form
  return (
    <SafeAreaView className="flex-1 bg-background">
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
                {/* <View>
                  <Text className="auth-wordmark">SubTrack</Text>
                  <Text className="auth-wordmark-sub">SUBSCRIPTIONS</Text>
                </View> */}
              </View>
              <Text className="auth-title">Create Account</Text>
              <Text className="auth-subtitle">
                Save your subscriptions and sync across every device, securely
              </Text>
            </View>

            {/* Sign-Up Form */}
            <View className="p-5 mt-16 border rounded-3xl border-border">
              <View className="auth-form">
                <View className="auth-field">
                  <Text className="auth-label">Email Address</Text>
                  <TextInput
                    className={`auth-input ${emailTouched && !emailValid && "auth-input-error"}`}
                    autoCapitalize="none"
                    value={emailAddress}
                    placeholder="name@example.com"
                    placeholderTextColor="rgba(0, 0, 0, 0.4)"
                    onChangeText={setEmailAddress}
                    onBlur={() => setEmailTouched(true)}
                    keyboardType="email-address"
                    autoComplete="email"
                    style={{
                      paddingHorizontal: s(10),
                      paddingVertical: vs(10),
                    }}
                  />
                  {emailTouched && !emailValid && (
                    <Text className="auth-error">
                      Please enter a valid email address
                    </Text>
                  )}
                  {errors.fields.emailAddress && (
                    <Text className="auth-error">
                      {errors.fields.emailAddress.message}
                    </Text>
                  )}
                </View>

                <View className="auth-field">
                  <Text className="auth-label">Password</Text>
                  <View
                    className={`flex-row items-center border rounded-xl border-border ${
                      passwordTouched && !passwordValid
                        ? "border-destructive"
                        : "border-border"
                    }`}
                  >
                    <TextInput
                      className="flex-1"
                      value={password}
                      placeholder="Create a strong password"
                      placeholderTextColor="rgba(0, 0, 0, 0.4)"
                      secureTextEntry={!showPassword}
                      onChangeText={setPassword}
                      onBlur={() => setPasswordTouched(true)}
                      autoComplete="password-new"
                      onSubmitEditing={handleSubmit}
                      style={{
                        paddingHorizontal: s(10),
                        paddingVertical: vs(10),
                      }}
                    />
                    <Pressable
                      onPress={() => setShowPassword((prev) => !prev)}
                      className="px-3"
                      hitSlop={10}
                    >
                      {showPassword ? (
                        <EyeOff size={20} color="gray" />
                      ) : (
                        <Eye size={20} color="gray" />
                      )}
                    </Pressable>
                  </View>
                  {passwordTouched && !passwordValid && (
                    <Text className="auth-error">
                      Password must be at least 8 characters
                    </Text>
                  )}
                  {errors.fields.password && (
                    <Text className="auth-error">
                      {errors.fields.password.message}
                    </Text>
                  )}
                  {!passwordTouched && (
                    <Text className="auth-helper">
                      Minimum 8 characters required
                    </Text>
                  )}
                </View>

                <CustomButton
                  text="Create Account"
                  onPress={handleSubmit}
                  loading={loading}
                  disabled={!formValid || fetchStatus === "fetching"}
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
    </SafeAreaView>
  );
};

export default SignUp;
