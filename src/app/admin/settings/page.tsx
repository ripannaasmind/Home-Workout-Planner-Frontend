"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { adminApi, SiteConfig } from "@/services/api";
import { toast } from "sonner";
import Image from "next/image";
import {
  CreditCard,
  Truck,
  Eye,
  EyeOff,
  Save,
  Settings,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Globe,
  Layout,
  Upload,
  Plus,
  Trash2,
  Link as LinkIcon,
  ImageIcon,
  Loader2,
  Search,
  Check,
} from "lucide-react";
import { ALL_CURRENCIES, CURRENCY_SYMBOLS } from "@/context/ThemeContext";


const GTRANS_COOKIE = "googtrans";
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
function getGtransCookie(): string {
  if (typeof document === "undefined") return "en";
  const m = document.cookie.match(/(^| )googtrans=([^;]+)/);
  if (!m) return "en";
  const parts = decodeURIComponent(m[2]).split("/");
  return parts.length > 2 ? parts[2] : "en";
}
function setGtransCookie(lang: string) {
  document.cookie = `${GTRANS_COOKIE}=${encodeURIComponent("/auto/" + lang)};path=/;max-age=${365 * 86400}`;
}

interface LangDescriptor { name: string; title: string; }
declare global { interface Window { __GOOGLE_TRANSLATION_CONFIG__?: { languages: LangDescriptor[]; defaultLanguage: string; }; } }


// ------- PayPal SVG Icon -------
function PayPalIcon() {
  return (
    <svg className="h-5 w-6" viewBox="0 0 101 32" fill="none">
      <path d="M12.237 6.364h-6.89c-.47 0-.87.34-.944.8L1.99 23.12c-.055.34.208.647.554.647h3.29c.47 0 .87-.34.943-.8l.913-5.794c.074-.46.473-.8.944-.8h2.177c4.534 0 7.15-2.194 7.835-6.538.308-1.9.012-3.393-.88-4.438-.98-1.15-2.716-1.782-5.03-1.782z" fill="#003087" />
      <path d="M38.5 6.364h-6.89c-.47 0-.87.34-.943.8l-2.413 15.957c-.055.34.208.647.554.647h3.53c.327 0 .606-.238.658-.56l.687-4.352c.073-.46.473-.8.943-.8h2.178c4.534 0 7.15-2.194 7.835-6.538.308-1.9.013-3.393-.88-4.438-.98-1.15-2.716-1.782-5.03-1.782z" fill="#009CDE" />
    </svg>
  );
}


// ------- Masked key display helper -------
function maskKey(key: string) {
  if (!key || key.length < 8) return key;
  return key.slice(0, 6) + "••••••••••••" + key.slice(-4);
}


// ------- Sections -------
const sections = [
  { id: "business", label: "Business", icon: Settings },
  { id: "payment", label: "Payment", icon: CreditCard },
  { id: "currency", label: "Currency", icon: DollarSign },
  { id: "language", label: "Language", icon: Globe },
  { id: "footer", label: "Footer & Branding", icon: Layout },
];


// ------- Admin Settings Page -------
export default function AdminSettingsPage() {
  const { token } = useAuth();
  const { setCurrency, language: themeLanguage } = useTheme();
  const [activeSection, setActiveSection] = useState("business");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Language picker state
  const [langSearch, setLangSearch] = useState("");
  const [currentLang, setCurrentLang] = useState("en");
  const [languageConfig, setLanguageConfig] = useState<LangDescriptor[]>([]);

  // Load current language from cookie on mount
  useEffect(() => {
    setCurrentLang(getGtransCookie());
    const t = setTimeout(() => {
      if (typeof window !== "undefined" && window.__GOOGLE_TRANSLATION_CONFIG__) {
        setLanguageConfig(window.__GOOGLE_TRANSLATION_CONFIG__.languages);
      }
    }, 100);
    return () => clearTimeout(t);
  }, [themeLanguage]);

  const handleLangChange = (langCode: string) => {
    setGtransCookie(langCode);
    setCurrentLang(langCode);
    setTimeout(() => window.location.reload(), 300);
  };

  // Payment state
  const [stripeEnabled, setStripeEnabled] = useState(false);
  const [stripePublishable, setStripePublishable] = useState("");
  const [stripeSecret, setStripeSecret] = useState("");
  const [stripeOpen, setStripeOpen] = useState(false);
  const [showStripePub, setShowStripePub] = useState(false);
  const [showStripeSecret, setShowStripeSecret] = useState(false);
  const [paypalEnabled, setPaypalEnabled] = useState(false);
  const [paypalClientId, setPaypalClientId] = useState("");
  const [paypalSecret, setPaypalSecret] = useState("");
  const [paypalOpen, setPaypalOpen] = useState(false);
  const [showPaypalId, setShowPaypalId] = useState(false);
  const [showPaypalSecret, setShowPaypalSecret] = useState(false);
  const [codEnabled, setCodEnabled] = useState(true);
  const [paystackEnabled, setPaystackEnabled] = useState(false);
  const [paystackSecretKey, setPaystackSecretKey] = useState("");
  const [paystackPublicKey, setPaystackPublicKey] = useState("");
  const [paystackOpen, setPaystackOpen] = useState(false);
  const [showPaystackSecret, setShowPaystackSecret] = useState(false);
  const [showPaystackPublic, setShowPaystackPublic] = useState(false);
  const [walletEnabled, setWalletEnabled] = useState(false);

  // Site config state
  const [siteConfig, setSiteConfig] = useState<Partial<SiteConfig>>({
    companyName: "FitHome",
    tagline: "Your personal fitness companion for workouts anytime, anywhere.",
    email: "",
    phone: "",
    address: "",
    currency: "USD",
    language: "en",
    timezone: "UTC",
    headerLogo: "",
    footerLogo: "",
    footerDescription: "",
    appDownloadLinks: [],
    socialMediaLinks: [],
    footerQuickLinks: [],
    newsletter: { enabled: true, title: "Stay Updated", description: "Get fitness tips & exclusive workouts directly to your inbox." },
    copyright: "FitHome. All rights reserved.",
  });

  // Upload refs
  const headerLogoRef = useRef<HTMLInputElement>(null);
  const footerLogoRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<string | null>(null);


  // ------- Load all settings on mount -------
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const [payRes, siteRes] = await Promise.all([
          adminApi.getPaymentSettings(token),
          adminApi.getSiteConfig(token),
        ]);
        const d = payRes.data;
        setStripeEnabled(d.stripe.enabled);
        setStripePublishable(d.stripe.publishableKey || "");
        setStripeSecret(d.stripe.secretKey || "");
        setPaypalEnabled(d.paypal.enabled);
        setPaypalClientId(d.paypal.clientId || "");
        setPaypalSecret(d.paypal.secret || "");
        setCodEnabled(d.cashOnDelivery.enabled);
        if (d.paystack) {
          setPaystackEnabled(d.paystack.enabled);
          setPaystackSecretKey(d.paystack.secretKey || "");
          setPaystackPublicKey(d.paystack.publicKey || "");
        }
        if (d.wallet) setWalletEnabled(d.wallet.enabled);

        if (siteRes.data) {
          setSiteConfig((prev) => ({ ...prev, ...siteRes.data }));
        }
      } catch {
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);


  // ------- Image upload helper -------
  const handleImageUpload = async (file: File, field: string, arrayIndex?: number, arrayField?: string) => {
    if (!token) return;
    const uploadKey = arrayIndex !== undefined ? `${field}-${arrayIndex}` : field;
    setUploading(uploadKey);
    try {
      const res = await adminApi.uploadSiteImage(file, token);
      if (res.success && res.data?.url) {
        if (arrayIndex !== undefined && arrayField) {
          setSiteConfig((prev) => {
            const arr = [...(prev[field as keyof SiteConfig] as Array<Record<string, string>> || [])];
            arr[arrayIndex] = { ...arr[arrayIndex], [arrayField]: res.data.url };
            return { ...prev, [field]: arr };
          });
        } else {
          setSiteConfig((prev) => ({ ...prev, [field]: res.data.url }));
        }
        toast.success("Image uploaded");
      } else {
        toast.error("Upload failed");
      }
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(null);
    }
  };


  // ------- Save all settings -------
  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    try {
      const promises = [];

      if (activeSection === "payment") {
        promises.push(
          adminApi.updatePaymentSettings(
            {
              stripe: { enabled: stripeEnabled, publishableKey: stripePublishable, secretKey: stripeSecret },
              paypal: { enabled: paypalEnabled, clientId: paypalClientId, secret: paypalSecret },
              cashOnDelivery: { enabled: codEnabled },
              paystack: { enabled: paystackEnabled, secretKey: paystackSecretKey, publicKey: paystackPublicKey },
              wallet: { enabled: walletEnabled },
            },
            token
          )
        );
      }

      if (activeSection === "business" || activeSection === "currency" || activeSection === "language" || activeSection === "footer") {
        promises.push(adminApi.updateSiteConfig(siteConfig, token));
      }

      await Promise.all(promises);
      // Update currency in ThemeContext immediately so all prices update without page reload
      if (activeSection === "currency" && siteConfig.currency) {
        setCurrency(siteConfig.currency);
      }
      toast.success("Settings saved successfully");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };


  // ------- Helper to update site config field -------
  const updateField = (field: string, value: unknown) => {
    setSiteConfig((prev) => ({ ...prev, [field]: value }));
  };

  const updateNestedField = (parent: string, field: string, value: unknown) => {
    setSiteConfig((prev) => ({
      ...prev,
      [parent]: { ...(prev[parent as keyof SiteConfig] as Record<string, unknown>), [field]: value },
    }));
  };


  // ------- Social media links helpers -------
  const addSocialLink = () => {
    setSiteConfig((prev) => ({
      ...prev,
      socialMediaLinks: [...(prev.socialMediaLinks || []), { name: "", url: "", icon: "" }],
    }));
  };

  const removeSocialLink = (index: number) => {
    setSiteConfig((prev) => ({
      ...prev,
      socialMediaLinks: (prev.socialMediaLinks || []).filter((_, i) => i !== index),
    }));
  };

  const updateSocialLink = (index: number, field: string, value: string) => {
    setSiteConfig((prev) => {
      const links = [...(prev.socialMediaLinks || [])];
      links[index] = { ...links[index], [field]: value };
      return { ...prev, socialMediaLinks: links };
    });
  };


  // ------- App download links helpers -------
  const addAppLink = () => {
    setSiteConfig((prev) => ({
      ...prev,
      appDownloadLinks: [...(prev.appDownloadLinks || []), { name: "", url: "", logo: "" }],
    }));
  };

  const removeAppLink = (index: number) => {
    setSiteConfig((prev) => ({
      ...prev,
      appDownloadLinks: (prev.appDownloadLinks || []).filter((_, i) => i !== index),
    }));
  };

  const updateAppLink = (index: number, field: string, value: string) => {
    setSiteConfig((prev) => {
      const links = [...(prev.appDownloadLinks || [])];
      links[index] = { ...links[index], [field]: value };
      return { ...prev, appDownloadLinks: links };
    });
  };


  // ------- Footer quick links helpers -------
  const addQuickLink = () => {
    setSiteConfig((prev) => ({
      ...prev,
      footerQuickLinks: [...(prev.footerQuickLinks || []), { name: "", url: "" }],
    }));
  };

  const removeQuickLink = (index: number) => {
    setSiteConfig((prev) => ({
      ...prev,
      footerQuickLinks: (prev.footerQuickLinks || []).filter((_, i) => i !== index),
    }));
  };

  const updateQuickLink = (index: number, field: string, value: string) => {
    setSiteConfig((prev) => {
      const links = [...(prev.footerQuickLinks || [])];
      links[index] = { ...links[index], [field]: value };
      return { ...prev, footerQuickLinks: links };
    });
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Settings className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Settings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage your site configuration, payments, and branding</p>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar navigation */}
        <div className="w-48 shrink-0">
          <nav className="space-y-1 sticky top-24">
            {sections.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeSection === id
                    ? "bg-primary text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-gray-200"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content area */}
        <div className="flex-1 space-y-6 min-w-0">

          {/* ==================== BUSINESS SECTION ==================== */}
          {activeSection === "business" && (
            <>
              {/* Company Info */}
              <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-purple-50 flex items-center justify-center">
                      <Settings className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold text-gray-800 dark:text-gray-100">Company Information</CardTitle>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Basic details shown across the site</p>
                    </div>
                  </div>
                </CardHeader>
                <Separator />
                <CardContent className="pt-4 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">Company / Gym Name</Label>
                    <Input value={siteConfig.companyName || ""} onChange={(e) => updateField("companyName", e.target.value)} placeholder="FitHome" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">Tagline</Label>
                    <Textarea value={siteConfig.tagline || ""} onChange={(e) => updateField("tagline", e.target.value)} placeholder="Your fitness companion..." rows={2} className="resize-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">Email</Label>
                      <Input type="email" value={siteConfig.email || ""} onChange={(e) => updateField("email", e.target.value)} placeholder="hello@fithome.com" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">Phone</Label>
                      <Input value={siteConfig.phone || ""} onChange={(e) => updateField("phone", e.target.value)} placeholder="+1 (555) 000-0000" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">Address</Label>
                    <Textarea value={siteConfig.address || ""} onChange={(e) => updateField("address", e.target.value)} placeholder="123 Fitness St, City" rows={2} className="resize-none" />
                  </div>
                </CardContent>
              </Card>
            </>
          )}


          {/* ==================== PAYMENT SECTION ==================== */}
          {activeSection === "payment" && (
            <>
              {/* Stripe */}
              <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-violet-50 flex items-center justify-center">
                        <CreditCard className="h-4 w-4 text-violet-600" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-semibold text-gray-800 dark:text-gray-100">Stripe</CardTitle>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Credit & debit card payments</p>
                      </div>
                    </div>
                    <Switch checked={stripeEnabled} onCheckedChange={setStripeEnabled} />
                  </div>
                </CardHeader>
                {stripeEnabled && (
                  <>
                    <Separator />
                    <CardContent className="pt-4">
                      <button
                        className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors mb-4"
                        onClick={() => setStripeOpen((o) => !o)}
                      >
                        {stripeOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        {stripeOpen ? "Hide" : "Configure"} API Keys
                      </button>
                      {stripeOpen && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">Publishable Key</Label>
                            <div className="relative">
                              <Input type={showStripePub ? "text" : "password"} placeholder="pk_live_..." value={stripePublishable} onChange={(e) => setStripePublishable(e.target.value)} className="pr-10 font-mono text-sm" />
                              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-300" onClick={() => setShowStripePub((v) => !v)}>
                                {showStripePub ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                            {stripePublishable && !showStripePub && <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">{maskKey(stripePublishable)}</p>}
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">Secret Key</Label>
                            <div className="relative">
                              <Input type={showStripeSecret ? "text" : "password"} placeholder="sk_live_..." value={stripeSecret} onChange={(e) => setStripeSecret(e.target.value)} className="pr-10 font-mono text-sm" />
                              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-300" onClick={() => setShowStripeSecret((v) => !v)}>
                                {showStripeSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                            {stripeSecret && !showStripeSecret && <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">{maskKey(stripeSecret)}</p>}
                          </div>
                          <div className="p-3 bg-violet-50 rounded-lg border border-violet-100">
                            <p className="text-xs text-violet-700">Find your keys in the <span className="font-semibold">Stripe Dashboard → Developers → API Keys</span></p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </>
                )}
              </Card>

              {/* PayPal */}
              <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center">
                        <PayPalIcon />
                      </div>
                      <div>
                        <CardTitle className="text-base font-semibold text-gray-800 dark:text-gray-100">PayPal</CardTitle>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">PayPal & linked bank account payments</p>
                      </div>
                    </div>
                    <Switch checked={paypalEnabled} onCheckedChange={setPaypalEnabled} />
                  </div>
                </CardHeader>
                {paypalEnabled && (
                  <>
                    <Separator />
                    <CardContent className="pt-4">
                      <button
                        className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors mb-4"
                        onClick={() => setPaypalOpen((o) => !o)}
                      >
                        {paypalOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        {paypalOpen ? "Hide" : "Configure"} API Keys
                      </button>
                      {paypalOpen && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">Client ID</Label>
                            <div className="relative">
                              <Input type={showPaypalId ? "text" : "password"} placeholder="AYour-PayPal-Client-ID..." value={paypalClientId} onChange={(e) => setPaypalClientId(e.target.value)} className="pr-10 font-mono text-sm" />
                              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-300" onClick={() => setShowPaypalId((v) => !v)}>
                                {showPaypalId ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                            {paypalClientId && !showPaypalId && <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">{maskKey(paypalClientId)}</p>}
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">Secret</Label>
                            <div className="relative">
                              <Input type={showPaypalSecret ? "text" : "password"} placeholder="EYour-PayPal-Secret..." value={paypalSecret} onChange={(e) => setPaypalSecret(e.target.value)} className="pr-10 font-mono text-sm" />
                              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-300" onClick={() => setShowPaypalSecret((v) => !v)}>
                                {showPaypalSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                            {paypalSecret && !showPaypalSecret && <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">{maskKey(paypalSecret)}</p>}
                          </div>
                          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                            <p className="text-xs text-blue-700">Find your credentials in the <span className="font-semibold">PayPal Developer Dashboard → My Apps & Credentials</span></p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </>
                )}
              </Card>

              {/* COD */}
              <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-green-50 dark:bg-green-500/10 flex items-center justify-center">
                        <Truck className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-semibold text-gray-800 dark:text-gray-100">Cash on Delivery</CardTitle>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Pay when the order is delivered</p>
                      </div>
                    </div>
                    <Switch checked={codEnabled} onCheckedChange={setCodEnabled} />
                  </div>
                </CardHeader>
              </Card>

              {/* Paystack */}
              <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center">
                        <CreditCard className="h-4 w-4 text-teal-600" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-semibold text-gray-800 dark:text-gray-100">Paystack</CardTitle>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Popular payment gateway for Africa</p>
                      </div>
                    </div>
                    <Switch checked={paystackEnabled} onCheckedChange={setPaystackEnabled} />
                  </div>
                </CardHeader>
                {paystackEnabled && (
                  <>
                    <Separator />
                    <CardContent className="pt-4">
                      <button
                        className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors mb-4"
                        onClick={() => setPaystackOpen((o) => !o)}
                      >
                        {paystackOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        {paystackOpen ? "Hide" : "Configure"} API Keys
                      </button>
                      {paystackOpen && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Public Key</Label>
                            <div className="relative">
                              <Input type={showPaystackPublic ? "text" : "password"} placeholder="pk_live_..." value={paystackPublicKey} onChange={(e) => setPaystackPublicKey(e.target.value)} className="pr-10 font-mono text-sm" />
                              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" onClick={() => setShowPaystackPublic((v) => !v)}>
                                {showPaystackPublic ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                            {paystackPublicKey && !showPaystackPublic && <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">{maskKey(paystackPublicKey)}</p>}
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Secret Key</Label>
                            <div className="relative">
                              <Input type={showPaystackSecret ? "text" : "password"} placeholder="sk_live_..." value={paystackSecretKey} onChange={(e) => setPaystackSecretKey(e.target.value)} className="pr-10 font-mono text-sm" />
                              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" onClick={() => setShowPaystackSecret((v) => !v)}>
                                {showPaystackSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                            {paystackSecretKey && !showPaystackSecret && <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">{maskKey(paystackSecretKey)}</p>}
                          </div>
                          <div className="p-3 bg-teal-50 dark:bg-teal-500/10 rounded-lg border border-teal-100 dark:border-teal-500/20">
                            <p className="text-xs text-teal-700 dark:text-teal-400">Find your keys in the <span className="font-semibold">Paystack Dashboard → Settings → API Keys & Webhooks</span></p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </>
                )}
              </Card>

              {/* Wallet */}
              <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
                        <DollarSign className="h-4 w-4 text-amber-600" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-semibold text-gray-800 dark:text-gray-100">Wallet</CardTitle>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">In-app wallet balance payments</p>
                      </div>
                    </div>
                    <Switch checked={walletEnabled} onCheckedChange={setWalletEnabled} />
                  </div>
                </CardHeader>
              </Card>
            </>
          )}


          {/* ==================== CURRENCY SECTION ==================== */}
          {activeSection === "currency" && (
            <>
              <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-green-50 dark:bg-green-500/10 flex items-center justify-center">
                      <DollarSign className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold text-gray-800 dark:text-gray-100">Currency Settings</CardTitle>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Set the default currency for all prices site-wide</p>
                    </div>
                  </div>
                </CardHeader>
                <Separator />
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Default Currency</Label>
                      <select
                        value={siteConfig.currency || "USD"}
                        onChange={(e) => updateField("currency", e.target.value)}
                        className="w-full h-10 px-3 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      >
                        {ALL_CURRENCIES.map((c) => (
                          <option key={c} value={c}>{c} - {CURRENCY_SYMBOLS[c] || c}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-500/10 rounded-lg border border-green-100 dark:border-green-500/20">
                      <span className="text-2xl font-bold text-green-700 dark:text-green-400">{CURRENCY_SYMBOLS[siteConfig.currency || "USD"] || "$"}</span>
                      <div>
                        <p className="text-sm font-medium text-green-800 dark:text-green-300">{siteConfig.currency || "USD"}</p>
                        <p className="text-xs text-green-600 dark:text-green-400">Symbol: {CURRENCY_SYMBOLS[siteConfig.currency || "USD"] || "$"} &bull; All prices across the site will display in this currency</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}


          {/* ==================== LANGUAGE SECTION ==================== */}
          {activeSection === "language" && (
            <div className="space-y-6 max-w-3xl">
              {/* Current Language Banner */}
              <div className="bg-primary/5 border-2 border-primary/20 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-6 rounded overflow-hidden shadow-sm shrink-0">
                    <Image
                      src={`https://flagcdn.com/w40/${LANG_TO_COUNTRY[currentLang] || "gb"}.png`}
                      alt="Current language"
                      width={40}
                      height={30}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  </div>
                  <div>
                    <div className="text-xs text-primary font-medium">Current Language</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 notranslate">
                      {languageConfig.find((l) => l.name === currentLang)?.title || "English"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  value={langSearch}
                  onChange={(e) => setLangSearch(e.target.value)}
                  placeholder="Search languages..."
                  className="ps-10 h-11 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                />
              </div>

              {/* Language Grid */}
              {languageConfig.length === 0 ? (
                <div className="text-center py-12">
                  <Globe className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Language configuration is loading...</p>
                  <p className="text-gray-400 text-xs mt-1">Please refresh the page if languages don&apos;t appear.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-125 overflow-y-auto pe-1 notranslate">
                  {languageConfig
                    .filter((l) =>
                      l.title.toLowerCase().includes(langSearch.toLowerCase()) ||
                      l.name.toLowerCase().includes(langSearch.toLowerCase())
                    )
                    .map((lang) => {
                      const isSelected = currentLang === lang.name;
                      const cc = LANG_TO_COUNTRY[lang.name] || "gb";
                      return (
                        <button
                          key={lang.name}
                          type="button"
                          onClick={() => handleLangChange(lang.name)}
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
                                  src={`https://flagcdn.com/w40/${cc}.png`}
                                  alt={lang.title}
                                  width={40}
                                  height={30}
                                  className="w-full h-full object-cover"
                                  unoptimized
                                />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">{lang.title}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{lang.name}</div>
                              </div>
                            </div>
                            {isSelected && <Check className="h-5 w-5 text-primary shrink-0" />}
                          </div>
                        </button>
                      );
                    })}
                  {languageConfig.filter((l) =>
                    l.title.toLowerCase().includes(langSearch.toLowerCase()) ||
                    l.name.toLowerCase().includes(langSearch.toLowerCase())
                  ).length === 0 && (
                    <div className="col-span-full text-center py-8">
                      <p className="text-gray-500 text-sm">No languages found matching &quot;{langSearch}&quot;</p>
                    </div>
                  )}
                </div>
              )}

              <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-lg border border-blue-100 dark:border-blue-500/20">
                <p className="text-xs text-blue-700 dark:text-blue-400">
                  <span className="font-semibold">Note:</span> Selecting a language applies it site-wide via Google Translate. Users can also change from their dashboard settings.
                </p>
              </div>
            </div>
          )}


          {/* ==================== FOOTER & BRANDING SECTION ==================== */}
          {activeSection === "footer" && (
            <>
              {/* Header Logo */}
              <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-orange-50 flex items-center justify-center">
                      <ImageIcon className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold text-gray-800 dark:text-gray-100">Header Logo</CardTitle>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Upload the logo displayed in the header/navbar</p>
                    </div>
                  </div>
                </CardHeader>
                <Separator />
                <CardContent className="pt-4">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden bg-gray-50">
                      {siteConfig.headerLogo ? (
                        <Image src={siteConfig.headerLogo} alt="Header Logo" width={80} height={80} className="object-contain w-full h-full" />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-gray-300" />
                      )}
                    </div>
                    <div>
                      <input ref={headerLogoRef} type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleImageUpload(e.target.files[0], "headerLogo"); }} />
                      <Button variant="outline" size="sm" onClick={() => headerLogoRef.current?.click()} disabled={uploading === "headerLogo"}>
                        {uploading === "headerLogo" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                        Upload Logo
                      </Button>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP. Max 5MB.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Footer Logo & Description */}
              <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-teal-50 flex items-center justify-center">
                      <Layout className="h-4 w-4 text-teal-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold text-gray-800 dark:text-gray-100">Footer Branding</CardTitle>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Logo, description, and copyright for the footer</p>
                    </div>
                  </div>
                </CardHeader>
                <Separator />
                <CardContent className="pt-4 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden bg-gray-50">
                      {siteConfig.footerLogo ? (
                        <Image src={siteConfig.footerLogo} alt="Footer Logo" width={80} height={80} className="object-contain w-full h-full" />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-gray-300" />
                      )}
                    </div>
                    <div>
                      <input ref={footerLogoRef} type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleImageUpload(e.target.files[0], "footerLogo"); }} />
                      <Button variant="outline" size="sm" onClick={() => footerLogoRef.current?.click()} disabled={uploading === "footerLogo"}>
                        {uploading === "footerLogo" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                        Upload Footer Logo
                      </Button>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP. Max 5MB.</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">Footer Description</Label>
                    <Textarea value={siteConfig.footerDescription || ""} onChange={(e) => updateField("footerDescription", e.target.value)} placeholder="Short description for the footer area..." rows={2} className="resize-none" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">Copyright Text</Label>
                    <Input value={siteConfig.copyright || ""} onChange={(e) => updateField("copyright", e.target.value)} placeholder="FitHome. All rights reserved." />
                  </div>
                </CardContent>
              </Card>

              {/* Social Media Links */}
              <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-pink-50 flex items-center justify-center">
                        <LinkIcon className="h-4 w-4 text-pink-600" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-semibold text-gray-800 dark:text-gray-100">Social Media Links</CardTitle>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Add social media profiles with custom icons</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={addSocialLink}>
                      <Plus className="h-4 w-4 mr-1" /> Add
                    </Button>
                  </div>
                </CardHeader>
                <Separator />
                <CardContent className="pt-4 space-y-4">
                  {(!siteConfig.socialMediaLinks || siteConfig.socialMediaLinks.length === 0) && (
                    <p className="text-sm text-gray-400 text-center py-4">No social media links added yet. Click &quot;Add&quot; to start.</p>
                  )}
                  {(siteConfig.socialMediaLinks || []).map((link, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800">
                      {/* Icon upload */}
                      <div className="shrink-0">
                        <div className="w-12 h-12 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden bg-white cursor-pointer hover:border-primary/30 transition-colors"
                          onClick={() => {
                            const input = document.createElement("input");
                            input.type = "file";
                            input.accept = "image/*";
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0];
                              if (file) handleImageUpload(file, "socialMediaLinks", idx, "icon");
                            };
                            input.click();
                          }}
                        >
                          {uploading === `socialMediaLinks-${idx}` ? (
                            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                          ) : link.icon ? (
                            <Image src={link.icon} alt={link.name || "Social"} width={48} height={48} className="object-contain w-full h-full p-1" />
                          ) : (
                            <Upload className="h-4 w-4 text-gray-300" />
                          )}
                        </div>
                      </div>
                      {/* Fields */}
                      <div className="flex-1 space-y-2">
                        <Input placeholder="Name (e.g. Facebook)" value={link.name} onChange={(e) => updateSocialLink(idx, "name", e.target.value)} className="h-9 text-sm" />
                        <Input placeholder="URL (e.g. https://facebook.com/...)" value={link.url} onChange={(e) => updateSocialLink(idx, "url", e.target.value)} className="h-9 text-sm" />
                      </div>
                      <Button variant="ghost" size="icon" className="shrink-0 h-9 w-9 text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => removeSocialLink(idx)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* App Download Links */}
              <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-cyan-50 flex items-center justify-center">
                        <Globe className="h-4 w-4 text-cyan-600" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-semibold text-gray-800 dark:text-gray-100">App Download Links</CardTitle>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">App store links shown in footer (upload logos)</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={addAppLink}>
                      <Plus className="h-4 w-4 mr-1" /> Add
                    </Button>
                  </div>
                </CardHeader>
                <Separator />
                <CardContent className="pt-4 space-y-4">
                  {(!siteConfig.appDownloadLinks || siteConfig.appDownloadLinks.length === 0) && (
                    <p className="text-sm text-gray-400 text-center py-4">No app download links added yet.</p>
                  )}
                  {(siteConfig.appDownloadLinks || []).map((link, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800">
                      <div className="shrink-0">
                        <div className="w-12 h-12 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden bg-white cursor-pointer hover:border-primary/30 transition-colors"
                          onClick={() => {
                            const input = document.createElement("input");
                            input.type = "file";
                            input.accept = "image/*";
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0];
                              if (file) handleImageUpload(file, "appDownloadLinks", idx, "logo");
                            };
                            input.click();
                          }}
                        >
                          {uploading === `appDownloadLinks-${idx}` ? (
                            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                          ) : link.logo ? (
                            <Image src={link.logo} alt={link.name || "App"} width={48} height={48} className="object-contain w-full h-full p-1" />
                          ) : (
                            <Upload className="h-4 w-4 text-gray-300" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1 space-y-2">
                        <Input placeholder="Name (e.g. App Store)" value={link.name} onChange={(e) => updateAppLink(idx, "name", e.target.value)} className="h-9 text-sm" />
                        <Input placeholder="URL (e.g. https://apps.apple.com/...)" value={link.url} onChange={(e) => updateAppLink(idx, "url", e.target.value)} className="h-9 text-sm" />
                      </div>
                      <Button variant="ghost" size="icon" className="shrink-0 h-9 w-9 text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => removeAppLink(idx)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Footer Quick Links */}
              <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-indigo-50 flex items-center justify-center">
                        <LinkIcon className="h-4 w-4 text-indigo-600" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-semibold text-gray-800 dark:text-gray-100">Footer Quick Links</CardTitle>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Custom navigation links in the footer</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={addQuickLink}>
                      <Plus className="h-4 w-4 mr-1" /> Add
                    </Button>
                  </div>
                </CardHeader>
                <Separator />
                <CardContent className="pt-4 space-y-3">
                  {(!siteConfig.footerQuickLinks || siteConfig.footerQuickLinks.length === 0) && (
                    <p className="text-sm text-gray-400 text-center py-4">No quick links added yet.</p>
                  )}
                  {(siteConfig.footerQuickLinks || []).map((link, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <Input placeholder="Label" value={link.name} onChange={(e) => updateQuickLink(idx, "name", e.target.value)} className="h-9 text-sm flex-1" />
                      <Input placeholder="URL (e.g. /about)" value={link.url} onChange={(e) => updateQuickLink(idx, "url", e.target.value)} className="h-9 text-sm flex-1" />
                      <Button variant="ghost" size="icon" className="shrink-0 h-9 w-9 text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => removeQuickLink(idx)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Newsletter */}
              <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-amber-50 flex items-center justify-center">
                        <Globe className="h-4 w-4 text-amber-600" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-semibold text-gray-800 dark:text-gray-100">Newsletter</CardTitle>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Email subscription section in footer</p>
                      </div>
                    </div>
                    <Switch checked={siteConfig.newsletter?.enabled ?? true} onCheckedChange={(v) => updateNestedField("newsletter", "enabled", v)} />
                  </div>
                </CardHeader>
                {siteConfig.newsletter?.enabled && (
                  <>
                    <Separator />
                    <CardContent className="pt-4 space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">Title</Label>
                        <Input value={siteConfig.newsletter?.title || ""} onChange={(e) => updateNestedField("newsletter", "title", e.target.value)} placeholder="Stay Updated" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">Description</Label>
                        <Textarea value={siteConfig.newsletter?.description || ""} onChange={(e) => updateNestedField("newsletter", "description", e.target.value)} placeholder="Get fitness tips..." rows={2} className="resize-none" />
                      </div>
                    </CardContent>
                  </>
                )}
              </Card>
            </>
          )}


          {/* Save Button */}
          <div className="flex justify-end pt-2 pb-6">
            <Button onClick={handleSave} disabled={saving} className="gap-2 bg-primary hover:bg-primary/90 text-white px-8">
              {saving ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <Save className="h-4 w-4" />}
              {saving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
