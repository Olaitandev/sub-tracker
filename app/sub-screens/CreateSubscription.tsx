import CustomButton from "@/components/ui/CustomButton";
import CustomModal from "@/components/ui/CustomModal";
import { useToast } from "@/components/ui/NotificationService";
import { colors, globalStyles } from "@/constants/theme";
import { useAuth } from "@clerk/expo";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { clsx } from "clsx";
import { router } from "expo-router";
import {
  Bell,
  Bot,
  BriefcaseBusiness,
  Calendar,
  ChevronDown,
  ChevronLeft,
  Cloud,
  CodeXml,
  Dumbbell,
  Gamepad2,
  GlobeLock,
  GraduationCap,
  Home,
  MoreHorizontal,
  Music2,
  Newspaper,
  Search,
  ShoppingBasket,
  Tv,
  WalletCards,
} from "lucide-react-native";
import { styled } from "nativewind";
import { useMemo, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { ms } from "react-native-size-matters";

const SafeAreaView = styled(RNSafeAreaView);

// ─── Types ───────────────────────────────────────────────────────────────────

type Currency = {
  id: string;
  code: string;
  name: string;
  symbol: string;
};

type Category = {
  id: number;
  name: string;
  icon: React.ReactNode;
};

type BrandIcon = {
  id: string;
  name: string;
  color: string;
  initials: string;
  categoryId: number;
};

type BillingCycle =
  | "Weekly"
  | "Monthly"
  | "Quarterly"
  | "Every 6 Months"
  | "Yearly";

type NotificationOption = {
  id: string;
  label: string;
};

// Field-level validation errors
type FormErrors = {
  serviceName?: string;
  amount?: string;
  category?: string;
  notifications?: string;
};

// ─── Data ────────────────────────────────────────────────────────────────────

const CURRENCIES: Currency[] = [
  { id: "1", code: "USD", name: "US Dollar", symbol: "$" },
  { id: "2", code: "EUR", name: "Euro", symbol: "€" },
  { id: "3", code: "GBP", name: "British Pound", symbol: "£" },
  { id: "4", code: "NGN", name: "Nigerian Naira", symbol: "₦" },
  { id: "5", code: "CAD", name: "Canadian Dollar", symbol: "CA$" },
  { id: "6", code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { id: "7", code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { id: "8", code: "CHF", name: "Swiss Franc", symbol: "₣" },
  { id: "9", code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { id: "10", code: "INR", name: "Indian Rupee", symbol: "₹" },
  { id: "11", code: "BRL", name: "Brazilian Real", symbol: "R$" },
  { id: "12", code: "ZAR", name: "South African Rand", symbol: "R" },
  { id: "13", code: "AED", name: "UAE Dirham", symbol: "د.إ" },
  { id: "14", code: "SGD", name: "Singapore Dollar", symbol: "S$" },
  { id: "15", code: "MXN", name: "Mexican Peso", symbol: "MX$" },
];

const ICON_SIZE = ms(20);

const CATEGORIES: Category[] = [
  {
    id: 1,
    name: "Entertainment",
    icon: <Tv size={ICON_SIZE} color={colors.gray} />,
  },
  {
    id: 2,
    name: "Music",
    icon: <Music2 size={ICON_SIZE} color={colors.gray} />,
  },
  {
    id: 3,
    name: "Gaming",
    icon: <Gamepad2 size={ICON_SIZE} color={colors.gray} />,
  },
  {
    id: 4,
    name: "Cloud & Storage",
    icon: <Cloud size={ICON_SIZE} color={colors.gray} />,
  },
  {
    id: 5,
    name: "AI Tools",
    icon: <Bot size={ICON_SIZE} color={colors.gray} />,
  },
  {
    id: 6,
    name: "Productivity",
    icon: <BriefcaseBusiness size={ICON_SIZE} color={colors.gray} />,
  },
  {
    id: 7,
    name: "Developer Tools",
    icon: <CodeXml size={ICON_SIZE} color={colors.gray} />,
  },
  {
    id: 8,
    name: "Fitness & Health",
    icon: <Dumbbell size={ICON_SIZE} color={colors.gray} />,
  },
  {
    id: 9,
    name: "Finance",
    icon: <WalletCards size={ICON_SIZE} color={colors.gray} />,
  },
  {
    id: 10,
    name: "Utilities",
    icon: <Home size={ICON_SIZE} color={colors.gray} />,
  },
  {
    id: 11,
    name: "Education",
    icon: <GraduationCap size={ICON_SIZE} color={colors.gray} />,
  },
  {
    id: 12,
    name: "News & Reading",
    icon: <Newspaper size={ICON_SIZE} color={colors.gray} />,
  },
  {
    id: 13,
    name: "Security & VPN",
    icon: <GlobeLock size={ICON_SIZE} color={colors.gray} />,
  },
  {
    id: 14,
    name: "Shopping",
    icon: <ShoppingBasket size={ICON_SIZE} color={colors.gray} />,
  },
  {
    id: 15,
    name: "Others",
    icon: <MoreHorizontal size={ICON_SIZE} color={colors.gray} />,
  },
];

const BRAND_ICONS: BrandIcon[] = [
  // ── Entertainment (1)
  {
    id: "netflix",
    name: "Netflix",
    color: "#E50914",
    initials: "N",
    categoryId: 1,
  },
  {
    id: "disneyplus",
    name: "Disney+",
    color: "#113CCF",
    initials: "D+",
    categoryId: 1,
  },
  { id: "max", name: "Max", color: "#002BE7", initials: "Max", categoryId: 1 },
  {
    id: "primevideo",
    name: "Prime Video",
    color: "#00A8E0",
    initials: "PV",
    categoryId: 1,
  },
  {
    id: "appletv",
    name: "Apple TV+",
    color: "#000000",
    initials: "TV",
    categoryId: 1,
  },
  {
    id: "crunchyroll",
    name: "Crunchyroll",
    color: "#F47521",
    initials: "CR",
    categoryId: 1,
  },
  { id: "hulu", name: "Hulu", color: "#1CE783", initials: "H", categoryId: 1 },
  {
    id: "paramount",
    name: "Paramount+",
    color: "#0064FF",
    initials: "P+",
    categoryId: 1,
  },
  {
    id: "peacock",
    name: "Peacock",
    color: "#000000",
    initials: "PC",
    categoryId: 1,
  },
  { id: "mubi", name: "MUBI", color: "#fff", initials: "MB", categoryId: 1 },
  {
    id: "curiosity",
    name: "Curiosity Stream",
    color: "#13A4DB",
    initials: "CS",
    categoryId: 1,
  },
  { id: "dazn", name: "DAZN", color: "#000000", initials: "DZ", categoryId: 1 },
  {
    id: "skyshowtime",
    name: "SkyShowtime",
    color: "#762AE8",
    initials: "SS",
    categoryId: 1,
  },
  // ── Music (2)
  {
    id: "spotify",
    name: "Spotify",
    color: "#1DB954",
    initials: "S",
    categoryId: 2,
  },
  {
    id: "applemusic",
    name: "Apple Music",
    color: "#FA243C",
    initials: "♪",
    categoryId: 2,
  },
  {
    id: "youtubemusic",
    name: "YouTube Music",
    color: "#FF0000",
    initials: "YM",
    categoryId: 2,
  },
  {
    id: "deezer",
    name: "Deezer",
    color: "#A238FF",
    initials: "Dz",
    categoryId: 2,
  },
  {
    id: "tidal",
    name: "Tidal",
    color: "#000000",
    initials: "Ti",
    categoryId: 2,
  },
  {
    id: "amazonmusic",
    name: "Amazon Music",
    color: "#00A8E0",
    initials: "AM",
    categoryId: 2,
  },
  {
    id: "soundcloud",
    name: "SoundCloud",
    color: "#FF5500",
    initials: "SC",
    categoryId: 2,
  },
  {
    id: "pandora",
    name: "Pandora",
    color: "#3668FF",
    initials: "Pa",
    categoryId: 2,
  },
  // ── Gaming (3)
  {
    id: "xboxgamepass",
    name: "Xbox Game Pass",
    color: "#107C10",
    initials: "XGP",
    categoryId: 3,
  },
  {
    id: "psnow",
    name: "PS Plus",
    color: "#003791",
    initials: "PS",
    categoryId: 3,
  },
  {
    id: "nintendoso",
    name: "Nintendo Online",
    color: "#E60012",
    initials: "NS",
    categoryId: 3,
  },
  {
    id: "steam",
    name: "Steam",
    color: "#1B2838",
    initials: "St",
    categoryId: 3,
  },
  {
    id: "eaplay",
    name: "EA Play",
    color: "#F4A900",
    initials: "EA",
    categoryId: 3,
  },
  {
    id: "ubisoft",
    name: "Ubisoft+",
    color: "#0070FF",
    initials: "Ub",
    categoryId: 3,
  },
  {
    id: "roblox",
    name: "Roblox Premium",
    color: "#E8192C",
    initials: "Ro",
    categoryId: 3,
  },
  // ── AI Tools (5)
  {
    id: "chatgpt",
    name: "ChatGPT",
    color: "#10A37F",
    initials: "GPT",
    categoryId: 5,
  },
  {
    id: "claude",
    name: "Claude",
    color: "#D97757",
    initials: "Cl",
    categoryId: 5,
  },
  {
    id: "perplexity",
    name: "Perplexity",
    color: "#20808D",
    initials: "Px",
    categoryId: 5,
  },
  {
    id: "midjourney",
    name: "Midjourney",
    color: "#000000",
    initials: "MJ",
    categoryId: 5,
  },
  {
    id: "cursor",
    name: "Cursor",
    color: "#000000",
    initials: "Cu",
    categoryId: 5,
  },
  {
    id: "copilot",
    name: "GitHub Copilot",
    color: "#181717",
    initials: "Co",
    categoryId: 5,
  },
  {
    id: "gemini",
    name: "Gemini",
    color: "#4285F4",
    initials: "Ge",
    categoryId: 5,
  },
  { id: "grok", name: "Grok", color: "#000000", initials: "Gr", categoryId: 5 },
  {
    id: "runway",
    name: "Runway",
    color: "#000000",
    initials: "Rw",
    categoryId: 5,
  },
  {
    id: "elevenlabs",
    name: "ElevenLabs",
    color: "#000000",
    initials: "EL",
    categoryId: 5,
  },
  {
    id: "jasper",
    name: "Jasper AI",
    color: "#FF4F00",
    initials: "Ja",
    categoryId: 5,
  },
  {
    id: "writesonic",
    name: "Writesonic",
    color: "#7C3AED",
    initials: "Ws",
    categoryId: 5,
  },
  // ── Productivity (6)
  {
    id: "notion",
    name: "Notion",
    color: "#000000",
    initials: "No",
    categoryId: 6,
  },
  {
    id: "slack",
    name: "Slack",
    color: "#4A154B",
    initials: "Sl",
    categoryId: 6,
  },
  { id: "zoom", name: "Zoom", color: "#2D8CFF", initials: "Zo", categoryId: 6 },
  {
    id: "trello",
    name: "Trello",
    color: "#0052CC",
    initials: "Tr",
    categoryId: 6,
  },
  {
    id: "clickup",
    name: "ClickUp",
    color: "#7B68EE",
    initials: "CU",
    categoryId: 6,
  },
  { id: "jira", name: "Jira", color: "#0052CC", initials: "Ji", categoryId: 6 },
  {
    id: "microsoft365",
    name: "Microsoft 365",
    color: "#D83B01",
    initials: "M",
    categoryId: 6,
  },
  {
    id: "grammarly",
    name: "Grammarly",
    color: "#15C39A",
    initials: "Gr",
    categoryId: 6,
  },
  {
    id: "monday",
    name: "Monday.com",
    color: "#FF3D57",
    initials: "Mo",
    categoryId: 6,
  },
  {
    id: "airtable",
    name: "Airtable",
    color: "#FCB400",
    initials: "At",
    categoryId: 6,
  },
  {
    id: "asana",
    name: "Asana",
    color: "#F06A6A",
    initials: "As",
    categoryId: 6,
  },
  {
    id: "linear",
    name: "Linear",
    color: "#5E6AD2",
    initials: "Li",
    categoryId: 6,
  },
  {
    id: "figma",
    name: "Figma",
    color: "#F24E1E",
    initials: "Fi",
    categoryId: 6,
  },
  {
    id: "adobe",
    name: "Adobe CC",
    color: "#FF0000",
    initials: "Ai",
    categoryId: 6,
  },
  {
    id: "canva",
    name: "Canva",
    color: "#00C4CC",
    initials: "Ca",
    categoryId: 6,
  },
  { id: "miro", name: "Miro", color: "#FFD02F", initials: "Mi", categoryId: 6 },
  { id: "loom", name: "Loom", color: "#625DF5", initials: "Lo", categoryId: 6 },
  // ── Developer Tools (7)
  {
    id: "github",
    name: "GitHub",
    color: "#181717",
    initials: "GH",
    categoryId: 7,
  },
  {
    id: "vercel",
    name: "Vercel",
    color: "#000000",
    initials: "▲",
    categoryId: 7,
  },
  {
    id: "railway",
    name: "Railway",
    color: "#0B0D0E",
    initials: "Ry",
    categoryId: 7,
  },
  {
    id: "render",
    name: "Render",
    color: "#46E3B7",
    initials: "Re",
    categoryId: 7,
  },
  {
    id: "supabase",
    name: "Supabase",
    color: "#3ECF8E",
    initials: "Sb",
    categoryId: 7,
  },
  {
    id: "digitalocean",
    name: "DigitalOcean",
    color: "#0080FF",
    initials: "DO",
    categoryId: 7,
  },
  { id: "aws", name: "AWS", color: "#FF9900", initials: "AWS", categoryId: 7 },
  {
    id: "cloudflare",
    name: "Cloudflare",
    color: "#F38020",
    initials: "CF",
    categoryId: 7,
  },
  {
    id: "netlify",
    name: "Netlify",
    color: "#00C7B7",
    initials: "Ne",
    categoryId: 7,
  },
  {
    id: "heroku",
    name: "Heroku",
    color: "#430098",
    initials: "He",
    categoryId: 7,
  },
  {
    id: "sentry",
    name: "Sentry",
    color: "#362D59",
    initials: "Se",
    categoryId: 7,
  },
  {
    id: "datadog",
    name: "Datadog",
    color: "#632CA6",
    initials: "DD",
    categoryId: 7,
  },
  {
    id: "postman",
    name: "Postman",
    color: "#FF6C37",
    initials: "Pm",
    categoryId: 7,
  },
  // ── Cloud & Storage (4)
  {
    id: "googleone",
    name: "Google One",
    color: "#4285F4",
    initials: "G1",
    categoryId: 4,
  },
  {
    id: "dropbox",
    name: "Dropbox",
    color: "#0061FF",
    initials: "Db",
    categoryId: 4,
  },
  {
    id: "icloud",
    name: "iCloud",
    color: "#3693F3",
    initials: "iC",
    categoryId: 4,
  },
  {
    id: "onedrive",
    name: "OneDrive",
    color: "#0078D4",
    initials: "OD",
    categoryId: 4,
  },
  {
    id: "backblaze",
    name: "Backblaze",
    color: "#E02020",
    initials: "BB",
    categoryId: 4,
  },
  { id: "box", name: "Box", color: "#0061D5", initials: "Bx", categoryId: 4 },
  {
    id: "gsuite",
    name: "Google Workspace",
    color: "#4285F4",
    initials: "GW",
    categoryId: 4,
  },
  // ── Finance (9)
  {
    id: "revolut",
    name: "Revolut Premium",
    color: "#191C1F",
    initials: "Rv",
    categoryId: 9,
  },
  {
    id: "monzo",
    name: "Monzo",
    color: "#FF3464",
    initials: "Mn",
    categoryId: 9,
  },
  { id: "ynab", name: "YNAB", color: "#77AC3F", initials: "YN", categoryId: 9 },
  {
    id: "quickbooks",
    name: "QuickBooks",
    color: "#2CA01C",
    initials: "QB",
    categoryId: 9,
  },
  { id: "mint", name: "Mint", color: "#1EB980", initials: "Mi", categoryId: 9 },
  {
    id: "expensify",
    name: "Expensify",
    color: "#0185FF",
    initials: "Ex",
    categoryId: 9,
  },
  // ── Fitness & Health (8)
  {
    id: "peloton",
    name: "Peloton",
    color: "#D62B2B",
    initials: "Pe",
    categoryId: 8,
  },
  {
    id: "strava",
    name: "Strava",
    color: "#FC4C02",
    initials: "St",
    categoryId: 8,
  },
  {
    id: "fitbit",
    name: "Fitbit Premium",
    color: "#00B0B9",
    initials: "Fb",
    categoryId: 8,
  },
  {
    id: "headspace",
    name: "Headspace",
    color: "#F47D31",
    initials: "Hs",
    categoryId: 8,
  },
  { id: "calm", name: "Calm", color: "#4A90E2", initials: "Cm", categoryId: 8 },
  { id: "noom", name: "Noom", color: "#6DB33F", initials: "No", categoryId: 8 },
  {
    id: "myfitnesspal",
    name: "MyFitnessPal",
    color: "#0071CE",
    initials: "MF",
    categoryId: 8,
  },
  {
    id: "whoop",
    name: "Whoop",
    color: "#000000",
    initials: "Wh",
    categoryId: 8,
  },
  // ── Education (11)
  {
    id: "duolingo",
    name: "Duolingo",
    color: "#58CC02",
    initials: "Du",
    categoryId: 11,
  },
  {
    id: "coursera",
    name: "Coursera",
    color: "#0056D2",
    initials: "Co",
    categoryId: 11,
  },
  {
    id: "skillshare",
    name: "Skillshare",
    color: "#00CC76",
    initials: "Sk",
    categoryId: 11,
  },
  {
    id: "udemy",
    name: "Udemy",
    color: "#A435F0",
    initials: "Ud",
    categoryId: 11,
  },
  {
    id: "masterclass",
    name: "MasterClass",
    color: "#000000",
    initials: "MC",
    categoryId: 11,
  },
  {
    id: "brilliant",
    name: "Brilliant",
    color: "#F5821F",
    initials: "Br",
    categoryId: 11,
  },
  {
    id: "linkedin",
    name: "LinkedIn Learning",
    color: "#0A66C2",
    initials: "LL",
    categoryId: 11,
  },
  // ── News & Reading (12)
  {
    id: "nytimes",
    name: "NY Times",
    color: "#000000",
    initials: "NYT",
    categoryId: 12,
  },
  {
    id: "wsj",
    name: "Wall Street Journal",
    color: "#004276",
    initials: "WSJ",
    categoryId: 12,
  },
  {
    id: "medium",
    name: "Medium",
    color: "#000000",
    initials: "Me",
    categoryId: 12,
  },
  {
    id: "substack",
    name: "Substack",
    color: "#FF681A",
    initials: "Sub",
    categoryId: 12,
  },
  {
    id: "audible",
    name: "Audible",
    color: "#F8991D",
    initials: "Au",
    categoryId: 12,
  },
  {
    id: "kindle",
    name: "Kindle Unlimited",
    color: "#FF9900",
    initials: "KU",
    categoryId: 12,
  },
  {
    id: "economist",
    name: "The Economist",
    color: "#E3120B",
    initials: "Ec",
    categoryId: 12,
  },
  {
    id: "guardian",
    name: "The Guardian",
    color: "#052962",
    initials: "Gu",
    categoryId: 12,
  },
  {
    id: "readwise",
    name: "Readwise",
    color: "#003EFF",
    initials: "Rw",
    categoryId: 12,
  },
  // ── Security & VPN (13)
  {
    id: "nordvpn",
    name: "NordVPN",
    color: "#4687FF",
    initials: "NV",
    categoryId: 13,
  },
  {
    id: "expressvpn",
    name: "ExpressVPN",
    color: "#DA3940",
    initials: "EV",
    categoryId: 13,
  },
  {
    id: "surfshark",
    name: "Surfshark",
    color: "#1B9B77",
    initials: "SS",
    categoryId: 13,
  },
  {
    id: "onepassword",
    name: "1Password",
    color: "#0094F5",
    initials: "1P",
    categoryId: 13,
  },
  {
    id: "lastpass",
    name: "LastPass",
    color: "#CC0000",
    initials: "LP",
    categoryId: 13,
  },
  {
    id: "bitwarden",
    name: "Bitwarden",
    color: "#175DDC",
    initials: "Bw",
    categoryId: 13,
  },
  // ── Utilities (10)
  {
    id: "electric",
    name: "Electricity",
    color: "#F5A623",
    initials: "⚡",
    categoryId: 10,
  },
  {
    id: "water",
    name: "Water",
    color: "#50C8F4",
    initials: "💧",
    categoryId: 10,
  },
  { id: "gas", name: "Gas", color: "#FF6B35", initials: "Gas", categoryId: 10 },
  {
    id: "internet",
    name: "Internet",
    color: "#34C759",
    initials: "Net",
    categoryId: 10,
  },
  {
    id: "mobileplan",
    name: "Mobile Plan",
    color: "#8E8E93",
    initials: "📱",
    categoryId: 10,
  },
  {
    id: "rent",
    name: "Rent",
    color: "#5856D6",
    initials: "Rnt",
    categoryId: 10,
  },
  {
    id: "insurance",
    name: "Insurance",
    color: "#007AFF",
    initials: "Ins",
    categoryId: 10,
  },
  { id: "gym", name: "Gym", color: "#FF3B30", initials: "Gym", categoryId: 10 },
  // ── Others (15)
  {
    id: "other",
    name: "Other",
    color: "#8E8E93",
    initials: "?",
    categoryId: 15,
  },
];

const BRAND_ICON_IMAGES: Partial<Record<string, ReturnType<typeof require>>> = {
  netflix: require("@/assets/brand-icons/netflix.png"),
  disneyplus: require("@/assets/brand-icons/disney-plus.png"),
  max: require("@/assets/brand-icons/max.png"),
  primevideo: require("@/assets/brand-icons/prime-video.png"),
  appletv: require("@/assets/brand-icons/apple-tv.png"),
  crunchyroll: require("@/assets/brand-icons/crunchyroll.png"),
  hulu: require("@/assets/brand-icons/hulu.png"),
  paramount: require("@/assets/brand-icons/paramount.png"),
  peacock: require("@/assets/brand-icons/peacock.png"),
  mubi: require("@/assets/brand-icons/mubi.png"),
  curiosity: require("@/assets/brand-icons/curiosity.png"),
  dazn: require("@/assets/brand-icons/dazn.png"),
  skyshowtime: require("@/assets/brand-icons/skyshowtime.png"),
  spotify: require("@/assets/brand-icons/spotify.png"),
  applemusic: require("@/assets/brand-icons/music.png"),
  youtubemusic: require("@/assets/brand-icons/youtube-music.png"),
  deezer: require("@/assets/brand-icons/deezer.png"),
  tidal: require("@/assets/brand-icons/tidal.png"),
  amazonmusic: require("@/assets/brand-icons/amazon-music.png"),
  soundcloud: require("@/assets/brand-icons/soundcloud.png"),
  pandora: require("@/assets/brand-icons/pandora.png"),
  xboxgamepass: require("@/assets/brand-icons/xboxgamepass.png"),
  psnow: require("@/assets/brand-icons/psnow.png"),
  nintendoso: require("@/assets/brand-icons/nintendo.png"),
  steam: require("@/assets/brand-icons/steam.png"),
  eaplay: require("@/assets/brand-icons/ea.png"),
  ubisoft: require("@/assets/brand-icons/ubisoft.png"),
  roblox: require("@/assets/brand-icons/roblox.png"),
  chatgpt: require("@/assets/brand-icons/chatgpt.png"),
  claude: require("@/assets/brand-icons/claude.png"),
  perplexity: require("@/assets/brand-icons/perplexity.png"),
  midjourney: require("@/assets/brand-icons/midjourney.png"),
  cursor: require("@/assets/brand-icons/cursor.png"),
  copilot: require("@/assets/brand-icons/copilot.png"),
  gemini: require("@/assets/brand-icons/gemini.png"),
  grok: require("@/assets/brand-icons/grok.png"),
  elevenlabs: require("@/assets/brand-icons/elevenlabs.png"),
  notion: require("@/assets/brand-icons/notion.png"),
  slack: require("@/assets/brand-icons/slack.png"),
  zoom: require("@/assets/brand-icons/zoom.png"),
  trello: require("@/assets/brand-icons/trello.png"),
  clickup: require("@/assets/brand-icons/clickup.png"),
  jira: require("@/assets/brand-icons/jira.png"),
  microsoft365: require("@/assets/brand-icons/microsoft365.png"),
  grammarly: require("@/assets/brand-icons/grammarly.png"),
  monday: require("@/assets/brand-icons/monday.png"),
  airtable: require("@/assets/brand-icons/airtable.png"),
  asana: require("@/assets/brand-icons/asana.png"),
  linear: require("@/assets/brand-icons/linear.png"),
  figma: require("@/assets/brand-icons/figma.png"),
  adobe: require("@/assets/brand-icons/adobe.png"),
  canva: require("@/assets/brand-icons/canva.png"),
  miro: require("@/assets/brand-icons/miro.png"),
  loom: require("@/assets/brand-icons/loom.png"),
  github: require("@/assets/brand-icons/github.png"),
  vercel: require("@/assets/brand-icons/vercel.png"),
  railway: require("@/assets/brand-icons/railway.png"),
  render: require("@/assets/brand-icons/render.png"),
  supabase: require("@/assets/brand-icons/supabase.png"),
  digitalocean: require("@/assets/brand-icons/digitalocean.png"),
  aws: require("@/assets/brand-icons/aws.png"),
  cloudflare: require("@/assets/brand-icons/cloudflare.png"),
  netlify: require("@/assets/brand-icons/netlify.png"),
  heroku: require("@/assets/brand-icons/heroku.png"),
  sentry: require("@/assets/brand-icons/sentry.png"),
  datadog: require("@/assets/brand-icons/datadog.png"),
  postman: require("@/assets/brand-icons/postman.png"),
  googleone: require("@/assets/brand-icons/google-one.png"),
  dropbox: require("@/assets/brand-icons/dropbox.png"),
  icloud: require("@/assets/brand-icons/icloud.png"),
  onedrive: require("@/assets/brand-icons/onedrive.png"),
  backblaze: require("@/assets/brand-icons/backblaze.png"),
  // box: require("@/assets/brand-icons/box.png"),
  // gsuite: require("@/assets/brand-icons/google-workspace.png"),
  revolut: require("@/assets/brand-icons/revolut.png"),
  monzo: require("@/assets/brand-icons/monzo.png"),
  ynab: require("@/assets/brand-icons/ynab.png"),
  quickbooks: require("@/assets/brand-icons/quickbooks.png"),
  mint: require("@/assets/brand-icons/mint.png"),
  expensify: require("@/assets/brand-icons/expensify.png"),
  peloton: require("@/assets/brand-icons/peloton.png"),
  strava: require("@/assets/brand-icons/strava.png"),
  fitbit: require("@/assets/brand-icons/fitbit.png"),
  headspace: require("@/assets/brand-icons/headspace.png"),
  calm: require("@/assets/brand-icons/calm.png"),
  // noom: require("@/assets/brand-icons/noom.png"),
  myfitnesspal: require("@/assets/brand-icons/myfitnesspal.png"),
  whoop: require("@/assets/brand-icons/whoop.png"),
  duolingo: require("@/assets/brand-icons/duolingo.png"),
  coursera: require("@/assets/brand-icons/coursera.png"),
  skillshare: require("@/assets/brand-icons/skillshare.png"),
  udemy: require("@/assets/brand-icons/udemy.png"),
  // masterclass: require("@/assets/brand-icons/masterclass.png"),
  brilliant: require("@/assets/brand-icons/brilliant.png"),
  linkedin: require("@/assets/brand-icons/linkedin.png"),
  nytimes: require("@/assets/brand-icons/nytimes.png"),
  // wsj: require("@/assets/brand-icons/wsj.png"),
  medium: require("@/assets/brand-icons/medium.png"),
  substack: require("@/assets/brand-icons/substack.png"),
  audible: require("@/assets/brand-icons/audible.png"),
  kindle: require("@/assets/brand-icons/kindle.png"),
  economist: require("@/assets/brand-icons/economist.png"),
  guardian: require("@/assets/brand-icons/guardian.png"),
  readwise: require("@/assets/brand-icons/readwise.png"),
  nordvpn: require("@/assets/brand-icons/nordvpn.png"),
  expressvpn: require("@/assets/brand-icons/expressvpn.png"),
  surfshark: require("@/assets/brand-icons/surfshark.png"),
  onepassword: require("@/assets/brand-icons/1password.png"),
  lastpass: require("@/assets/brand-icons/lastpass.png"),
  bitwarden: require("@/assets/brand-icons/bitwarden.png"),
  electric: require("@/assets/brand-icons/electricity.png"),
  water: require("@/assets/brand-icons/water.png"),
  gas: require("@/assets/brand-icons/gas.png"),
  internet: require("@/assets/brand-icons/internet.png"),
  // mobileplan: require("@/assets/brand-icons/mobileplan.png"),
  rent: require("@/assets/brand-icons/rent.png"),
  insurance: require("@/assets/brand-icons/insurance.png"),
  gym: require("@/assets/brand-icons/gym.png"),
  other: require("@/assets/brand-icons/other.png"),
};

// ─── Brand tile renderer ──────────────────────────────────────────────────
// Renders the real PNG if one exists in BRAND_ICON_IMAGES, otherwise
// falls back to the initials text on a coloured background.
function BrandTileContent({ icon, size }: { icon: BrandIcon; size: number }) {
  const image = BRAND_ICON_IMAGES[icon.id];

  if (image) {
    return (
      <Image
        source={image}
        style={{ width: size * 0.6, height: size * 0.6 }}
        resizeMode="contain"
      />
    );
  }

  return (
    <Text
      style={{
        color: "#fff",
        fontFamily: "sans-bold",
        fontSize: size * 0.32,
        textAlign: "center",
      }}
    >
      {icon.initials}
    </Text>
  );
}

const BILLING_CYCLES: BillingCycle[] = [
  "Weekly",
  "Monthly",
  "Quarterly",
  "Every 6 Months",
  "Yearly",
];

const VALID_BILLING_CYCLES = new Set(BILLING_CYCLES);
const VALID_CURRENCY_CODES = new Set(CURRENCIES.map((c) => c.code));

const NOTIFICATION_OPTIONS: Record<BillingCycle, NotificationOption[]> = {
  Weekly: [
    { id: "1d", label: "1 day before" },
    { id: "same", label: "Same day" },
  ],
  Monthly: [
    { id: "1d", label: "1 day before" },
    { id: "3d", label: "3 days before" },
    { id: "1w", label: "1 week before" },
    { id: "same", label: "Same day" },
  ],
  Quarterly: [
    { id: "1w", label: "1 week before" },
    { id: "2w", label: "2 weeks before" },
    { id: "same", label: "Same day" },
  ],
  "Every 6 Months": [
    { id: "1w", label: "1 week before" },
    { id: "2w", label: "2 weeks before" },
    { id: "1m", label: "1 month before" },
    { id: "same", label: "Same day" },
  ],
  Yearly: [
    { id: "1w", label: "1 week before" },
    { id: "2w", label: "2 weeks before" },
    { id: "1m", label: "1 month before" },
    { id: "same", label: "Same day" },
  ],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function computeNextRenewal(start: Date, cycle: BillingCycle): Date {
  const next = new Date(start);
  switch (cycle) {
    case "Weekly":
      next.setDate(next.getDate() + 7);
      break;
    case "Monthly":
      next.setMonth(next.getMonth() + 1);
      break;
    case "Quarterly":
      next.setMonth(next.getMonth() + 3);
      break;
    case "Every 6 Months":
      next.setMonth(next.getMonth() + 6);
      break;
    case "Yearly":
      next.setFullYear(next.getFullYear() + 1);
      break;
  }
  return next;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function sanitiseCurrencyInput(raw: string): string {
  let sanitised = raw.replace(/[^0-9.]/g, "");
  const parts = sanitised.split(".");
  if (parts.length > 2) {
    sanitised = parts[0] + "." + parts.slice(1).join("");
  }
  if (parts[1] !== undefined && parts[1].length > 2) {
    sanitised = parts[0] + "." + parts[1].slice(0, 2);
  }
  return sanitised;
}

// Client-side validation — mirrors the Edge Function rules.
// Returns an errors object; empty object means valid.
function validateForm(
  serviceName: string,
  amount: string,
  selectedCategory: number | null,
  selectedNotifications: string[],
): FormErrors {
  const errors: FormErrors = {};

  if (!serviceName.trim()) {
    errors.serviceName = "Service name is required";
  } else if (serviceName.trim().length > 100) {
    errors.serviceName = "Service name must be 100 characters or fewer";
  }

  if (!amount.trim()) {
    errors.amount = "Amount is required";
  } else {
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) {
      errors.amount = "Enter a valid amount greater than 0";
    }
  }

  if (!selectedCategory) {
    errors.category = "Please select a category";
  }

  if (selectedNotifications.length === 0) {
    errors.notifications = "Select at least one reminder";
  }
  return errors;
}

function getCategoryIconActive(id: number) {
  const props = { size: ICON_SIZE, color: colors.accent };
  switch (id) {
    case 1:
      return <Tv {...props} />;
    case 2:
      return <Music2 {...props} />;
    case 3:
      return <Gamepad2 {...props} />;
    case 4:
      return <Cloud {...props} />;
    case 5:
      return <Bot {...props} />;
    case 6:
      return <BriefcaseBusiness {...props} />;
    case 7:
      return <CodeXml {...props} />;
    case 8:
      return <Dumbbell {...props} />;
    case 9:
      return <WalletCards {...props} />;
    case 10:
      return <Home {...props} />;
    case 11:
      return <GraduationCap {...props} />;
    case 12:
      return <Newspaper {...props} />;
    case 13:
      return <GlobeLock {...props} />;
    case 14:
      return <ShoppingBasket {...props} />;
    default:
      return <MoreHorizontal {...props} />;
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

const CreateSubscription = () => {
  const { getToken } = useAuth();
  const { showSuccess, showInfo, showWarning, showError } = useToast();

  // Form state
  const [serviceName, setServiceName] = useState("");
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(
    CURRENCIES[0],
  );
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedIcon, setSelectedIcon] = useState<BrandIcon | null>(null);
  const [frequency, setFrequency] = useState<BillingCycle>("Monthly");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState("");
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([
    "1d",
  ]);

  // UI state
  const [currencyModal, setCurrencyModal] = useState(false);
  const [iconModal, setIconModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [categoryModal, setCategoryModal] = useState(false);
  const [iconSearch, setIconSearch] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  const filteredIcons = useMemo(
    () =>
      BRAND_ICONS.filter((icon) =>
        icon.name.toLowerCase().includes(iconSearch.toLowerCase()),
      ),
    [iconSearch],
  );

  const nextRenewal = useMemo(
    () => computeNextRenewal(startDate, frequency),
    [startDate, frequency],
  );

  const notificationOptions = NOTIFICATION_OPTIONS[frequency];

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSelectCurrency = (currency: Currency) => {
    setSelectedCurrency(currency);
    setCurrencyModal(false);
  };

  const handleSelectIcon = (icon: BrandIcon) => {
    if (!serviceName || serviceName === selectedIcon?.name) {
      setServiceName(icon.name);
    }
    setSelectedIcon(icon);
    setSelectedCategory(icon.categoryId);
    setIconModal(false);
    setIconSearch("");
  };

  const handleCloseIconModal = () => {
    setIconModal(false);
    setIconSearch("");
  };

  const handleAmountChange = (text: string) => {
    setAmount(sanitiseCurrencyInput(text));
    // Clear error on change
    if (errors.amount) setErrors((prev) => ({ ...prev, amount: undefined }));
  };

  const handleServiceNameChange = (text: string) => {
    setServiceName(text);
    if (errors.serviceName)
      setErrors((prev) => ({ ...prev, serviceName: undefined }));
  };

  const handleDateChange = (_event: DateTimePickerEvent, date?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (date) setStartDate(date);
  };

  const toggleNotification = (id: string) => {
    setSelectedNotifications((prev) =>
      prev.includes(id) ? prev.filter((n) => n !== id) : [...prev, id],
    );
    if (errors.notifications)
      setErrors((prev) => ({ ...prev, notifications: undefined }));
  };

  const handleCycleChange = (cycle: BillingCycle) => {
    setFrequency(cycle);
    setSelectedNotifications([NOTIFICATION_OPTIONS[cycle][0].id]);
  };

  const formErrors = useMemo(
    () =>
      validateForm(
        serviceName,
        amount,
        selectedCategory,
        selectedNotifications,
      ),
    [serviceName, amount, selectedCategory, selectedNotifications],
  );
  const isFormValid = Object.keys(formErrors).length === 0;

  const handleSubmit = async () => {
    // 1. Client-side validation
    if (!isFormValid) {
      setErrors(formErrors);
      showError(Object.values(formErrors)[0] ?? "Please fix the errors below");
      return;
    }

    setIsSaving(true);

    try {
      const token = await getToken();

      if (!token) {
        Alert.alert("Session expired", "Please sign in again.");
        return;
      }

      const payload = {
        serviceName: serviceName.trim(),
        amount: parseFloat(amount),
        currencyCode: selectedCurrency.code,
        category: selectedCategory
          ? (CATEGORIES.find((c) => c.id === selectedCategory)?.name ?? null)
          : null,
        iconId: selectedIcon?.id ?? null,
        iconColor: selectedIcon?.color ?? null,
        iconInitials: selectedIcon?.initials ?? null,
        billingCycle: frequency,
        startDate: startDate.toISOString(),
        nextRenewalDate: nextRenewal.toISOString(),
        notes: notes.trim() || null,
        notifications: selectedNotifications,
      };

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/create-subscription`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        // Surface field-level errors from the Edge Function if provided
        if (data.field && data.message) {
          setErrors({ [data.field]: data.message });
          showError(data.message);
        } else {
          showError(data.message ?? "Something went wrong. Please try again.");
        }
        return;
      }

      // Success — go back to the list
      // TODO: invalidate Zustand subscriptions store here when wired up

      router.push({
        pathname: "/(tabs)/subscriptions",
        params: { justAdded: "true" },
      });
    } catch {
      showError("Could not connect. Check your internet connection.");
    } finally {
      setIsSaving(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView
      className="flex-1 bg-background"
      style={globalStyles.bodyPadding}
      edges={["top"]}
    >
      <StatusBar translucent />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ChevronLeft size={ms(20)} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[globalStyles.pageTitle, { marginLeft: ms(30) }]}>
            Add Subscription
          </Text>
        </View>

        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ marginTop: ms(20), paddingBottom: ms(60) }}
        >
          {/* ── SERVICE NAME + ICON ── */}
          <View>
            <Text style={styles.sectionLabel}>
              SERVICE NAME <Text style={{ color: colors.destructive }}>*</Text>
            </Text>

            <TextInput
              placeholder="e.g. Netflix, Spotify"
              value={serviceName}
              onChangeText={handleServiceNameChange}
              style={[
                styles.input,
                { marginTop: ms(10) },
                errors.serviceName ? styles.inputError : null,
              ]}
              placeholderTextColor={colors.gray}
            />
            {errors.serviceName ? (
              <Text style={styles.errorText}>{errors.serviceName}</Text>
            ) : null}

            {/* Icon row — always visible below the name input */}
            <View style={styles.iconRow}>
              {selectedIcon ? (
                // Post-selection: brand tile + name + "Change icon" pill
                <>
                  <View
                    style={[
                      styles.brandTileLarge,
                      { backgroundColor: selectedIcon.color },
                    ]}
                  >
                    <BrandTileContent icon={selectedIcon} size={ms(44)} />
                  </View>
                  <View style={styles.iconPreviewMeta}>
                    <Text style={styles.iconPreviewName} numberOfLines={1}>
                      {selectedIcon.name}
                    </Text>
                    <TouchableOpacity
                      onPress={() => setIconModal(true)}
                      style={styles.changeIconPill}
                      activeOpacity={0.75}
                    >
                      <Text style={styles.changeIconPillText}>Change icon</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                // Pre-selection: muted label + small outlined pill button
                <>
                  <Text style={styles.iconRowLabel}>Choose an icon</Text>
                  <TouchableOpacity
                    onPress={() => setIconModal(true)}
                    style={styles.chooseIconPill}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.chooseIconPillText}>Browse</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>

          {/* ── CATEGORY ── */}
          <View style={{ marginTop: ms(30) }}>
            <Text style={styles.sectionLabel}>
              CATEGORY <Text style={{ color: colors.destructive }}>*</Text>
            </Text>
            <TouchableOpacity
              onPress={() => setCategoryModal(true)}
              style={[
                styles.input,
                styles.categoryFieldRow,
                errors.category ? styles.inputError : null,
              ]}
              activeOpacity={0.75}
            >
              {selectedCategory ? (
                <>
                  {getCategoryIconActive(selectedCategory)}
                  <Text style={styles.categoryFieldText}>
                    {CATEGORIES.find((c) => c.id === selectedCategory)?.name}
                  </Text>
                </>
              ) : (
                <Text
                  style={[styles.categoryFieldText, { color: colors.gray }]}
                >
                  Select a category
                </Text>
              )}
              <Text
                style={{
                  color: colors.gray,
                  fontSize: ms(12),
                  marginLeft: "auto",
                }}
              >
                <ChevronDown color={colors.gray} size={ms(20)} />
              </Text>
            </TouchableOpacity>
            {errors.category ? (
              <Text style={styles.errorText}>{errors.category}</Text>
            ) : null}
          </View>

          {/* ── AMOUNT ── */}
          <View style={{ marginTop: ms(30) }}>
            <Text style={styles.sectionLabel}>
              AMOUNT <Text style={{ color: colors.destructive }}>*</Text>
            </Text>
            <View style={[styles.row, { gap: ms(12) }]}>
              <View
                style={[
                  styles.amountInputWrapper,
                  { flex: 1 },
                  errors.amount ? styles.inputErrorWrapper : null,
                ]}
              >
                <View style={styles.currencyPrefix}>
                  <Text style={styles.currencyPrefixText}>
                    {selectedCurrency.symbol}
                  </Text>
                </View>
                <TextInput
                  placeholder="0.00"
                  value={amount}
                  onChangeText={handleAmountChange}
                  keyboardType="decimal-pad"
                  style={styles.amountInput}
                  placeholderTextColor={colors.gray}
                />
              </View>
              <TouchableOpacity
                onPress={() => setCurrencyModal(true)}
                style={styles.currencySelector}
                activeOpacity={0.75}
              >
                <Text style={styles.currencySelectorText}>
                  {selectedCurrency.code}
                </Text>

                <ChevronDown color={colors.gray} size={ms(20)} />
              </TouchableOpacity>
            </View>
            {errors.amount ? (
              <Text style={styles.errorText}>{errors.amount}</Text>
            ) : null}
          </View>

          {/* ── BILLING CYCLE ── */}
          <View style={{ marginTop: ms(30) }}>
            <Text style={styles.sectionLabel}>
              BILLING CYCLE <Text style={{ color: colors.destructive }}>*</Text>
            </Text>
            <View style={{ marginTop: ms(10), gap: ms(8) }}>
              <View className="picker-row">
                {BILLING_CYCLES.slice(0, 3).map((cycle) => (
                  <Pressable
                    key={cycle}
                    className={clsx(
                      "picker-option",
                      frequency === cycle && "picker-option-active",
                    )}
                    onPress={() => handleCycleChange(cycle)}
                  >
                    <Text
                      className={clsx(
                        "picker-option-text",
                        frequency === cycle && "picker-option-text-active",
                      )}
                    >
                      {cycle}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <View className="picker-row">
                {BILLING_CYCLES.slice(3).map((cycle) => (
                  <Pressable
                    key={cycle}
                    className={clsx(
                      "picker-option",
                      frequency === cycle && "picker-option-active",
                    )}
                    onPress={() => handleCycleChange(cycle)}
                  >
                    <Text
                      className={clsx(
                        "picker-option-text",
                        frequency === cycle && "picker-option-text-active",
                      )}
                    >
                      {cycle}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          {/* ── START DATE ── */}
          <View style={{ marginTop: ms(30) }}>
            <Text style={styles.sectionLabel}>
              START DATE <Text style={{ color: colors.destructive }}>*</Text>
            </Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={[styles.input, styles.dateRow]}
              activeOpacity={0.75}
            >
              <Calendar size={ms(16)} color={colors.gray} />
              <Text style={styles.dateText}>{formatDate(startDate)}</Text>
            </TouchableOpacity>

            {showDatePicker && Platform.OS === "android" && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}

            {showDatePicker && Platform.OS === "ios" && (
              <CustomModal
                visible={showDatePicker}
                onClose={() => setShowDatePicker(false)}
              >
                <View style={styles.datePickerModal}>
                  <Text style={globalStyles.modalTitle}>Select Start Date</Text>
                  <DateTimePicker
                    value={startDate}
                    mode="date"
                    display="spinner"
                    onChange={handleDateChange}
                    style={{ width: "100%" }}
                  />
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(false)}
                    style={styles.datePickerConfirm}
                  >
                    <Text style={styles.datePickerConfirmText}>Confirm</Text>
                  </TouchableOpacity>
                </View>
              </CustomModal>
            )}
          </View>

          {/* ── NEXT RENEWAL DATE ── */}
          <View style={{ marginTop: ms(20) }}>
            <Text style={styles.sectionLabel}>NEXT RENEWAL DATE</Text>
            <View style={[styles.input, styles.dateRow, styles.readOnlyRow]}>
              <Calendar size={ms(16)} color={colors.accent} />
              <Text style={[styles.dateText, { color: colors.accent }]}>
                {formatDate(nextRenewal)}
              </Text>
              <View style={styles.autoBadge}>
                <Text style={styles.autoBadgeText}>Auto</Text>
              </View>
            </View>
          </View>

          {/* ── RENEWAL NOTIFICATIONS ── */}
          <View style={{ marginTop: ms(30) }}>
            <View style={styles.row}>
              <Text style={styles.sectionLabel}>RENEWAL NOTIFICATIONS</Text>
              <Bell
                size={ms(14)}
                color="#62748E"
                style={{ marginLeft: ms(6) }}
              />
            </View>
            <View className="category-scroll" style={{ marginTop: ms(10) }}>
              {notificationOptions.map((option) => {
                const isSelected = selectedNotifications.includes(option.id);
                return (
                  <TouchableOpacity
                    key={option.id}
                    onPress={() => toggleNotification(option.id)}
                    className={clsx(
                      "category-chip",
                      isSelected && "category-chip-active",
                    )}
                    activeOpacity={0.75}
                  >
                    <Text
                      className={clsx(
                        "category-chip-text",
                        isSelected && "category-chip-text-active",
                      )}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {errors.notifications ? (
              <Text style={styles.errorText}>{errors.notifications}</Text>
            ) : null}
          </View>

          {/* ── NOTES ── */}
          <View style={{ marginTop: ms(30) }}>
            <Text style={styles.sectionLabel}>NOTES</Text>
            <TextInput
              placeholder="e.g. Shared with family, cancel before Jan..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              style={[styles.input, styles.textarea]}
              placeholderTextColor={colors.gray}
            />
          </View>

          {/* ── SUBMIT ── */}
          {/* <TouchableOpacity
            style={[
              styles.submitButton,
              isSaving && styles.submitButtonDisabled,
            ]}
            activeOpacity={0.85}
            onPress={handleSubmit}
            disabled={isSaving || !isFormValid}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Add Subscription</Text>
            )}
          </TouchableOpacity> */}

          <CustomButton
            text="Add Subscription"
            onPress={handleSubmit}
            disabled={isSaving}
            // type="secondary"
            style={{ marginTop: ms(30), marginBottom: ms(20) }}
            loading={isSaving}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Currency Modal ── */}
      <CustomModal
        visible={currencyModal}
        onClose={() => setCurrencyModal(false)}
      >
        <View style={[globalStyles.modalContent, { height: ms(400) }]}>
          <View style={globalStyles.modalHeader}>
            <Text style={globalStyles.modalTitle}>Select Currency</Text>
            <Text style={styles.modalHint}>Scroll for more currencies</Text>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {CURRENCIES.map((currency) => (
              <TouchableOpacity
                key={currency.id}
                style={globalStyles.modalButton}
                onPress={() => handleSelectCurrency(currency)}
              >
                <Text
                  style={[
                    globalStyles.modalButtonText,
                    selectedCurrency.code === currency.code &&
                      globalStyles.selectedCurrencyText,
                  ]}
                >
                  {currency.symbol}
                  {"  "}
                  {currency.code} — {currency.name}
                </Text>
                {selectedCurrency.code === currency.code && (
                  <View style={globalStyles.checkmark}>
                    <Text style={globalStyles.checkmarkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </CustomModal>

      {/* ── Icon Picker Modal ── */}
      <CustomModal visible={iconModal} onClose={handleCloseIconModal}>
        <View style={[globalStyles.modalContent, { height: ms(520) }]}>
          <View style={globalStyles.modalHeader}>
            <Text style={globalStyles.modalTitle}>Choose Icon</Text>
          </View>
          <View style={styles.searchWrapper}>
            <Search
              size={ms(16)}
              color={colors.gray}
              style={{ marginRight: ms(8) }}
            />
            <TextInput
              placeholder="Search apps & services..."
              value={iconSearch}
              onChangeText={setIconSearch}
              style={styles.searchInput}
              placeholderTextColor={colors.gray}
              autoCorrect={false}
              autoCapitalize="none"
            />
          </View>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.iconGrid}
          >
            {filteredIcons.length === 0 ? (
              <View style={styles.emptyIconState}>
                <Text style={styles.emptyIconStateText}>
                  No results for "{iconSearch}"
                </Text>
              </View>
            ) : (
              filteredIcons.map((icon) => {
                const isSelected = selectedIcon?.id === icon.id;
                return (
                  <TouchableOpacity
                    key={icon.id}
                    onPress={() => handleSelectIcon(icon)}
                    style={styles.iconGridItem}
                    activeOpacity={0.75}
                  >
                    <View
                      style={[
                        styles.brandTile,
                        { backgroundColor: icon.color },
                        isSelected && styles.brandTileSelected,
                      ]}
                    >
                      <BrandTileContent icon={icon} size={ms(56)} />
                    </View>
                    <Text
                      style={styles.brandTileLabel}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {icon.name}
                    </Text>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </View>
      </CustomModal>

      {/* ── Category Modal ── */}
      <CustomModal
        visible={categoryModal}
        onClose={() => setCategoryModal(false)}
      >
        <View style={[globalStyles.modalContent, { height: ms(520) }]}>
          <View style={globalStyles.modalHeader}>
            <Text style={globalStyles.modalTitle}>Select Category</Text>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {CATEGORIES.map((category) => {
              const isSelected = selectedCategory === category.id;
              return (
                <TouchableOpacity
                  key={category.id}
                  onPress={() => {
                    setSelectedCategory(isSelected ? null : category.id);
                    setCategoryModal(false);
                    if (errors.category)
                      setErrors((prev) => ({ ...prev, category: undefined }));
                  }}
                  style={[
                    styles.categoryModalRow,
                    isSelected && styles.categoryModalRowActive,
                  ]}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.categoryModalIcon,
                      isSelected && styles.categoryModalIconActive,
                    ]}
                  >
                    {isSelected
                      ? getCategoryIconActive(category.id)
                      : category.icon}
                  </View>
                  <Text
                    style={[
                      styles.categoryModalLabel,
                      isSelected && styles.categoryModalLabelActive,
                    ]}
                  >
                    {category.name}
                  </Text>
                  {isSelected && (
                    <View style={globalStyles.checkmark}>
                      <Text style={globalStyles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </CustomModal>
    </SafeAreaView>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: ms(30),
    paddingVertical: ms(10),
  },
  backButton: {
    height: ms(40),
    width: ms(40),
    borderWidth: ms(1),
    alignSelf: "flex-start",
    borderRadius: ms(999),
    backgroundColor: "#F1F5F9",
    borderColor: "#E2E8F1",
    justifyContent: "center",
    alignItems: "center",
  },
  sectionLabel: {
    fontFamily: "sans-bold",
    fontSize: ms(10),
    letterSpacing: ms(0.9),
    color: "#62748E",
  },
  input: {
    borderWidth: ms(1),
    height: ms(50),
    paddingHorizontal: ms(14),
    borderRadius: ms(13),
    fontSize: ms(13),
    borderColor: "#E2E8F1",
    color: "#0F172A",
    fontFamily: "sans-medium",
  },
  inputError: {
    borderColor: "#EF4444",
  },
  inputErrorWrapper: {
    borderColor: "#EF4444",
  },
  errorText: {
    fontFamily: "sans-regular",
    fontSize: ms(11),
    color: "#EF4444",
    marginTop: ms(4),
  },

  // ── Icon row (below service name input) ──
  // Consistent height so the form doesn't jump when icon is selected/cleared
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: ms(14),
    minHeight: ms(40),
    gap: ms(12),
  },
  // Pre-selection
  iconRowLabel: {
    flex: 1,
    fontFamily: "sans-regular",
    fontSize: ms(13),
    color: colors.gray,
  },
  chooseIconPill: {
    paddingHorizontal: ms(14),
    paddingVertical: ms(7),
    borderRadius: ms(999),
    borderWidth: ms(1),
    borderColor: "#E2E8F1",
    backgroundColor: "#F8FAFC",
  },
  chooseIconPillText: {
    fontFamily: "sans-semibold",
    fontSize: ms(12),
    color: "#0F172A",
  },
  // Post-selection
  brandTileLarge: {
    width: ms(44),
    height: ms(44),
    borderRadius: ms(12),
    justifyContent: "center",
    alignItems: "center",
  },
  brandTileLargeText: {
    color: "#fff",
    fontFamily: "sans-extrabold",
    fontSize: ms(14),
    textAlign: "center",
  },
  iconPreviewMeta: {
    flex: 1,
    gap: ms(4),
  },
  iconPreviewName: {
    fontFamily: "sans-semibold",
    fontSize: ms(13),
    color: "#0F172A",
  },
  changeIconPill: {
    alignSelf: "flex-start",
    paddingHorizontal: ms(10),
    paddingVertical: ms(4),
    borderRadius: ms(999),
    borderWidth: ms(1),
    borderColor: "#E2E8F1",
    backgroundColor: "#F1F5F9",
  },
  changeIconPillText: {
    fontFamily: "sans-semibold",
    fontSize: ms(11),
    color: "#62748E",
  },

  // ── Amount ──
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  amountInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: ms(1),
    borderColor: "#E2E8F1",
    borderRadius: ms(13),
    height: ms(50),
    overflow: "hidden",
    marginTop: ms(10),
  },
  currencyPrefix: {
    height: "100%",
    paddingHorizontal: ms(14),
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: ms(1),
    borderRightColor: "#E2E8F1",
    backgroundColor: "#E8EDF4",
    minWidth: ms(48),
  },
  currencyPrefixText: {
    fontFamily: "sans-semibold",
    fontSize: ms(15),
    color: "#0F172A",
  },
  amountInput: {
    flex: 1,
    paddingHorizontal: ms(12),
    fontSize: ms(15),
    color: "#0F172A",
    height: "100%",
    fontFamily: "sans-medium",
  },
  currencySelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: ms(1),
    borderColor: "#E2E8F1",
    paddingHorizontal: ms(12),
    borderRadius: ms(13),
    height: ms(50),
    width: ms(90),
    gap: ms(4),
    marginTop: ms(10),
  },
  currencySelectorText: {
    fontFamily: "sans-medium",
    fontSize: ms(13),
    color: "#0F172A",
  },

  // ── Category ──
  categoryFieldRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: ms(10),
    marginTop: ms(10),
  },
  categoryFieldText: {
    fontFamily: "sans-medium",
    fontSize: ms(14),
    color: "#0F172A",
  },
  categoryModalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: ms(14),
    paddingVertical: ms(14),
    paddingHorizontal: ms(4),
    borderBottomWidth: ms(1),
    borderBottomColor: "#F1F5F9",
  },
  categoryModalRowActive: {
    backgroundColor: `${colors.accent}08`,
    borderRadius: ms(12),
    paddingHorizontal: ms(10),
  },
  categoryModalIcon: {
    width: ms(40),
    height: ms(40),
    borderRadius: ms(10),
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  categoryModalIconActive: {
    backgroundColor: `${colors.accent}15`,
  },
  categoryModalLabel: {
    flex: 1,
    fontFamily: "sans-medium",
    fontSize: ms(14),
    color: "#0F172A",
  },
  categoryModalLabelActive: {
    fontFamily: "sans-semibold",
    color: colors.accent,
  },

  // ── Dates ──
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: ms(10),
    marginTop: ms(10),
  },
  dateText: {
    fontFamily: "sans-medium",
    fontSize: ms(14),
    color: "#0F172A",
    flex: 1,
  },
  readOnlyRow: {
    backgroundColor: `${colors.accent}0D`,
    borderColor: `${colors.accent}30`,
  },
  autoBadge: {
    backgroundColor: `${colors.accent}20`,
    paddingHorizontal: ms(8),
    paddingVertical: ms(3),
    borderRadius: ms(999),
  },
  autoBadgeText: {
    fontFamily: "sans-bold",
    fontSize: ms(10),
    color: colors.accent,
  },
  datePickerModal: {
    padding: ms(20),
    alignItems: "center",
    gap: ms(16),
  },
  datePickerConfirm: {
    width: "100%",
    backgroundColor: colors.accent,
    borderRadius: ms(13),
    height: ms(50),
    justifyContent: "center",
    alignItems: "center",
  },
  datePickerConfirmText: {
    color: "#fff",
    fontFamily: "sans-bold",
    fontSize: ms(15),
  },

  // ── Notes ──
  textarea: {
    height: ms(110),
    paddingTop: ms(14),
    textAlignVertical: "top",
    marginTop: ms(10),
  },

  // ── Submit ──
  submitButton: {
    marginTop: ms(36),
    backgroundColor: colors.primary,
    borderRadius: ms(16),
    height: ms(56),
    justifyContent: "center",
    alignItems: "center",
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#fff",
    fontFamily: "sans-bold",
    fontSize: ms(16),
  },

  // ── Icon picker modal ──
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderWidth: ms(1),
    borderColor: "#E2E8F1",
    borderRadius: ms(12),
    paddingHorizontal: ms(12),
    height: ms(44),
    marginTop: ms(8),
    marginBottom: ms(4),
  },
  searchInput: {
    flex: 1,
    fontSize: ms(14),
    color: "#0F172A",
    height: "100%",
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: ms(12),
    paddingVertical: ms(12),
  },
  iconGridItem: {
    width: "21%",
    alignItems: "center",
    gap: ms(6),
  },
  brandTile: {
    width: ms(53),
    height: ms(53),
    borderRadius: ms(14),
    justifyContent: "center",
    alignItems: "center",
  },
  brandTileSelected: {
    borderWidth: ms(2.5),
    borderColor: colors.accent,
  },
  brandTileText: {
    color: "#fff",
    fontFamily: "sans-bold",
    fontSize: ms(12),
    textAlign: "center",
  },
  brandTileLabel: {
    fontSize: ms(10),
    color: "#62748E",
    fontFamily: "sans-regular",
    textAlign: "center",
    maxWidth: ms(62),
  },
  modalHint: {
    fontFamily: "sans-regular",
    fontSize: ms(11),
    textAlign: "center",
    marginTop: ms(4),
    color: colors.gray,
  },
  emptyIconState: {
    flex: 1,
    alignItems: "center",
    paddingTop: ms(40),
    width: "100%",
  },
  emptyIconStateText: {
    color: colors.gray,
    fontSize: ms(14),
    fontFamily: "sans-regular",
  },
});

export default CreateSubscription;
