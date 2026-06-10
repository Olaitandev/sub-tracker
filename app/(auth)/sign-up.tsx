import { useAuth, useSignUp } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
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
import { s, vs } from "react-native-size-matters";

const SafeAreaView = styled(RNSafeAreaView);

const SignUp = () => {
  const { signUp, errors, fetchStatus } = useSignUp();
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const posthog = usePostHog();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [navigating, setNavigating] = useState(false);

  // Validation states
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  // Client-side validation
  const emailValid =
    emailAddress.length === 0 ||
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress);
  const passwordValid = password.length === 0 || password.length >= 8;
  const formValid =
    emailAddress.length > 0 && password.length >= 8 && emailValid;

  const handleSubmit = async () => {
    if (!formValid) return;

    const { error } = await signUp.password({
      emailAddress,
      password,
    });

    if (error) {
      console.error(JSON.stringify(error, null, 2));
      posthog.capture("user_sign_up_failed", {
        error_message: error.message,
      });
      return;
    }

    // Send verification email
    if (!error) {
      await signUp.verifications.sendEmailCode();
    }
  };

  // const handleVerify = async () => {
  //   await signUp.verifications.verifyEmailCode({
  //     code,
  //   });

  //   if (signUp.status === "complete") {
  //     await signUp.finalize({
  //       navigate: ({ session, decorateUrl }) => {
  //         if (session?.currentTask) {
  //           console.log(session?.currentTask);
  //           return;
  //         }

  //         posthog.identify(emailAddress, {
  //           $set: { email: emailAddress },
  //           $set_once: { sign_up_date: new Date().toISOString() },
  //         });
  //         posthog.capture("user_signed_up", { email: emailAddress });

  //         const url = decorateUrl("/(auth)/user-info");
  //         if (url.startsWith("http")) {
  //           // Only use window.location on web platform
  //           if (typeof window !== "undefined" && window.location) {
  //             window.location.href = url;
  //           } else {
  //             // On native, just use router navigation
  //             router.replace("/(auth)/user-info");
  //           }
  //         } else {
  //           router.replace(url as Href);
  //         }
  //       },
  //     });
  //   } else {
  //     console.error("Sign-up attempt not complete:", signUp);
  //   }
  // };

  const handleVerify = async () => {
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

          router.push("/(auth)/user-info");
        },
      });
    } else {
      // Check why the sign-up is not complete
      console.error("Sign-up attempt not complete:", signUp);
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
      <SafeAreaView className="flex-1">
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
              <View>
                <TouchableOpacity onPress={() => signUp.reset()}>
                  <Text>Go back</Text>
                </TouchableOpacity>
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

                  <Pressable
                    className={`auth-button ${(!code || fetchStatus === "fetching") && "auth-button-disabled"}`}
                    onPress={handleVerify}
                    disabled={!code || fetchStatus === "fetching"}
                  >
                    <Text className="auth-button-text">
                      {fetchStatus === "fetching"
                        ? "Verifying..."
                        : "Verify Email"}
                    </Text>
                  </Pressable>

                  <Pressable
                    className="auth-secondary-button"
                    onPress={() => signUp.verifications.sendEmailCode()}
                    disabled={fetchStatus === "fetching"}
                  >
                    <Text className="auth-secondary-button-text">
                      Resend Code
                    </Text>
                  </Pressable>
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
    <SafeAreaView className="flex-1">
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
                  <TextInput
                    className={`auth-input ${passwordTouched && !passwordValid && "auth-input-error"}`}
                    value={password}
                    placeholder="Create a strong password"
                    placeholderTextColor="rgba(0, 0, 0, 0.4)"
                    secureTextEntry
                    onChangeText={setPassword}
                    onBlur={() => setPasswordTouched(true)}
                    autoComplete="password-new"
                    onSubmitEditing={handleSubmit}
                    style={{
                      paddingHorizontal: s(10),
                      paddingVertical: vs(10),
                    }}
                  />
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

                <Pressable
                  className={`auth-button ${(!formValid || fetchStatus === "fetching") && "auth-button-disabled"}`}
                  onPress={handleSubmit}
                  disabled={!formValid || fetchStatus === "fetching"}
                >
                  <Text className="auth-button-text">
                    {fetchStatus === "fetching"
                      ? "Creating Account..."
                      : "Create Account"}
                  </Text>
                </Pressable>
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

            {/* test */}
            <View className="auth-link-row">
              <Text className="auth-link-copy">Go to get to know you?</Text>
              <Link href="/(auth)/user-info" asChild>
                <Pressable>
                  <Text className="auth-link">Get to know you</Text>
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
