"use client";

import { useState, useEffect } from "react";
import { loadStripe, type Stripe as StripeType } from "@stripe/stripe-js";
import { Elements, CardCvcElement, CardExpiryElement, CardNumberElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { CheckCircle2, CreditCard, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { paymentApi, subscriptionApi } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { toast } from "sonner";

interface PaymentMethodsConfig {
  stripe: { enabled: boolean; publishableKey?: string };
  paypal: { enabled: boolean; clientId?: string };
  cashOnDelivery: { enabled: boolean };
}

interface Plan {
  id: string;
  name: string;
  price: number;
  period: string | null;
  features: string[];
}

interface PaymentIntentData {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
  plan: { slug: string; name: string; price: number; period: string | null };
}

interface StripeCardFormProps {
  clientSecret: string;
  disabled: boolean;
  onConfirmed: (paymentIntentId: string) => Promise<void>;
}

function StripeCardForm({ clientSecret, disabled, onConfirmed }: StripeCardFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  const elementStyle = {
    style: {
      base: {
        color: "#111827",
        fontSize: "15px",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        "::placeholder": { color: "#9ca3af" },
      },
      invalid: { color: "#dc2626" },
    },
  };

  const handlePay = async () => {
    if (!stripe || !elements || disabled || submitting) return;
    const cardNumber = elements.getElement(CardNumberElement);
    if (!cardNumber) {
      toast.error("Card field is not ready yet");
      return;
    }

    setSubmitting(true);
    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardNumber },
      });

      if (error) {
        toast.error(error.message || "Payment failed");
        return;
      }

      if (!paymentIntent || paymentIntent.status !== "succeeded") {
        toast.error("Payment not completed. Please try again.");
        return;
      }

      await onConfirmed(paymentIntent.id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Card Number</label>
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 bg-white dark:bg-gray-900">
          <CardNumberElement options={{ ...elementStyle, showIcon: true }} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Expiry</label>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 bg-white dark:bg-gray-900">
            <CardExpiryElement options={elementStyle} />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">CVC</label>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 bg-white dark:bg-gray-900">
            <CardCvcElement options={elementStyle} />
          </div>
        </div>
      </div>
      <Button className="w-full bg-primary hover:bg-primary/90 text-white" onClick={handlePay} disabled={disabled || submitting}>
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
        {submitting ? "Processing..." : "Pay & Activate Plan"}
      </Button>
    </div>
  );
}


// ------- Billing Page Component -------
export default function BillingPage() {
  const { token } = useAuth();
  const { formatPrice } = useTheme();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentPlanId, setCurrentPlanId] = useState<string>("free");
  const [currentEndDate, setCurrentEndDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [creatingPlanId, setCreatingPlanId] = useState<string | null>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [checkoutPlan, setCheckoutPlan] = useState<Plan | null>(null);
  const [paymentIntentData, setPaymentIntentData] = useState<PaymentIntentData | null>(null);
  const [stripePromise, setStripePromise] = useState<Promise<StripeType | null> | null>(null);
  const [activating, setActivating] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodsConfig | null>(null);
  const [renewingPlanId, setRenewingPlanId] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    Promise.all([
      subscriptionApi.getPlans(token),
      subscriptionApi.getCurrent(token),
      paymentApi.getPublicMethods(),
    ]).then(([plansRes, subRes, paymentRes]) => {
      setPlans(plansRes.data as unknown as Plan[]);
      const sub = subRes.data as unknown as { plan?: string | { slug?: string; id?: string }; status?: string; endDate?: string | null } | null;
      const planId =
        typeof sub?.plan === "string"
          ? sub.plan
          : sub?.plan?.slug || sub?.plan?.id || "free";

      if (sub && planId) {
        setCurrentPlanId(planId);
        setCurrentEndDate(sub.endDate || null);
      } else {
        setCurrentPlanId("free");
        setCurrentEndDate(null);
      }

      const stripeKey =
        (paymentRes.data.stripe?.enabled && paymentRes.data.stripe?.publishableKey)
          ? paymentRes.data.stripe.publishableKey
          : process.env.NEXT_PUBLIC_STRIPE_KEY || "";
      if (stripeKey) {
        setStripePromise(loadStripe(stripeKey));
      }

      setPaymentMethods({
        stripe: { enabled: paymentRes.data.stripe?.enabled ?? false, publishableKey: paymentRes.data.stripe?.publishableKey },
        paypal: { enabled: paymentRes.data.paypal?.enabled ?? false, clientId: paymentRes.data.paypal?.clientId },
        cashOnDelivery: { enabled: paymentRes.data.cashOnDelivery?.enabled ?? false },
      });
    }).catch(() => {}).finally(() => setLoading(false));
  }, [token]);

  const getPriceLabel = (plan: Plan) =>
    plan.price === 0
      ? "Free"
      : plan.period
      ? `${formatPrice(plan.price)}/${plan.period === "month" ? "mo" : plan.period}`
      : `${formatPrice(plan.price)} once`;

  const getDaysUntilExpiry = () => {
    if (!currentEndDate) return null;
    const diff = new Date(currentEndDate).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const isExpired = () => {
    if (!currentEndDate) return false;
    return new Date(currentEndDate) <= new Date();
  };

  const handleRenewClick = async () => {
    const plan = plans.find((p) => p.id === currentPlanId);
    if (!plan) return;
    setRenewingPlanId(plan.id);
    await handleUpgradeClick(plan);
    setRenewingPlanId(null);
  };

  const handleUpgradeClick = async (plan: Plan) => {
    if (!token) {
      toast.error("Please log in to continue");
      return;
    }
    if (plan.id === "free" || plan.id === currentPlanId) return;

    if (!stripePromise) {
      toast.error("Stripe is not configured right now. Please contact admin.");
      return;
    }

    setCreatingPlanId(plan.id);
    try {
      const paymentRes = await subscriptionApi.createPayment(plan.id, token);
      setCheckoutPlan(plan);
      setPaymentIntentData(paymentRes.data);
      setPaymentOpen(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to start payment");
    } finally {
      setCreatingPlanId(null);
    }
  };

  const handlePaymentConfirmed = async (paymentIntentId: string) => {
    if (!token || !checkoutPlan) return;

    setActivating(true);
    try {
      await subscriptionApi.confirmPayment(checkoutPlan.id, paymentIntentId, token);

      const current = await subscriptionApi.getCurrent(token);
      const sub = current.data as unknown as { plan?: string | { slug?: string; id?: string }; endDate?: string | null } | null;
      const planId =
        typeof sub?.plan === "string"
          ? sub.plan
          : sub?.plan?.slug || sub?.plan?.id || checkoutPlan.id;

      setCurrentPlanId(planId);
      setCurrentEndDate(sub?.endDate || null);
      setPaymentOpen(false);
      toast.success("Payment successful. Premium unlocked!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to activate subscription");
    } finally {
      setActivating(false);
    }
  };

  return (
    <div className="space-y-6">
      <DashboardHeader title="Billing & Plans" description="Manage your subscription and payment methods" />

      {currentPlanId !== "free" && currentEndDate ? (() => {
        const days = getDaysUntilExpiry();
        const expired = isExpired();
        return (
          <div className={`rounded-xl border p-4 flex items-center justify-between gap-4 ${
            expired
              ? "border-red-400/40 bg-red-400/10 text-red-600 dark:text-red-400"
              : days !== null && days <= 7
              ? "border-yellow-400/40 bg-yellow-400/10 text-yellow-600 dark:text-yellow-400"
              : "border-primary/20 bg-primary/10 text-primary"
          }`}>
            <div className="flex items-center gap-2 text-sm">
              {expired || (days !== null && days <= 7) ? <AlertCircle className="h-4 w-4 shrink-0" /> : <CheckCircle2 className="h-4 w-4 shrink-0" />}
              {expired
                ? `Your plan expired on ${new Date(currentEndDate).toLocaleDateString()}. Renew to restore access.`
                : `Your plan is active until ${new Date(currentEndDate).toLocaleDateString()}${days !== null && days <= 7 ? ` — ${days} day${days !== 1 ? "s" : ""} remaining` : ""}.`}
            </div>
            {(expired || (days !== null && days <= 7)) && (
              <Button
                size="sm"
                className="shrink-0 bg-primary hover:bg-primary/90 text-white"
                onClick={handleRenewClick}
                disabled={renewingPlanId !== null}
              >
                {renewingPlanId ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                {renewingPlanId ? "Preparing..." : "Renew"}
              </Button>
            )}
          </div>
        );
      })() : null}

      {!loading && !stripePromise ? (
        <div className="rounded-xl border border-yellow-400/40 bg-yellow-400/10 p-4 text-sm text-yellow-600 dark:text-yellow-400">
          Payment gateway is not configured yet. Please contact the admin to enable payments.
        </div>
      ) : null}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {plans.map((plan) => {
            const isCurrent = plan.id === currentPlanId;
            return (
              <div
                key={plan.id}
                className={`rounded-2xl border p-5 flex flex-col gap-3 ${
                  isCurrent
                    ? "bg-primary/10 border-primary/30 ring-1 ring-primary/20"
                    : "bg-white dark:bg-card border-gray-200 dark:border-gray-800 shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-gray-800 dark:text-gray-100 font-semibold">{plan.name}</h3>
                  {isCurrent && <Badge className="bg-primary text-white border-0">Current</Badge>}
                </div>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{getPriceLabel(plan)}</p>
                <ul className="space-y-1.5 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className={isCurrent ? "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200" : "bg-primary hover:bg-primary/90 text-white"}
                  disabled={isCurrent || creatingPlanId === plan.id || (!isCurrent && plan.price > 0 && !stripePromise)}
                  onClick={() => handleUpgradeClick(plan)}
                >
                  {creatingPlanId === plan.id ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {isCurrent ? "Active Plan" : creatingPlanId === plan.id ? "Preparing Payment" : "Upgrade"}
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {}
      {loading ? (
        <div className="rounded-2xl bg-white dark:bg-card border border-gray-200 dark:border-gray-800 shadow-sm p-5 animate-pulse">
          <div className="h-4 w-36 rounded bg-gray-200 dark:bg-gray-700 mb-4" />
          <div className="flex flex-wrap gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                <div className="h-5 w-5 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="space-y-1.5">
                  <div className="h-3 w-32 rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-2.5 w-24 rounded bg-gray-200 dark:bg-gray-700" />
                </div>
                <div className="ml-2 h-5 w-12 rounded-full bg-gray-200 dark:bg-gray-700" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-white dark:bg-card border border-gray-200 dark:border-gray-800 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-800 dark:text-gray-100 font-semibold">Payment Methods</h3>
          </div>
          {!paymentMethods || (!paymentMethods.stripe.enabled && !paymentMethods.paypal.enabled && !paymentMethods.cashOnDelivery.enabled) ? (
            <p className="text-gray-400 text-sm">No payment methods configured. Contact admin.</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {paymentMethods.stripe.enabled && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-gray-800 dark:text-gray-100 text-sm font-medium">Credit / Debit Card</p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">Powered by Stripe</p>
                  </div>
                  <Badge className="ml-2 bg-green-500/20 text-green-600 dark:text-green-400 border-0">Active</Badge>
                </div>
              )}
              {paymentMethods.paypal.enabled && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                  <span className="text-blue-500 font-bold text-base">PP</span>
                  <div>
                    <p className="text-gray-800 dark:text-gray-100 text-sm font-medium">PayPal</p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">Available for store orders</p>
                  </div>
                  <Badge className="ml-2 bg-green-500/20 text-green-600 dark:text-green-400 border-0">Active</Badge>
                </div>
              )}
              {paymentMethods.cashOnDelivery.enabled && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500 text-base">💵</span>
                  <div>
                    <p className="text-gray-800 dark:text-gray-100 text-sm font-medium">Cash on Delivery</p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">Available for store orders</p>
                  </div>
                  <Badge className="ml-2 bg-green-500/20 text-green-600 dark:text-green-400 border-0">Active</Badge>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <Dialog open={paymentOpen} onOpenChange={(open) => { if (!activating) setPaymentOpen(open); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Subscription Payment</DialogTitle>
            <DialogDescription>
              {checkoutPlan
                ? `${checkoutPlan.name} - ${getPriceLabel(checkoutPlan)}`
                : "Complete payment to activate your plan."}
            </DialogDescription>
          </DialogHeader>

          {stripePromise && paymentIntentData?.clientSecret ? (
            <Elements stripe={stripePromise}>
              <StripeCardForm
                clientSecret={paymentIntentData.clientSecret}
                disabled={activating}
                onConfirmed={handlePaymentConfirmed}
              />
            </Elements>
          ) : (
            <div className="text-sm text-red-500">Unable to initialize payment. Please try again.</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
