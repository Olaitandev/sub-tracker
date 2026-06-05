# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the Recurrly subscription tracker app. Here is a summary of all changes made:

- **Installed** `posthog-react-native` and `react-native-svg` (required peer dependency).
- **Created** `app.config.js` to replace `app.json`, exposing PostHog config via `expo-constants` extras so the token and host are read from environment variables at build time.
- **Created** `src/config/posthog.ts` with the PostHog client instance configured with batching, lifecycle event capture, and feature flag preloading.
- **Updated** `app/_layout.tsx` to wrap the app in `PostHogProvider` (with autocapture enabled for touch events) and added manual screen tracking using `usePathname` from Expo Router.
- **Updated** `app/(auth)/sign-in.tsx` to identify users on successful sign-in and capture sign-in success/failure events.
- **Updated** `app/(auth)/sign-up.tsx` to identify users on successful sign-up and capture sign-up success/failure events.
- **Updated** `app/(tabs)/settings.tsx` to capture a `user_signed_out` event and call `posthog.reset()` on logout.
- **Updated** `app/(tabs)/index.tsx` to capture a `subscription_expanded` event with subscription metadata when the user taps a subscription card to expand it.

| Event | Description | File |
|---|---|---|
| `user_signed_up` | Fired when a new user completes email verification and finishes sign-up | `app/(auth)/sign-up.tsx` |
| `user_sign_up_failed` | Fired when sign-up fails due to an API or validation error | `app/(auth)/sign-up.tsx` |
| `user_signed_in` | Fired when an existing user successfully signs in | `app/(auth)/sign-in.tsx` |
| `user_sign_in_failed` | Fired when sign-in fails due to incorrect credentials or an API error | `app/(auth)/sign-in.tsx` |
| `user_signed_out` | Fired when the user taps the logout button in the settings screen | `app/(tabs)/settings.tsx` |
| `subscription_expanded` | Fired when the user taps a subscription card to view its full details | `app/(tabs)/index.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics (wizard) — Dashboard](https://us.posthog.com/project/454995/dashboard/1671797)
- [Sign-ups over time](https://us.posthog.com/project/454995/insights/wJkdgFOU)
- [Sign-ins over time](https://us.posthog.com/project/454995/insights/f6rDtP0S)
- [Authentication failures](https://us.posthog.com/project/454995/insights/VzY1CNIR)
- [Subscription engagement](https://us.posthog.com/project/454995/insights/L8IGhETe)
- [Sign-up to sign-in funnel](https://us.posthog.com/project/454995/insights/rvqTLasX)

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.
