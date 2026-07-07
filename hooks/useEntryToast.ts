// hooks/useEntryToast.ts
//
// Reads the `entry` param passed via router.replace and:
//   "sign_in"    → shows a welcome back toast
//   "onboarding" → triggers the WelcomeTour (confetti + coach marks)
//
// Returns showTour so the tabs layout can conditionally render <WelcomeTour>.

import { useToast } from "@/components/ui/NotificationService";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";

export function useEntryToast() {
  const { entry } = useLocalSearchParams<{ entry?: string }>();
  const router = useRouter();
  const { showSuccess, showInfo, showWarning, showError } = useToast();
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    if (!entry) return;

    // Clear param immediately so it doesn't re-fire on tab switches.
    router.setParams({ entry: undefined });

    switch (entry) {
      case "sign_up":
        showInfo(
          "Sign up Successful!",
          "Lets get to know abit about you.",
          300,
        );
        break;
      case "sign_in":
        showInfo("Welcome back!", "Good to see you again.", 300);
        break;
      case "complete_onboarding":
        showInfo(
          "Please complete your profile",
          "Lets get to know abit about you.",
          300,
        );
        break;
      case "onboarding":
        // Small delay so the tabs UI finishes mounting before tour starts.
        setTimeout(() => setShowTour(true), 400);
        break;
    }
  }, [entry]);

  const onTourDone = () => setShowTour(false);

  return { showTour, onTourDone };
}
