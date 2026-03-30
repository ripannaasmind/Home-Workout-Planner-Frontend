"use client";

import { useState, useEffect } from "react";
import { loadStripe, type Stripe as StripeType } from "@stripe/stripe-js";
import { Elements, CardCvcElement, CardExpiryElement, CardNumberElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { CheckCircle2, CreditCard, Loader2, Plus } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { paymentApi, subscriptionApi } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { toast } from "sonner";

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
    }).catch(() => {}).finally(() => setLoading(false));
  }, [token]);

  const getPriceLabel = (plan: Plan) =>
    plan.price === 0
      ? "Free"
      : plan.period
      ? `${formatPrice(plan.price)}/${plan.period === "month" ? "mo" : plan.period}`
      : `${formatPrice(plan.price)} once`;

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

      {currentPlanId !== "free" && currentEndDate ? (
        <div className="rounded-xl border border-primary/20 bg-primary/10 p-4 text-sm text-primary">
          Your plan is active until {new Date(currentEndDate).toLocaleDateString()}. After expiry, workout access will lock until payment is completed again.
        </div>
      ) : null}

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
      <div className="rounded-2xl bg-white dark:bg-card border border-gray-200 dark:border-gray-800 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-800 dark:text-gray-100 font-semibold">Payment Methods</h3>
          <Button variant="outline" size="sm" className="border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:bg-gray-800 gap-1">
            <Plus className="h-3 w-3" /> Add card
          </Button>
        </div>
        {currentPlanId === "free" ? (
          <p className="text-gray-400 text-sm">No payment method on file. Upgrade to add a card.</p>
        ) : (
          <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
            <CreditCard className="h-6 w-6 text-primary" />
            <div>
              <p className="text-gray-800 dark:text-gray-100 text-sm font-medium">Visa ending in 4242</p>
              <p className="text-gray-500 dark:text-gray-400 text-xs">Expires 08/2028</p>
            </div>
            <Badge className="ml-auto bg-green-500/20 text-green-400 border-0">Default</Badge>
          </div>
        )}
      </div>

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
