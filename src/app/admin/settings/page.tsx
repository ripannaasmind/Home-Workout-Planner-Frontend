"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { adminApi } from "@/services/api";
import { toast } from "sonner";
import {
  CreditCard,
  Truck,
  Eye,
  EyeOff,
  Save,
  Settings,
  ChevronDown,
  ChevronUp,
} from "lucide-react";


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


// ------- Admin Payment Settings Page -------
export default function AdminSettingsPage() {
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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


  // ------- Load settings on mount -------
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await adminApi.getPaymentSettings(token);
        const d = res.data;
        setStripeEnabled(d.stripe.enabled);
        setStripePublishable(d.stripe.publishableKey || "");
        setStripeSecret(d.stripe.secretKey || "");
        setPaypalEnabled(d.paypal.enabled);
        setPaypalClientId(d.paypal.clientId || "");
        setPaypalSecret(d.paypal.secret || "");
        setCodEnabled(d.cashOnDelivery.enabled);
      } catch {
        toast.error("Failed to load payment settings");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);


  // ------- Save settings -------
  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    try {
      await adminApi.updatePaymentSettings(
        {
          stripe: { enabled: stripeEnabled, publishableKey: stripePublishable, secretKey: stripeSecret },
          paypal: { enabled: paypalEnabled, clientId: paypalClientId, secret: paypalSecret },
          cashOnDelivery: { enabled: codEnabled },
        },
        token
      );
      toast.success("Payment settings saved");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Settings className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Payment Settings</h1>
          <p className="text-sm text-gray-500">Enable or disable payment methods and configure API keys</p>
        </div>
      </div>

      {}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-violet-50 flex items-center justify-center">
                <CreditCard className="h-4 w-4 text-violet-600" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-gray-800">Stripe</CardTitle>
                <p className="text-xs text-gray-500 mt-0.5">Credit & debit card payments</p>
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
                    <Label className="text-sm font-medium text-gray-700">Publishable Key</Label>
                    <div className="relative">
                      <Input
                        type={showStripePub ? "text" : "password"}
                        placeholder="pk_live_..."
                        value={stripePublishable}
                        onChange={(e) => setStripePublishable(e.target.value)}
                        className="pr-10 font-mono text-sm"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowStripePub((v) => !v)}
                      >
                        {showStripePub ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {stripePublishable && !showStripePub && (
                      <p className="text-xs text-gray-400 font-mono">{maskKey(stripePublishable)}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Secret Key</Label>
                    <div className="relative">
                      <Input
                        type={showStripeSecret ? "text" : "password"}
                        placeholder="sk_live_..."
                        value={stripeSecret}
                        onChange={(e) => setStripeSecret(e.target.value)}
                        className="pr-10 font-mono text-sm"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowStripeSecret((v) => !v)}
                      >
                        {showStripeSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {stripeSecret && !showStripeSecret && (
                      <p className="text-xs text-gray-400 font-mono">{maskKey(stripeSecret)}</p>
                    )}
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

      {}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center">
                <PayPalIcon />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-gray-800">PayPal</CardTitle>
                <p className="text-xs text-gray-500 mt-0.5">PayPal & linked bank account payments</p>
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
                    <Label className="text-sm font-medium text-gray-700">Client ID</Label>
                    <div className="relative">
                      <Input
                        type={showPaypalId ? "text" : "password"}
                        placeholder="AYour-PayPal-Client-ID..."
                        value={paypalClientId}
                        onChange={(e) => setPaypalClientId(e.target.value)}
                        className="pr-10 font-mono text-sm"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowPaypalId((v) => !v)}
                      >
                        {showPaypalId ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {paypalClientId && !showPaypalId && (
                      <p className="text-xs text-gray-400 font-mono">{maskKey(paypalClientId)}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Secret</Label>
                    <div className="relative">
                      <Input
                        type={showPaypalSecret ? "text" : "password"}
                        placeholder="EYour-PayPal-Secret..."
                        value={paypalSecret}
                        onChange={(e) => setPaypalSecret(e.target.value)}
                        className="pr-10 font-mono text-sm"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowPaypalSecret((v) => !v)}
                      >
                        {showPaypalSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {paypalSecret && !showPaypalSecret && (
                      <p className="text-xs text-gray-400 font-mono">{maskKey(paypalSecret)}</p>
                    )}
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

      {}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-green-50 flex items-center justify-center">
                <Truck className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-gray-800">Cash on Delivery</CardTitle>
                <p className="text-xs text-gray-500 mt-0.5">Pay when the order is delivered</p>
              </div>
            </div>
            <Switch checked={codEnabled} onCheckedChange={setCodEnabled} />
          </div>
        </CardHeader>
      </Card>

      {}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="gap-2 bg-primary hover:bg-primary/90 text-white px-8"
        >
          {saving ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}
