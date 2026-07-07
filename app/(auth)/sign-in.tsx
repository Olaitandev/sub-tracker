import { checkOnboardingStatus } from "@/hooks/useOnboardingStatus";
import { useSignIn } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Eye, EyeOff } from "lucide-react-native";
import { styled } from "nativewind";
import { usePostHog } from "posthog-react-native";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { s, vs } from "react-native-size-matters";
import CustomButton from "../../components/ui/CustomButton";

const SafeAreaView = styled(RNSafeAreaView);

const SignIn = () => {
  const { signIn, errors, fetchStatus } = useSignIn();

  const router = useRouter();
  const posthog = usePostHog();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const emailValid =
    emailAddress.length === 0 ||
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress);
  const passwordValid = password.length > 0;
  const formValid =
    emailAddress.length > 0 && password.length > 0 && emailValid;

  // Called after Clerk confirms sign-in is complete.
  // Checks SecureStore first (instant for returning users), falls back to
  // network once if needed. Never goes through index.tsx — no splash replay.
  const onSignInComplete = async (
    sessionUserId: string,
    sessionGetToken: () => Promise<string | null>,
  ) => {
    posthog.identify(emailAddress, {
      $set: { email: emailAddress },
      $set_once: { first_sign_in_date: new Date().toISOString() },
    });
    posthog.capture("user_signed_in", { email: emailAddress });

    const status = await checkOnboardingStatus(sessionUserId, sessionGetToken);

    if (status === "complete") {
      router.replace({ pathname: "/(tabs)", params: { entry: "sign_in" } });
    } else {
      router.replace("/(auth)/user-info");
    }
  };

  const handleSubmit = async () => {
    if (!formValid) return;
    setLoading(true);

    const { error } = await signIn.password({ emailAddress, password });

    if (error) {
      console.error(JSON.stringify(error, null, 2));
      setLoading(false);
      posthog.capture("user_sign_in_failed", { error_message: error.message });
      return;
    }

    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: async ({ session }) => {
          if (!session || session.currentTask) return;
          await onSignInComplete(
            session!.user.id,
            session!.getToken.bind(session),
          );
        },
      });
    } else if (signIn.status === "needs_client_trust") {
      const emailCodeFactor = signIn.supportedSecondFactors.find(
        (f) => f.strategy === "email_code",
      );
      if (emailCodeFactor) await signIn.mfa.sendEmailCode();
    } else {
      console.error("Sign-in attempt not complete:", signIn);
    }

    setLoading(false);
  };

  const handleVerify = async () => {
    await signIn.mfa.verifyEmailCode({ code });

    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: async ({ session }) => {
          if (session?.currentTask) return;
          await onSignInComplete(
            session!.user.id,
            session!.getToken.bind(session),
          );
        },
      });
    } else {
      console.error("Sign-in verify not complete:", signIn);
    }
  };

  if (signIn.status === "needs_client_trust") {
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
              <View className="auth-brand-block">
                <View className="auth-logo-wrap">
                  <View className="auth-logo-mark">
                    <Text className="auth-logo-mark-text">S</Text>
                  </View>
                </View>
                <Text className="auth-title">Verify your identity</Text>
                <Text className="auth-subtitle">
                  We sent a verification code to your email
                </Text>
              </View>

              <View className="p-5 mt-16 border rounded-3xl border-border">
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
                      {fetchStatus === "fetching" ? "Verifying..." : "Verify"}
                    </Text>
                  </Pressable>

                  <Pressable
                    className="auth-secondary-button"
                    onPress={() => signIn.mfa.sendEmailCode()}
                    disabled={fetchStatus === "fetching"}
                  >
                    <Text className="auth-secondary-button-text">
                      Resend Code
                    </Text>
                  </Pressable>

                  <Pressable
                    className="auth-secondary-button"
                    onPress={() => signIn.reset()}
                    disabled={fetchStatus === "fetching"}
                  >
                    <Text className="auth-secondary-button-text">
                      Start Over
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
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
            <View className="auth-brand-block">
              <View className="auth-logo-wrap">
                <View className="auth-logo-mark">
                  <Text className="auth-logo-mark-text">S</Text>
                </View>
              </View>
              <Text className="auth-title">Welcome back</Text>
              <Text className="auth-subtitle">
                Sign in to continue managing your subscriptions
              </Text>
            </View>

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
                  {errors.fields.identifier && (
                    <Text className="auth-error">
                      {errors.fields.identifier.message}
                    </Text>
                  )}
                </View>

                <View className="auth-field">
                  <Text className="auth-label">Password</Text>
                  <View
                    className={`flex-row items-center border rounded-xl ${
                      passwordTouched && !passwordValid
                        ? "border-destructive"
                        : "border-border"
                    }`}
                  >
                    <TextInput
                      className="flex-1"
                      value={password}
                      placeholder="Enter your password"
                      placeholderTextColor="rgba(0,0,0,0.4)"
                      secureTextEntry={!showPassword}
                      onChangeText={setPassword}
                      onBlur={() => setPasswordTouched(true)}
                      autoComplete="password"
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
                    <Text className="auth-error">Password is required</Text>
                  )}
                  {errors.fields.password && (
                    <Text className="auth-error">
                      {errors.fields.password.message}
                    </Text>
                  )}
                </View>

                <CustomButton
                  text="Sign In"
                  onPress={handleSubmit}
                  loading={loading}
                  disabled={!formValid || fetchStatus === "fetching"}
                />
              </View>
            </View>

            <View className="auth-link-row">
              <Text className="auth-link-copy">Don't have an account?</Text>
              <Link href="/(auth)/sign-up" asChild>
                <Pressable>
                  <Text className="auth-link">Create Account</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignIn;
