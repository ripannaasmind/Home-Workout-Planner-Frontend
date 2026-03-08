"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Dumbbell, Facebook, Instagram, Twitter, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SocialLink {
  name: string;
  url: string;
  icon: string;
}

interface AppDownloadLink {
  name: string;
  url: string;
  logo: string;
}

interface QuickLink {
  name: string;
  url: string;
}

interface SiteConfigData {
  companyName: string;
  tagline: string;
  email: string;
  headerLogo: string;
  footerLogo: string;
  footerDescription: string;
  socialMediaLinks: SocialLink[];
  appDownloadLinks: AppDownloadLink[];
  footerQuickLinks: QuickLink[];
  newsletter: { enabled: boolean; title: string; description: string };
  copyright: string;
}

const defaultConfig: SiteConfigData = {
  companyName: "FitHome",
  tagline: "Your personal fitness companion for workouts anytime, anywhere.",
  email: "",
  headerLogo: "",
  footerLogo: "",
  footerDescription: "",
  socialMediaLinks: [],
  appDownloadLinks: [],
  footerQuickLinks: [],
  newsletter: {
    enabled: true,
    title: "Stay Updated",
    description: "Get fitness tips & exclusive workouts directly to your inbox.",
  },
  copyright: "FitHome. All rights reserved.",
};

const workoutLinks = [
  { label: "Strength Training", href: "/workouts?category=strength" },
  { label: "Yoga", href: "/workouts?category=yoga" },
  { label: "Cardio", href: "/workouts?category=cardio" },
  { label: "HIIT", href: "/workouts?category=hiit" },
  { label: "Mobility", href: "/workouts?category=mobility" },
];

const resourceLinks = [
  { label: "Help Center", href: "/help" },
  { label: "FAQs", href: "/faq" },
  { label: "Contact Us", href: "/contact" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

// Default social icon mapper
function SocialIcon({ name }: { name: string }) {
  const n = name.toLowerCase();
  if (n.includes("facebook")) return <Facebook className="w-3.5 h-3.5" />;
  if (n.includes("instagram")) return <Instagram className="w-3.5 h-3.5" />;
  if (n.includes("twitter") || n.includes("x")) return <Twitter className="w-3.5 h-3.5" />;
  return <span className="text-xs font-bold">{name.charAt(0).toUpperCase()}</span>;
}

export function Footer() {
  const [email, setEmail] = useState("");
  const [config, setConfig] = useState<SiteConfigData>(defaultConfig);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/site-config`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setConfig({ ...defaultConfig, ...res.data });
      })
      .catch(() => {});
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribed(true);
    setEmail("");
    setTimeout(() => setSubscribed(false), 3000);
  };

  const quickLinks = config.footerQuickLinks.length > 0
    ? config.footerQuickLinks.map((l) => ({ label: l.name, href: l.url }))
    : [
        { label: "Home", href: "/" },
        { label: "Features", href: "/features" },
        { label: "Workouts", href: "/workouts" },
        { label: "Testimonials", href: "/testimonials" },
        { label: "Pricing", href: "/pricing" },
      ];

  return (
    <footer className="bg-gray-950 text-gray-300">
      {/* Main grid */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8">

          {/* Brand column */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <Link href="/" className="inline-flex items-center gap-2 group w-fit">
              {config.footerLogo ? (
                <Image src={config.footerLogo} alt={config.companyName} width={36} height={36} className="rounded-lg object-contain" />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                  <Dumbbell className="h-5 w-5 text-white" />
                </div>
              )}
              <span className="text-xl font-bold text-white">{config.companyName}</span>
            </Link>

            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              {config.footerDescription || config.tagline}
            </p>

            {config.email && (
              <a href={`mailto:${config.email}`} className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-primary transition-colors">
                <Mail className="h-4 w-4" />
                {config.email}
              </a>
            )}

            {/* App download buttons */}
            {config.appDownloadLinks.length > 0 ? (
              <div className="flex flex-col xs:flex-row gap-2 mt-1">
                {config.appDownloadLinks.map((app, i) => (
                  <a
                    key={i}
                    href={app.url}
                    className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-3 py-2 transition-colors"
                  >
                    {app.logo ? (
                      <Image src={app.logo} alt={app.name} width={22} height={22} className="rounded" />
                    ) : null}
                    <div>
                      <div className="text-xs font-semibold text-white leading-tight">{app.name}</div>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="flex flex-col xs:flex-row gap-2 mt-1">
                <a href="#" className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-3 py-2 transition-colors">
                  <Image src="/Images/App_Store_(iOS).svg.png" alt="App Store" width={22} height={22} className="rounded" />
                  <div>
                    <div className="text-[9px] text-gray-400 leading-none">Download on the</div>
                    <div className="text-xs font-semibold text-white leading-tight mt-0.5">App Store</div>
                  </div>
                </a>
                <a href="#" className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-3 py-2 transition-colors">
                  <Image src="/Images/google_play.png" alt="Google Play" width={22} height={22} className="rounded" />
                  <div>
                    <div className="text-[9px] text-gray-400 leading-none">GET IT ON</div>
                    <div className="text-xs font-semibold text-white leading-tight mt-0.5">Google Play</div>
                  </div>
                </a>
              </div>
            )}
          </div>

          {/* Link columns */}
          <div className="lg:col-span-5 grid grid-cols-3 gap-6">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">Quick Links</h4>
              <ul className="space-y-2">
                {quickLinks.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm text-gray-400 hover:text-primary transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">Workouts</h4>
              <ul className="space-y-2">
                {workoutLinks.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm text-gray-400 hover:text-primary transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">Resources</h4>
              <ul className="space-y-2">
                {resourceLinks.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm text-gray-400 hover:text-primary transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Newsletter column */}
          {config.newsletter.enabled && (
            <div className="lg:col-span-3">
              <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">
                {config.newsletter.title}
              </h4>
              <p className="text-sm text-gray-400 mb-3 leading-relaxed">
                {config.newsletter.description}
              </p>
              {subscribed ? (
                <p className="text-sm text-primary font-medium">Thanks for subscribing!</p>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-9 text-sm bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-primary"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-white text-sm h-9"
                  >
                    Subscribe
                  </Button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-500 text-center sm:text-left">
              &copy; {new Date().getFullYear()} {config.copyright}
            </p>

            <div className="flex items-center gap-4">
              <Link href="/privacy" className="text-xs text-gray-500 hover:text-primary transition-colors">Privacy</Link>
              <Link href="/terms" className="text-xs text-gray-500 hover:text-primary transition-colors">Terms</Link>

              <div className="flex items-center gap-1.5">
                {config.socialMediaLinks.length > 0 ? (
                  config.socialMediaLinks.map((link, i) => (
                    <a key={i} href={link.url} aria-label={link.name} className="w-7 h-7 rounded-md bg-white/5 hover:bg-primary hover:text-white flex items-center justify-center transition-colors text-gray-400">
                      {link.icon ? (
                        <Image src={link.icon} alt={link.name} width={16} height={16} className="object-contain" />
                      ) : (
                        <SocialIcon name={link.name} />
                      )}
                    </a>
                  ))
                ) : (
                  <>
                    <a href="#" aria-label="Facebook" className="w-7 h-7 rounded-md bg-white/5 hover:bg-primary hover:text-white flex items-center justify-center transition-colors text-gray-400">
                      <Facebook className="w-3.5 h-3.5" />
                    </a>
                    <a href="#" aria-label="Instagram" className="w-7 h-7 rounded-md bg-white/5 hover:bg-primary hover:text-white flex items-center justify-center transition-colors text-gray-400">
                      <Instagram className="w-3.5 h-3.5" />
                    </a>
                    <a href="#" aria-label="Twitter" className="w-7 h-7 rounded-md bg-white/5 hover:bg-primary hover:text-white flex items-center justify-center transition-colors text-gray-400">
                      <Twitter className="w-3.5 h-3.5" />
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
