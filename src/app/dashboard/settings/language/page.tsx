"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Search, Check, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/context/ThemeContext";

// Google Translate cookie name
const COOKIE_NAME = "googtrans";

interface LanguageDescriptor {
  name: string;
  title: string;
}

declare global {
  interface Window {
    __GOOGLE_TRANSLATION_CONFIG__?: {
      languages: LanguageDescriptor[];
      defaultLanguage: string;
    };
  }
}

// Map language codes to country codes for flag images
const LANG_TO_COUNTRY: Record<string, string> = {
  en: "gb", bn: "bd", ar: "sa", hi: "in", es: "es", fr: "fr",
  de: "de", it: "it", pt: "br", ru: "ru", ja: "jp", "zh-CN": "cn",
  ko: "kr", tr: "tr", pl: "pl", nl: "nl", sv: "se", da: "dk",
  no: "no", fi: "fi", el: "gr", cs: "cz", ro: "ro", hu: "hu",
  sr: "rs", hr: "hr", bg: "bg", sk: "sk", sl: "si", lt: "lt",
  lv: "lv", et: "ee", uk: "ua", he: "il", ur: "pk", fa: "ir",
  ta: "in", te: "in", mr: "in", gu: "in", pa: "in", kn: "in",
  ml: "in", si: "lk", ne: "np", th: "th", vi: "vn", id: "id",
  ms: "my", tl: "ph",
};

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : undefined;
}

function setCookieValue(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)};path=/;max-age=${365 * 86400}`;
}

export default function LanguageSettingsPage() {
  const { language } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    if (typeof document !== "undefined") {
      const cookieVal = getCookie(COOKIE_NAME);
      if (cookieVal) {
        const parts = cookieVal.split("/");
        if (parts.length > 2) return parts[2];
      }
    }
    return "en";
  });
  const [languageConfig, setLanguageConfig] = useState<LanguageDescriptor[]>([]);

  useEffect(() => {
    // Load available languages from Google Translate config (async to avoid lint warning)
    const timer = setTimeout(() => {
      if (typeof window !== "undefined" && window.__GOOGLE_TRANSLATION_CONFIG__) {
        setLanguageConfig(window.__GOOGLE_TRANSLATION_CONFIG__.languages);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [language]);

  const handleLanguageChange = (langCode: string) => {
    setCookieValue(COOKIE_NAME, `/auto/${langCode}`);
    setCurrentLanguage(langCode);
    setTimeout(() => window.location.reload(), 300);
  };

  const filteredLanguages = languageConfig.filter(
    (lang) =>
      lang.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentLangTitle =
    languageConfig.find((l) => l.name === currentLanguage)?.title || "English";

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Globe className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              Language Settings
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Choose your preferred language for the site
            </p>
          </div>
        </div>
      </div>

      {/* Current Language Banner */}
      <div className="bg-primary/5 border-2 border-primary/20 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-6 rounded overflow-hidden shadow-sm shrink-0">
            <Image
              src={`https://flagcdn.com/w40/${LANG_TO_COUNTRY[currentLanguage] || "gb"}.png`}
              alt={currentLangTitle}
              width={40}
              height={30}
              className="w-full h-full object-cover"
              unoptimized
            />
          </div>
          <div>
            <div className="text-xs text-primary font-medium">Current Language</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 notranslate">
              {currentLangTitle}
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search languages..."
          className="ps-10 h-11 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
        />
      </div>

      {/* Language Grid */}
      {filteredLanguages.length === 0 && languageConfig.length === 0 ? (
        <div className="text-center py-12">
          <Globe className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">
            Language configuration is loading...
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Please refresh the page if languages don&apos;t appear.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-125 overflow-y-auto pe-1 notranslate">
          {filteredLanguages.map((lang) => {
            const isSelected = currentLanguage === lang.name;
            const countryCode = LANG_TO_COUNTRY[lang.name] || "gb";

            return (
              <button
                key={lang.name}
                onClick={() => handleLanguageChange(lang.name)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 text-start ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-6 rounded overflow-hidden shadow-sm shrink-0">
                      <Image
                        src={`https://flagcdn.com/w40/${countryCode}.png`}
                        alt={lang.title}
                        width={40}
                        height={30}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                        {lang.title}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {lang.name}
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <Check className="h-5 w-5 text-primary shrink-0" />
                  )}
                </div>
              </button>
            );
          })}

          {filteredLanguages.length === 0 && (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500 text-sm">
                No languages found matching &quot;{searchQuery}&quot;
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
