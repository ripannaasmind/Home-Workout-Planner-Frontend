"use client";

import { useState } from "react";
import Link from "next/link";
import { Dumbbell, Facebook, Instagram, Twitter, Apple, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const footerLinks = {
  quickLinks: {
    title: "Quick Links",
    links: [
      { label: "Home", href: "/" },
      { label: "Features", href: "/features" },
      { label: "Workouts", href: "/workouts" },
      { label: "Testimonials", href: "/testimonials" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  workouts: {
    title: "Workouts",
    links: [
      { label: "Strength Training", href: "/workouts?category=strength" },
      { label: "Yoga", href: "/workouts?category=yoga" },
      { label: "Cardio", href: "/workouts?category=cardio" },
      { label: "HIIT", href: "/workouts?category=hiit" },
      { label: "Mobility", href: "/workouts?category=mobility" },
    ],
  },
  resources: {
    title: "Resources",
    links: [
      { label: "Help Center", href: "/help" },
      { label: "FAQs", href: "/faq" },
      { label: "Contact Us", href: "/contact" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
  support: {
    title: "Support",
    links: [
      { label: "Help Center", href: "/help" },
      { label: "FAQs", href: "/faq" },
      { label: "Contact Us", href: "/contact" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
};

const socialLinks = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Twitter, href: "#", label: "Twitter" },
];

export function Footer() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle subscription
    console.log("Subscribe:", email);
    setEmail("");
  };

  return (
    <footer className="bg-muted/50">
      {/* Top Section - Logo & Tagline */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-16">
          <div className="text-center">
            <Link href="/" className="inline-flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-primary">
                <Dumbbell className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">FitHome</span>
            </Link>
            <p className="text-sm sm:text-base lg:text-lg text-text-secondary max-w-md mx-auto">
              Your personal fitness companion for workouts anytime, anywhere.
            </p>
          </div>
        </div>
      </div>

      {/* Links Grid */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 lg:gap-12">
            {Object.values(footerLinks).map((section) => (
              <div key={section.title}>
                <h4 className="font-semibold text-sm sm:text-base text-foreground mb-3 sm:mb-4">
                  {section.title}
                </h4>
                <ul className="space-y-2 sm:space-y-3">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-xs sm:text-sm text-text-secondary hover:text-primary transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Newsletter & App Store */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          {/* Newsletter */}
          <div className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-border mb-6 sm:mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-8">
              <div className="text-center lg:text-left">
                <h3 className="font-bold text-base sm:text-lg lg:text-xl text-foreground mb-1">
                  Stay Updated
                </h3>
                <p className="text-xs sm:text-sm text-text-secondary">
                  Get fitness tips & exclusive workouts directly to your inbox.
                </p>
              </div>
              
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto lg:min-w-100">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 h-10 sm:h-11 text-sm bg-white"
                  required
                />
                <Button 
                  type="submit"
                  className="bg-primary hover:bg-primary-dark text-white h-10 sm:h-11 px-6 sm:px-8 text-sm sm:text-base whitespace-nowrap"
                >
                  Subscribe
                </Button>
              </form>
            </div>
          </div>

          {/* App Store Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button 
              variant="outline"
              size="lg"
              className="bg-gray-900 hover:bg-gray-800 text-white border-gray-900 h-12 sm:h-14 px-4 sm:px-6 rounded-xl gap-2 sm:gap-3"
            >
              <Apple className="h-5 w-5 sm:h-6 sm:w-6" />
              <div className="text-left">
                <div className="text-[9px] sm:text-[10px] opacity-80">Download on the</div>
                <div className="font-semibold text-sm sm:text-base -mt-0.5">App Store</div>
              </div>
            </Button>
            
            <Button 
              variant="outline"
              size="lg"
              className="bg-white hover:bg-gray-50 text-gray-900 border-gray-300 h-12 sm:h-14 px-4 sm:px-6 rounded-xl gap-2 sm:gap-3"
            >
              <Play className="h-5 w-5 sm:h-6 sm:w-6 fill-current text-primary" />
              <div className="text-left">
                <div className="text-[9px] sm:text-[10px] opacity-60">GET IT ON</div>
                <div className="font-semibold text-sm sm:text-base -mt-0.5">Google Play</div>
              </div>
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <p className="text-xs sm:text-sm text-text-secondary text-center sm:text-left order-2 sm:order-1">
            © {new Date().getFullYear()} FitHome. All rights reserved.
          </p>

          {/* Links & Social */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 order-1 sm:order-2">
            {/* Policy Links */}
            <div className="flex items-center gap-2 sm:gap-4">
              <Link href="/privacy" className="text-xs sm:text-sm text-text-secondary hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Separator orientation="vertical" className="h-4 bg-border" />
              <Link href="/terms" className="text-xs sm:text-sm text-text-secondary hover:text-primary transition-colors">
                Terms
              </Link>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gray-100 hover:bg-primary hover:text-white flex items-center justify-center transition-colors text-text-secondary"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
