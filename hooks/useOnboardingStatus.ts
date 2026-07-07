// hooks/useOnboardingStatus.ts
//
// Two exports:
//
// 1. checkOnboardingStatus(userId, getToken) — plain async function.
//    Used by sign-in.tsx immediately after auth completes to decide where
//    to navigate without going through index.tsx. Single source of truth.
//
// 2. useOnboardingStatus() — hook for index.tsx (app open routing).
//    Returns "loading" | "incomplete" | "complete".
//
// Cache strategy: SecureStore keyed by userId so multiple accounts on the
// same device never bleed into each other. Network hit happens exactly once
// per user per device — after that, SecureStore returns immediately.
//
// Android note: Clerk's getToken() can return null briefly after isLoaded
// and isSignedIn are both true. We retry up to TOKEN_RETRY_ATTEMPTS times
// with TOKEN_RETRY_DELAY_MS between each attempt before giving up.

import { useAuth } from "@clerk/expo";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;

// How long to wait between getToken() retry attempts (ms).
const TOKEN_RETRY_DELAY_MS = 300;
// How many times to retry before giving up and returning "incomplete".
const TOKEN_RETRY_ATTEMPTS = 5;

export function getCacheKey(userId: string): string {
  return `subtrack_onboarding_${userId}`;
}

// Waits for Clerk's token to be non-null, retrying up to TOKEN_RETRY_ATTEMPTS.
// Needed on Android where getToken() returns null briefly after isLoaded.
async function getTokenWithRetry(
  getToken: () => Promise<string | null>,
): Promise<string | null> {
  for (let attempt = 0; attempt < TOKEN_RETRY_ATTEMPTS; attempt++) {
    const token = await getToken();
    if (token !== null) return token;
    // Token not ready yet — wait before retrying.
    await new Promise((resolve) => setTimeout(resolve, TOKEN_RETRY_DELAY_MS));
  }
  return null;
}

// Core check — plain async function, usable anywhere (hooks or event handlers).
export async function checkOnboardingStatus(
  userId: string,
  getToken: () => Promise<string | null>,
): Promise<"incomplete" | "complete"> {
  // console.log("[OnboardingCheck] Starting check for userId:", userId);

  // 1. SecureStore
  try {
    const cached = await SecureStore.getItemAsync(getCacheKey(userId));
    // console.log("[OnboardingCheck] SecureStore value:", cached);
    if (cached === "true") return "complete";
  } catch (e) {
    // console.log("[OnboardingCheck] SecureStore error:", e);
  }

  // 2. Network
  try {
    const token = await getTokenWithRetry(getToken);
    // console.log(
    //   "[OnboardingCheck] Token result:",
    //   token ? "got token" : "null after retries",
    // );

    if (token === null) return "incomplete";

    const url = `${SUPABASE_URL}/functions/v1/get-user-onboarding-status`;
    // console.log("[OnboardingCheck] Fetching:", url);

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // console.log("[OnboardingCheck] Response status:", res.status);

    if (!res.ok) return "incomplete";

    const body = await res.json();
    // console.log("[OnboardingCheck] Response body:", body);

    if (body.onboardingComplete) {
      await SecureStore.setItemAsync(getCacheKey(userId), "true");
      return "complete";
    }

    return "incomplete";
  } catch (e) {
    // console.log("[OnboardingCheck] Network error:", e);
    return "incomplete";
  }
}

// Write to cache after onboarding form submits successfully.
// Called from user-info.tsx right before router.replace("/(tabs)").
export async function markOnboardingComplete(userId: string): Promise<void> {
  await SecureStore.setItemAsync(getCacheKey(userId), "true");
}

// Hook for index.tsx — runs on app open when user is already signed in.
type OnboardingStatus = "loading" | "incomplete" | "complete";

export function useOnboardingStatus(): OnboardingStatus {
  const { isLoaded, isSignedIn, userId, getToken } = useAuth();
  const [status, setStatus] = useState<OnboardingStatus>("loading");

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn || !userId) {
      // Not signed in — index.tsx handles redirect to sign-in.
      setStatus("incomplete");
      return;
    }

    checkOnboardingStatus(userId, getToken).then(setStatus);
  }, [isLoaded, isSignedIn, userId]);

  return status;
}
