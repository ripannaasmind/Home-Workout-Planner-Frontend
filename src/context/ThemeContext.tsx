"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// ------- Cookie helpers -------
function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : undefined;
}

function setCookieValue(name: string, value: string, days = 365) {
  if (typeof document === "undefined") return;
  const d = new Date();
  d.setTime(d.getTime() + days * 86400000);
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${d.toUTCString()};path=/`;
}

// ------- Currency Symbols -------
export const CURRENCY_SYMBOLS: Record<string, string> = {
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

// Currencies that show no decimal places
const NO_DECIMAL_CURRENCIES = [
  "JPY", "KRW", "IDR", "NGN", "PKR", "BDT", "INR", "EGP",
  "VND", "KHR", "LAK", "MMK", "UGX", "TZS", "LBP", "IQD",
  "CLP", "COP", "ARS", "HUF", "ISK", "KZT", "XOF", "XAF",
];

// RTL languages
const RTL_LANGUAGES = ["ar", "he", "ur", "fa", "ps"];

// ------- All currencies sorted (for admin settings dropdown) -------
export const ALL_CURRENCIES = Object.keys(CURRENCY_SYMBOLS).sort();

// Google Translate cookie name
const GOOGLE_TRANS_COOKIE = "googtrans";

// Declare Google Translation config on window
declare global {
  interface Window {
    __GOOGLE_TRANSLATION_CONFIG__?: {
      languages: { title: string; name: string }[];
      defaultLanguage: string;
    };
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// ------- Types -------
type Theme = "light" | "dark" | "system";
type Direction = "ltr" | "rtl";

interface ThemeContextType {
  theme: Theme;
  setTheme: (t: Theme) => void;
  isDark: boolean;
  direction: Direction;
  currency: string;
  setCurrency: (currency: string) => void;
  currencySymbol: string;
  formatPrice: (amountInUSD: number) => string;
  convertPrice: (amountInUSD: number) => number;
  language: string;
  setLanguage: (langCode: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);


// ------- Theme Provider Component -------
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("theme") as Theme) || "light";
    }
    return "light";
  });
  const [currency, setCurrencyState] = useState("USD");
  const [language, setLanguageState] = useState(() => {
    if (typeof document !== "undefined") {
      const cookie = getCookie(GOOGLE_TRANS_COOKIE);
      if (cookie) {
        const parts = cookie.split("/");
        if (parts.length > 2) return parts[2];
      }
    }
    return "en";
  });
  const [direction, setDirectionState] = useState<Direction>(() => {
    if (typeof document !== "undefined") {
      const cookie = getCookie(GOOGLE_TRANS_COOKIE);
      if (cookie) {
        const parts = cookie.split("/");
        if (parts.length > 2 && RTL_LANGUAGES.includes(parts[2])) return "rtl";
      }
    }
    return "ltr";
  });
  const [systemPrefersDark, setSystemPrefersDark] = useState(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });
  const [mounted, setMounted] = useState(false);

  // Compute isDark from theme + system preference
  const isDark = theme === "dark" ? true : theme === "light" ? false : systemPrefersDark;

  // Apply dark class to html
  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark, mounted]);

  // Listen for system theme changes
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => setSystemPrefersDark(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Apply RTL direction attribute
  useEffect(() => {
    document.documentElement.dir = direction;
    document.documentElement.setAttribute("dir", direction);
  }, [direction]);

  // Fetch admin-set currency from backend
  useEffect(() => {
    // Fetch admin-set currency from backend (currency is admin-controlled only)
    fetch(`${API_URL}/site-config`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data?.currency) {
          setCurrencyState(res.data.currency);
        }
      })
      .catch(() => {})
      .finally(() => setMounted(true));
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem("theme", t);
  };

  // Language change: set Google Translate cookie + apply RTL + reload
  const setLanguage = (langCode: string) => {
    setCookieValue(GOOGLE_TRANS_COOKIE, `/auto/${langCode}`);
    setLanguageState(langCode);

    if (RTL_LANGUAGES.includes(langCode)) {
      setDirectionState("rtl");
      document.documentElement.dir = "rtl";
      document.documentElement.setAttribute("dir", "rtl");
    } else {
      setDirectionState("ltr");
      document.documentElement.dir = "ltr";
      document.documentElement.setAttribute("dir", "ltr");
    }

    // Reload to trigger Google Translate
    setTimeout(() => window.location.reload(), 300);
  };

  const currencySymbol = CURRENCY_SYMBOLS[currency] || "$";

  const convertPrice = (amountInUSD: number): number => {
    const rate = EXCHANGE_RATES[currency] || 1;
    return amountInUSD * rate;
  };

  const formatPrice = (amountInUSD: number): string => {
    const converted = convertPrice(amountInUSD);
    if (NO_DECIMAL_CURRENCIES.includes(currency)) {
      return `${currencySymbol}${Math.round(converted).toLocaleString()}`;
    }
    return `${currencySymbol}${converted.toFixed(2)}`;
  };

  if (!mounted) return null;

  return (
    <ThemeContext.Provider
      value={{
        theme, setTheme, isDark, direction,
        currency, setCurrency: setCurrencyState, currencySymbol,
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
