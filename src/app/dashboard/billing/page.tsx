"use client";

import { CreditCard, Plus } from "lucide-react";
import { DashboardTopBar } from "@/components/dashboard/DashboardTopBar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const plans = [
  {
    name: "Free Plan",
    price: "$0/mo",
    features: ["5 workouts / month", "Basic analytics", "Community access"],
    current: false,
  },
  {
    name: "Pro Plan",
    price: "$9.99/mo",
    features: ["Unlimited workouts", "Advanced analytics", "Priority support", "Custom programs"],
    current: true,
  },
  {
    name: "Elite Plan",
    price: "$19.99/mo",
    features: ["Everything in Pro", "1-on-1 coaching", "Nutrition planning", "Exclusive content"],
    current: false,
  },
];

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <DashboardTopBar title="Billing" />
      <DashboardHeader title="Billing & Plans" description="Manage your subscription and payment methods" />

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-2xl border p-5 flex flex-col gap-3 ${
              plan.current
                ? "bg-primary/10 border-primary/30 ring-1 ring-primary/20"
                : "bg-white border-gray-200 shadow-sm"
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-gray-800 font-semibold">{plan.name}</h3>
              {plan.current && <Badge className="bg-primary text-white border-0">Current</Badge>}
            </div>
            <p className="text-2xl font-bold text-gray-800">{plan.price}</p>
            <ul className="space-y-1.5 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Button
              className={plan.current ? "bg-gray-100 text-gray-500 hover:bg-gray-200" : "bg-primary hover:bg-primary/90 text-white"}
              disabled={plan.current}
            >
              {plan.current ? "Active Plan" : "Upgrade"}
            </Button>
          </div>
        ))}
      </div>

      {/* Payment methods */}
      <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-800 font-semibold">Payment Methods</h3>
          <Button variant="outline" size="sm" className="border-gray-200 text-gray-600 hover:bg-gray-100 gap-1">
            <Plus className="h-3 w-3" /> Add card
          </Button>
        </div>
        <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
          <CreditCard className="h-6 w-6 text-primary" />
          <div>
            <p className="text-gray-800 text-sm font-medium">Visa ending in 4242</p>
            <p className="text-gray-500 text-xs">Expires 08/2028</p>
          </div>
          <Badge className="ml-auto bg-green-500/20 text-green-400 border-0">Default</Badge>
        </div>
      </div>
    </div>
  );
}
