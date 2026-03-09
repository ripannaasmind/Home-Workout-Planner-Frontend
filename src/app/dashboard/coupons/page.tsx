"use client";

import { useEffect, useState } from "react";
import {
  Tag,
  Copy,
  Check,
  ShoppingBag,
  Clock,
  Percent,
  DollarSign,
  Loader2,
  Ticket,
  AlertCircle,
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { promoApi, PromoCode } from "@/services/api";
import { cn } from "@/lib/utils";
import Link from "next/link";
import toast from "react-hot-toast";

function formatExpiry(dateStr: string | null): string {
  if (!dateStr) return "No Expiry";
  const d = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return "Expired";
  if (diffDays === 1) return "Expires tomorrow";
  if (diffDays <= 7) return `Expires in ${diffDays} days`;
  return `Expires ${d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
}

function isExpiringSoon(dateStr: string | null): boolean {
  if (!dateStr) return false;
  const diffDays = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return diffDays > 0 && diffDays <= 7;
}

function getRemainingUses(promo: PromoCode): string | null {
  if (promo.maxUses === null) return null;
  const remaining = promo.maxUses - promo.usedCount;
  if (remaining <= 10) return `${remaining} left`;
  return null;
}

function getDiscountLabel(promo: PromoCode): string {
  if (promo.discountType === "percentage") return `${promo.discountValue}% OFF`;
  return `$${promo.discountValue.toFixed(2)} OFF`;
}

// ----------------------------------------
// CouponCard
// ----------------------------------------
function CouponCard({ promo }: { promo: PromoCode }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(promo.code).then(() => {
      setCopied(true);
      toast.success(`Copied "${promo.code}"!`);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const expirySoon = isExpiringSoon(promo.expiresAt);
  const remainingUses = getRemainingUses(promo);
  const isPercentage = promo.discountType === "percentage";

  return (
    <div className="group relative flex flex-col sm:flex-row rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">

      {/* Left accent strip + discount badge */}
      <div className="flex sm:flex-col items-center justify-center gap-2 sm:gap-3 px-4 py-4 sm:px-5 sm:py-6 bg-primary/10 dark:bg-primary/15 sm:w-28 shrink-0">
        <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/20 text-primary">
          {isPercentage ? (
            <Percent className="w-5 h-5 sm:w-6 sm:h-6" />
          ) : (
            <DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />
          )}
        </div>
        <span className="text-primary font-extrabold text-base sm:text-xl leading-tight text-center">
          {getDiscountLabel(promo)}
        </span>
      </div>

      {/* Dashed divider */}
      <div className="hidden sm:flex items-center">
        <div className="w-px h-full border-l-2 border-dashed border-gray-200 dark:border-gray-700" />
      </div>
      <div className="sm:hidden h-px w-full border-t-2 border-dashed border-gray-200 dark:border-gray-700" />

      {/* Content */}
      <div className="flex flex-col flex-1 px-4 py-4 sm:px-5 sm:py-5 gap-3 min-w-0">

        {/* Top row: code + badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono font-bold text-base sm:text-lg text-gray-900 dark:text-white tracking-wider">
            {promo.code}
          </span>
          {expirySoon && (
            <Badge variant="outline" className="text-orange-500 border-orange-400 text-[10px] sm:text-xs">
              Ending Soon
            </Badge>
          )}
          {remainingUses && (
            <Badge variant="outline" className="text-red-500 border-red-400 text-[10px] sm:text-xs">
              {remainingUses}
            </Badge>
          )}
        </div>

        {/* Description */}
        {promo.description && (
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-snug">
            {promo.description}
          </p>
        )}

        {/* Meta row */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-500">
          {promo.minOrderAmount > 0 && (
            <span className="flex items-center gap-1">
              <ShoppingBag className="w-3 h-3" />
              Min. ${promo.minOrderAmount.toFixed(2)}
            </span>
          )}
          <span
            className={cn(
              "flex items-center gap-1",
              expirySoon && "text-orange-500 font-medium"
            )}
          >
            <Clock className="w-3 h-3" />
            {formatExpiry(promo.expiresAt)}
          </span>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 mt-1">
          <button
            onClick={handleCopy}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold border transition-all duration-150",
              copied
                ? "bg-green-500 text-white border-green-500"
                : "bg-primary/10 text-primary border-primary/30 hover:bg-primary hover:text-white hover:border-primary"
            )}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy Code
              </>
            )}
          </button>
          <Link
            href="/cart"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all duration-150"
          >
            <Tag className="w-3.5 h-3.5" />
            Use in Cart
          </Link>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------
// Coupons Page
// ----------------------------------------
export default function CouponsPage() {
  const [coupons, setCoupons] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    promoApi
      .getActive()
      .then((res) => setCoupons(res.data))
      .catch((err) => setError(err.message || "Failed to load coupons"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex-1 min-w-0">
      <DashboardHeader
        title="Available Coupons"
        description="Copy a coupon code and apply it at checkout to save on your order"
      />

      <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">

        {/* How to use banner */}
        <div className="flex items-start gap-3 p-3 sm:p-4 rounded-xl bg-primary/5 border border-primary/20">
          <Ticket className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            <span className="font-semibold text-primary">How to use:</span> Click{" "}
            <strong>Copy Code</strong> on any coupon, then go to your{" "}
            <Link href="/cart" className="underline text-primary hover:text-primary/80">
              Cart
            </Link>{" "}
            and paste it in the promo code field at checkout.
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-sm">Loading coupons…</span>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex items-center gap-3 p-4 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && coupons.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Tag className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <p className="font-semibold text-gray-700 dark:text-gray-300">No coupons available</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                Check back later for exclusive discount codes.
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/shop">Browse Shop</Link>
            </Button>
          </div>
        )}

        {/* Coupon list */}
        {!loading && !error && coupons.length > 0 && (
          <>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {coupons.length} coupon{coupons.length !== 1 ? "s" : ""} available
            </p>
            <div className="grid gap-4">
              {coupons.map((promo) => (
                <CouponCard key={promo._id} promo={promo} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
