"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

// ------- Currency Symbols -------
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$", EUR: "€", GBP: "£", BDT: "৳", INR: "₹", JPY: "¥", CNY: "¥",
  AUD: "A$", CAD: "C$", CHF: "CHF", SAR: "﷼", AED: "د.إ", MYR: "RM",
  SGD: "S$", PKR: "₨", TRY: "₺", KRW: "₩", THB: "฿", PHP: "₱",
  IDR: "Rp", NGN: "₦", ZAR: "R", BRL: "R$", MXN: "Mex$", EGP: "E£",
  RUB: "₽", SEK: "kr", NOK: "kr", DKK: "kr", PLN: "zł", CZK: "Kč",
  HUF: "Ft", RON: "lei", BGN: "лв", HRK: "kn", ISK: "kr", TWD: "NT$",
  HKD: "HK$", NZD: "NZ$", CLP: "CL$", COP: "COL$", PEN: "S/.",
  ARS: "AR$", VND: "₫", UAH: "₴", KZT: "₸", GEL: "₾", QAR: "QR",
  KWD: "KD", BHD: "BD", OMR: "OMR", JOD: "JD", LBP: "L£", IQD: "ع.د",
  LKR: "Rs", NPR: "NRs", MMK: "K", KHR: "៛", LAK: "₭", BND: "B$",
  MAD: "MAD", TND: "DT", DZD: "DA", LYD: "LD", GHS: "₵", KES: "KSh",
  UGX: "USh", TZS: "TSh", ETB: "Br", XOF: "CFA", XAF: "FCFA",
};

// ------- Exchange Rates (1 USD = X) -------
const EXCHANGE_RATES: Record<string, number> = {
  USD: 1, EUR: 0.92, GBP: 0.79, BDT: 120, INR: 83.5, JPY: 155,
  CNY: 7.25, AUD: 1.55, CAD: 1.37, CHF: 0.88, SAR: 3.75, AED: 3.67,
  MYR: 4.72, SGD: 1.35, PKR: 278, TRY: 32.5, KRW: 1380, THB: 36.5,
  PHP: 56.5, IDR: 15900, NGN: 1550, ZAR: 18.5, BRL: 5.05, MXN: 17.2,
  EGP: 48.5, RUB: 92, SEK: 10.8, NOK: 11, DKK: 6.9, PLN: 4.05,
  CZK: 23.5, HUF: 365, RON: 4.6, BGN: 1.8, HRK: 7, ISK: 140,
  TWD: 32, HKD: 7.82, NZD: 1.68, CLP: 950, COP: 3950, PEN: 3.75,
  ARS: 870, VND: 25300, UAH: 41, KZT: 460, GEL: 2.7, QAR: 3.64,
  KWD: 0.31, BHD: 0.376, OMR: 0.385, JOD: 0.71, LBP: 89500,
  IQD: 1310, LKR: 310, NPR: 133, MMK: 2100, KHR: 4100, LAK: 21000,
  BND: 1.35, MAD: 10, TND: 3.12, DZD: 135, LYD: 4.85, GHS: 15.5,
  KES: 155, UGX: 3800, TZS: 2700, ETB: 57, XOF: 610, XAF: 610,
};

// ------- Language list -------
export const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
  { code: "pt", name: "Português" },
  { code: "it", name: "Italiano" },
  { code: "nl", name: "Nederlands" },
  { code: "ru", name: "Русский" },
  { code: "ja", name: "日本語" },
  { code: "ko", name: "한국어" },
  { code: "zh", name: "中文" },
  { code: "ar", name: "العربية" },
  { code: "hi", name: "हिन्दी" },
  { code: "bn", name: "বাংলা" },
  { code: "ur", name: "اردو" },
  { code: "tr", name: "Türkçe" },
  { code: "pl", name: "Polski" },
  { code: "uk", name: "Українська" },
  { code: "th", name: "ไทย" },
  { code: "vi", name: "Tiếng Việt" },
  { code: "id", name: "Bahasa Indonesia" },
  { code: "ms", name: "Bahasa Melayu" },
  { code: "sv", name: "Svenska" },
  { code: "da", name: "Dansk" },
  { code: "no", name: "Norsk" },
  { code: "fi", name: "Suomi" },
  { code: "el", name: "Ελληνικά" },
  { code: "cs", name: "Čeština" },
  { code: "ro", name: "Română" },
  { code: "hu", name: "Magyar" },
  { code: "he", name: "עברית" },
  { code: "fa", name: "فارسی" },
  { code: "sw", name: "Kiswahili" },
  { code: "tl", name: "Filipino" },
  { code: "ta", name: "தமிழ்" },
  { code: "te", name: "తెలుగు" },
  { code: "ml", name: "മലയാളം" },
  { code: "kn", name: "ಕನ್ನಡ" },
  { code: "mr", name: "मराठी" },
  { code: "gu", name: "ગુજરાતી" },
  { code: "pa", name: "ਪੰਜਾਬੀ" },
  { code: "ne", name: "नेपाली" },
  { code: "si", name: "සිංහල" },
  { code: "my", name: "မြန်မာ" },
  { code: "km", name: "ខ្មែរ" },
  { code: "lo", name: "ລາວ" },
  { code: "ka", name: "ქართული" },
  { code: "am", name: "አማርኛ" },
  { code: "zu", name: "isiZulu" },
  { code: "yo", name: "Yorùbá" },
  { code: "ig", name: "Igbo" },
  { code: "ha", name: "Hausa" },
  { code: "af", name: "Afrikaans" },
];

// ------- All currencies sorted -------
export const ALL_CURRENCIES = Object.keys(CURRENCY_SYMBOLS).sort();

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ------- Types -------
type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (t: Theme) => void;
  isDark: boolean;
  currency: string;
  setCurrency: (c: string) => void;
  currencySymbol: string;
  formatPrice: (amount: number) => string;
  convertPrice: (amountInUSD: number) => number;
  language: string;
  setLanguage: (l: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);


// ------- Theme Provider Component -------
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [currency, setCurrencyState] = useState("USD");
  const [language, setLanguageState] = useState("en");
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Resolve effective dark mode
  const resolveIsDark = useCallback((t: Theme) => {
    if (t === "dark") return true;
    if (t === "light") return false;
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  }, []);

  // Apply dark class to html
  useEffect(() => {
    if (!mounted) return;
    const dark = resolveIsDark(theme);
    setIsDark(dark);
    document.documentElement.classList.toggle("dark", dark);
  }, [theme, mounted, resolveIsDark]);

  // Listen for system theme changes when mode is "system"
  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const dark = mq.matches;
      setIsDark(dark);
      document.documentElement.classList.toggle("dark", dark);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  // Load from localStorage + fetch admin settings
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    const savedCurrency = localStorage.getItem("currency");
    const savedLanguage = localStorage.getItem("language");

    if (savedTheme) setThemeState(savedTheme);
    if (savedCurrency) setCurrencyState(savedCurrency);
    if (savedLanguage) setLanguageState(savedLanguage);

    // Fetch admin-set defaults
    fetch(`${API_URL}/api/site-config`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data) {
          // Only use admin-set values if user hasn't set their own preference
          if (!savedCurrency && res.data.currency) setCurrencyState(res.data.currency);
          if (!savedLanguage && res.data.language) setLanguageState(res.data.language);
        }
      })
      .catch(() => {});

    setMounted(true);
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem("theme", t);
  };

  const setCurrency = (c: string) => {
    setCurrencyState(c);
    localStorage.setItem("currency", c);
  };

  const setLanguage = (l: string) => {
    setLanguageState(l);
    localStorage.setItem("language", l);
  };

  const currencySymbol = CURRENCY_SYMBOLS[currency] || currency;

  const convertPrice = (amountInUSD: number): number => {
    const rate = EXCHANGE_RATES[currency] || 1;
    return Math.round(amountInUSD * rate * 100) / 100;
  };

  const formatPrice = (amount: number): string => {
    const converted = convertPrice(amount);
    return `${currencySymbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (!mounted) return null;

  return (
    <ThemeContext.Provider
      value={{
        theme, setTheme, isDark,
        currency, setCurrency, currencySymbol,
        formatPrice, convertPrice,
        language, setLanguage,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
