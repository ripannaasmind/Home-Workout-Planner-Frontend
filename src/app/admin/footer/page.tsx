"use client";

import { useState, useEffect, useCallback } from "react";
import { Save, Globe, Smartphone, Mail, MapPin, Phone, Link as LinkIcon, LayoutTemplate, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const defaultConfig = {
  companyName: "FitHome",
  tagline: "Your personal fitness companion for workouts anytime, anywhere.",
  email: "",
  phone: "",
  address: "",
  appStoreUrl: "#",
  googlePlayUrl: "#",
  social: { facebook: "#", instagram: "#", twitter: "#" },
  newsletter: {
    enabled: true,
    title: "Stay Updated",
    description: "Get fitness tips & exclusive workouts directly to your inbox.",
  },
  copyright: "FitHome. All rights reserved.",
};

type Config = typeof defaultConfig;

export default function FooterSettingsPage() {
  const { token } = useAuth();
  const [config, setConfig] = useState<Config>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/admin/site-config`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setConfig((prev) => ({ ...prev, ...data.data }));
      }
    } catch {
      // use defaults
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/admin/site-config`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (data.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  const set = (path: string, value: unknown) => {
    setConfig((prev) => {
      const keys = path.split(".");
      if (keys.length === 1) return { ...prev, [path]: value };
      if (keys.length === 2) {
        const [k1, k2] = keys;
        return {
          ...prev,
          [k1]: {
            ...(prev[k1 as keyof Config] as Record<string, unknown>),
            [k2]: value,
          },
        };
      }
      return prev;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const SectionCard = ({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) => (
    <div className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
        <Icon className="h-4 w-4 text-primary" />
        <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-100">{title}</h3>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );

  const Field = ({ label, id, children }: { label: string; id: string; children: React.ReactNode }) => (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}</Label>
      {children}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Footer Settings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Customize site-wide footer content and links</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary hover:bg-primary/90 text-white gap-2"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : saved ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saved ? "Saved!" : saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* General */}
      <SectionCard icon={Globe} title="General">
        <Field label="Company Name" id="companyName">
          <Input
            id="companyName"
            value={config.companyName}
            onChange={(e) => set("companyName", e.target.value)}
            placeholder="FitHome"
          />
        </Field>
        <Field label="Tagline / Description" id="tagline">
          <Textarea
            id="tagline"
            value={config.tagline}
            onChange={(e) => set("tagline", e.target.value)}
            placeholder="Your fitness companion..."
            rows={2}
            className="resize-none"
          />
        </Field>
        <Field label="Copyright Text" id="copyright">
          <Input
            id="copyright"
            value={config.copyright}
            onChange={(e) => set("copyright", e.target.value)}
            placeholder="FitHome. All rights reserved."
          />
        </Field>
      </SectionCard>

      {/* Contact */}
      <SectionCard icon={Mail} title="Contact Information">
        <Field label="Email" id="email">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="email"
              type="email"
              value={config.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="hello@fithome.com"
              className="pl-9"
            />
          </div>
        </Field>
        <Field label="Phone" id="phone">
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="phone"
              value={config.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="pl-9"
            />
          </div>
        </Field>
        <Field label="Address" id="address">
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Textarea
              id="address"
              value={config.address}
              onChange={(e) => set("address", e.target.value)}
              placeholder="123 Fitness St, New York, NY"
              rows={2}
              className="pl-9 resize-none"
            />
          </div>
        </Field>
      </SectionCard>

      {/* App Download Links */}
      <SectionCard icon={Smartphone} title="App Download Links">
        <Field label="App Store URL" id="appStoreUrl">
          <div className="relative">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="appStoreUrl"
              value={config.appStoreUrl}
              onChange={(e) => set("appStoreUrl", e.target.value)}
              placeholder="https://apps.apple.com/..."
              className="pl-9"
            />
          </div>
        </Field>
        <Field label="Google Play URL" id="googlePlayUrl">
          <div className="relative">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="googlePlayUrl"
              value={config.googlePlayUrl}
              onChange={(e) => set("googlePlayUrl", e.target.value)}
              placeholder="https://play.google.com/store/..."
              className="pl-9"
            />
          </div>
        </Field>
      </SectionCard>

      {/* Social Links */}
      <SectionCard icon={LinkIcon} title="Social Media Links">
        <Field label="Facebook URL" id="facebook">
          <Input
            id="facebook"
            value={config.social.facebook}
            onChange={(e) => set("social.facebook", e.target.value)}
            placeholder="https://facebook.com/yourpage"
          />
        </Field>
        <Field label="Instagram URL" id="instagram">
          <Input
            id="instagram"
            value={config.social.instagram}
            onChange={(e) => set("social.instagram", e.target.value)}
            placeholder="https://instagram.com/yourhandle"
          />
        </Field>
        <Field label="Twitter / X URL" id="twitter">
          <Input
            id="twitter"
            value={config.social.twitter}
            onChange={(e) => set("social.twitter", e.target.value)}
            placeholder="https://twitter.com/yourhandle"
          />
        </Field>
      </SectionCard>

      {/* Newsletter */}
      <SectionCard icon={LayoutTemplate} title="Newsletter Section">
        <div className="flex items-center justify-between py-1">
          <div>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-100">Show Newsletter Signup</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Display email subscription form in footer</p>
          </div>
          <Switch
            checked={config.newsletter.enabled}
            onCheckedChange={(v) => set("newsletter.enabled", v)}
          />
        </div>
        {config.newsletter.enabled && (
          <>
            <Field label="Newsletter Title" id="nlTitle">
              <Input
                id="nlTitle"
                value={config.newsletter.title}
                onChange={(e) => set("newsletter.title", e.target.value)}
                placeholder="Stay Updated"
              />
            </Field>
            <Field label="Newsletter Description" id="nlDesc">
              <Textarea
                id="nlDesc"
                value={config.newsletter.description}
                onChange={(e) => set("newsletter.description", e.target.value)}
                placeholder="Get fitness tips..."
                rows={2}
                className="resize-none"
              />
            </Field>
          </>
        )}
      </SectionCard>
    </div>
  );
}
