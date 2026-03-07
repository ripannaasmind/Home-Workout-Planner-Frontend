"use client";

import { useState, useEffect } from "react";
import { CreditCard, Plus, Loader2 } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { subscriptionApi } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

interface Plan {
  id: string;
  name: string;
  price: number;
  period: string | null;
  features: string[];
}

export default function BillingPage() {
  const { token } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentPlanId, setCurrentPlanId] = useState<string>("free");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    Promise.all([
      subscriptionApi.getPlans(token),
      subscriptionApi.getCurrent(token),
    ]).then(([plansRes, subRes]) => {
      setPlans(plansRes.data as unknown as Plan[]);
      const sub = subRes.data as unknown as { plan?: string; status?: string } | null;
      if (sub && sub.plan) {
        setCurrentPlanId(sub.plan as string);
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, [token]);

  const getPriceLabel = (plan: Plan) =>
    plan.price === 0
      ? "Free"
      : plan.period
      ? `$${plan.price}/${plan.period === "month" ? "mo" : plan.period}`
      : `$${plan.price} once`;

  return (
    <div className="space-y-6">
      <DashboardHeader title="Billing & Plans" description="Manage your subscription and payment methods" />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        /* Plans */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {plans.map((plan) => {
            const isCurrent = plan.id === currentPlanId;
            return (
              <div
                key={plan.id}
                className={`rounded-2xl border p-5 flex flex-col gap-3 ${
                  isCurrent
                    ? "bg-primary/10 border-primary/30 ring-1 ring-primary/20"
                    : "bg-white border-gray-200 shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-gray-800 font-semibold">{plan.name}</h3>
                  {isCurrent && <Badge className="bg-primary text-white border-0">Current</Badge>}
                </div>
                <p className="text-2xl font-bold text-gray-800">{getPriceLabel(plan)}</p>
                <ul className="space-y-1.5 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="text-sm text-gray-600 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className={isCurrent ? "bg-white text-gray-800 hover:bg-gray-200 border border-gray-300 cursor-pointer" : "bg-primary hover:bg-primary/90 text-white"}
                  disabled={isCurrent}
                >
                  {isCurrent ? "Active Plan" : "Upgrade"}
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* Payment methods */}
      <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-800 font-semibold">Payment Methods</h3>
          <Button variant="outline" size="sm" className="border-gray-200 text-gray-600 hover:bg-gray-100 gap-1">
            <Plus className="h-3 w-3" /> Add card
          </Button>
        </div>
        {currentPlanId === "free" ? (
          <p className="text-gray-400 text-sm">No payment method on file. Upgrade to add a card.</p>
        ) : (
          <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
            <CreditCard className="h-6 w-6 text-primary" />
            <div>
              <p className="text-gray-800 text-sm font-medium">Visa ending in 4242</p>
              <p className="text-gray-500 text-xs">Expires 08/2028</p>
            </div>
            <Badge className="ml-auto bg-green-500/20 text-green-400 border-0">Default</Badge>
          </div>
        )}
      </div>
    </div>
  );
}
