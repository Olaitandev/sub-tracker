import activity from "@/assets/icons/activity.png";
import add from "@/assets/icons/add.png";
import adobe from "@/assets/icons/adobe.png";
import back from "@/assets/icons/back.png";
import canva from "@/assets/icons/canva.png";
import claude from "@/assets/icons/claude.png";
import dropbox from "@/assets/icons/dropbox.png";
import figma from "@/assets/icons/figma.png";
import github from "@/assets/icons/github.png";
import home from "@/assets/icons/home.png";
import medium from "@/assets/icons/medium.png";
import menu from "@/assets/icons/menu.png";
import notion from "@/assets/icons/notion.png";
import openai from "@/assets/icons/openai.png";
import plus from "@/assets/icons/plus.png";
import setting from "@/assets/icons/setting.png";
import spotify from "@/assets/icons/spotify.png";
import wallet from "@/assets/icons/wallet.png";

export const icons = {
  home,
  wallet,
  setting,
  activity,
  add,
  back,
  menu,
  plus,
  notion,
  dropbox,
  openai,
  adobe,
  medium,
  figma,
  spotify,
  github,
  claude,
  canva,
} as const;

export type IconKey = keyof typeof icons;

// ─── Brand Icon Images ────────────────────────────────────────────────────────
// Single source of truth for all brand icon PNG assets.
// Import this map anywhere you need to render a brand tile.
// Falls back to initials automatically when an id is absent from this map.

export const BRAND_ICON_IMAGES: Partial<
  Record<string, ReturnType<typeof require>>
> = {
  // ── Entertainment
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

  // ── Music
  spotify: require("@/assets/brand-icons/spotify.png"),
  applemusic: require("@/assets/brand-icons/music.png"),
  youtubemusic: require("@/assets/brand-icons/youtube-music.png"),
  deezer: require("@/assets/brand-icons/deezer.png"),
  tidal: require("@/assets/brand-icons/tidal.png"),
  amazonmusic: require("@/assets/brand-icons/amazon-music.png"),
  soundcloud: require("@/assets/brand-icons/soundcloud.png"),
  pandora: require("@/assets/brand-icons/pandora.png"),

  // ── Gaming
  xboxgamepass: require("@/assets/brand-icons/xboxgamepass.png"),
  psnow: require("@/assets/brand-icons/psnow.png"),
  nintendoso: require("@/assets/brand-icons/nintendo.png"),
  steam: require("@/assets/brand-icons/steam.png"),
  eaplay: require("@/assets/brand-icons/ea.png"),
  ubisoft: require("@/assets/brand-icons/ubisoft.png"),
  roblox: require("@/assets/brand-icons/roblox.png"),

  // ── AI Tools
  chatgpt: require("@/assets/brand-icons/chatgpt.png"),
  claude: require("@/assets/brand-icons/claude.png"),
  perplexity: require("@/assets/brand-icons/perplexity.png"),
  midjourney: require("@/assets/brand-icons/midjourney.png"),
  cursor: require("@/assets/brand-icons/cursor.png"),
  copilot: require("@/assets/brand-icons/copilot.png"),
  gemini: require("@/assets/brand-icons/gemini.png"),
  grok: require("@/assets/brand-icons/grok.png"),
  elevenlabs: require("@/assets/brand-icons/elevenlabs.png"),

  // ── Productivity
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
  // loom: require("@/assets/brand-icons/loom.png"),

  // ── Developer Tools
  // github: require("@/assets/brand-icons/github.png"),
  // vercel: require("@/assets/brand-icons/vercel.png"),
  // railway: require("@/assets/brand-icons/railway.png"),
  // render: require("@/assets/brand-icons/render.png"),
  // supabase: require("@/assets/brand-icons/supabase.png"),
  // digitalocean: require("@/assets/brand-icons/digitalocean.png"),
  // aws: require("@/assets/brand-icons/aws.png"),
  // cloudflare: require("@/assets/brand-icons/cloudflare.png"),
  // netlify: require("@/assets/brand-icons/netlify.png"),
  // heroku: require("@/assets/brand-icons/heroku.png"),
  // sentry: require("@/assets/brand-icons/sentry.png"),
  // datadog: require("@/assets/brand-icons/datadog.png"),
  // postman: require("@/assets/brand-icons/postman.png"),

  // ── Cloud & Storage
  // googleone: require("@/assets/brand-icons/googleone.png"),
  // dropbox: require("@/assets/brand-icons/dropbox.png"),
  // icloud: require("@/assets/brand-icons/icloud.png"),
  // onedrive: require("@/assets/brand-icons/onedrive.png"),
  // backblaze: require("@/assets/brand-icons/backblaze.png"),
  // box: require("@/assets/brand-icons/box.png"),
  // gsuite: require("@/assets/brand-icons/gsuite.png"),

  // ── Finance
  // revolut: require("@/assets/brand-icons/revolut.png"),
  // monzo: require("@/assets/brand-icons/monzo.png"),
  // ynab: require("@/assets/brand-icons/ynab.png"),
  // quickbooks: require("@/assets/brand-icons/quickbooks.png"),
  // expensify: require("@/assets/brand-icons/expensify.png"),

  // ── Fitness & Health
  // peloton: require("@/assets/brand-icons/peloton.png"),
  // strava: require("@/assets/brand-icons/strava.png"),
  // fitbit: require("@/assets/brand-icons/fitbit.png"),
  // headspace: require("@/assets/brand-icons/headspace.png"),
  // calm: require("@/assets/brand-icons/calm.png"),
  // noom: require("@/assets/brand-icons/noom.png"),
  // myfitnesspal: require("@/assets/brand-icons/myfitnesspal.png"),
  // whoop: require("@/assets/brand-icons/whoop.png"),

  // ── Education
  // duolingo: require("@/assets/brand-icons/duolingo.png"),
  // coursera: require("@/assets/brand-icons/coursera.png"),
  // skillshare: require("@/assets/brand-icons/skillshare.png"),
  // udemy: require("@/assets/brand-icons/udemy.png"),
  // masterclass: require("@/assets/brand-icons/masterclass.png"),
  // brilliant: require("@/assets/brand-icons/brilliant.png"),
  // linkedin: require("@/assets/brand-icons/linkedin.png"),

  // ── News & Reading
  // nytimes: require("@/assets/brand-icons/nytimes.png"),
  // wsj: require("@/assets/brand-icons/wsj.png"),
  // medium: require("@/assets/brand-icons/medium.png"),
  // substack: require("@/assets/brand-icons/substack.png"),
  // audible: require("@/assets/brand-icons/audible.png"),
  // kindle: require("@/assets/brand-icons/kindle.png"),
  // economist: require("@/assets/brand-icons/economist.png"),
  // guardian: require("@/assets/brand-icons/guardian.png"),
  // readwise: require("@/assets/brand-icons/readwise.png"),

  // ── Security & VPN
  // nordvpn: require("@/assets/brand-icons/nordvpn.png"),
  // expressvpn: require("@/assets/brand-icons/expressvpn.png"),
  // surfshark: require("@/assets/brand-icons/surfshark.png"),
  // onepassword: require("@/assets/brand-icons/onepassword.png"),
  // lastpass: require("@/assets/brand-icons/lastpass.png"),
  // bitwarden: require("@/assets/brand-icons/bitwarden.png"),
};
