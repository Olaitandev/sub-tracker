import dayjs from "dayjs";

// lib/utils.ts
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  NGN: "₦",
  GHS: "₵",
  KES: "KSh",
  ZAR: "R",
  INR: "₹",
  JPY: "¥",
  CAD: "$",
  AUD: "$",
  XOF: "CFA",
  XAF: "FCFA",
  CNY: "¥",
};

const DEFAULT_CURRENCY = "USD";

export function formatCurrency(
  amount: number | null | undefined,
  currencyCode: string | null | undefined,
): string {
  const safeAmount =
    typeof amount === "number" && !Number.isNaN(amount) ? amount : 0;
  const code = (currencyCode ?? DEFAULT_CURRENCY).toUpperCase();
  const symbol = CURRENCY_SYMBOLS[code];

  const formattedAmount = safeAmount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return symbol ? `${symbol}${formattedAmount}` : `${code} ${formattedAmount}`;
}

export const formatSubscriptionDateTime = (value?: string): string => {
  if (!value) return "Not provided";
  const parsedDate = dayjs(value);
  return parsedDate.isValid()
    ? parsedDate.format("MM/DD/YYYY")
    : "Not provided";
};

export const formatStatusLabel = (value?: string): string => {
  if (!value) return "Unknown";
  return value.charAt(0).toUpperCase() + value.slice(1);
};

export const getInitials = (name?: string) => {
  if (!name) return "?";

  const words = name.trim().split(/\s+/);

  // Single word: first two letters
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  // Multiple words: first letter of each word
  return words
    .map((word) => word[0])
    .join("")
    .toUpperCase();
};
