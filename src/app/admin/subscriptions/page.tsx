"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreditCard, Edit2, Loader2, DollarSign, Users, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { subscriptionApi, type SubscriptionPlan, type AdminSubscriber } from "@/services/api";
import toast from "react-hot-toast";


export default function AdminSubscriptionsPage() {
  const { token } = useAuth();
  const { formatPrice } = useTheme();
  const [tab, setTab] = useState<"plans" | "subscribers">("plans");

  // Plans state
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [editPlan, setEditPlan] = useState<SubscriptionPlan | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", price: 0, features: "", isActive: true, order: 0 });

  // Subscribers state
  const [subscribers, setSubscribers] = useState<AdminSubscriber[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(true);
  const [subFilter, setSubFilter] = useState<{ status?: string; plan?: string }>({});
  const [subPagination, setSubPagination] = useState({ page: 1, pages: 1, total: 0 });

  // Fetch Plans
  const fetchPlans = useCallback(async () => {
    if (!token) return;
    try {
      const res = await subscriptionApi.adminGetPlans(token);
      if (res.success) setPlans(res.data);
    } catch { toast.error("Failed to load plans"); }
    finally { setLoadingPlans(false); }
  }, [token]);

  // Fetch Subscribers
  const fetchSubscribers = useCallback(async (page = 1) => {
    if (!token) return;
    setLoadingSubs(true);
    try {
      const params: Record<string, string | number> = { page };
      if (subFilter.status) params.status = subFilter.status;
      if (subFilter.plan) params.plan = subFilter.plan;
      const res = await subscriptionApi.adminGetSubscribers(token, params as { status?: string; plan?: string; page?: number });
      if (res.success) {
        setSubscribers(res.data);
        setSubPagination(res.pagination);
      }
    } catch { toast.error("Failed to load subscribers"); }
    finally { setLoadingSubs(false); }
  }, [token, subFilter]);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);
  useEffect(() => { if (tab === "subscribers") fetchSubscribers(); }, [tab, fetchSubscribers]);

  const openEdit = (plan: SubscriptionPlan) => {
    setEditPlan(plan);
    setForm({
      name: plan.name,
      price: plan.price,
      features: plan.features.join("\n"),
      isActive: plan.isActive ?? true,
      order: plan.order ?? 0,
    });
  };

  const handleSave = async () => {
    if (!token || !editPlan) return;
    setSaving(true);
    try {
      const features = form.features.split("\n").map(f => f.trim()).filter(Boolean);
      await subscriptionApi.adminUpdatePlan(editPlan._id, {
        name: form.name, price: form.price, features, isActive: form.isActive, order: form.order,
      } as Partial<SubscriptionPlan>, token);
      toast.success("Plan updated");
      setEditPlan(null);
      fetchPlans();
    } catch { toast.error("Failed to update plan"); }
    finally { setSaving(false); }
  };

  const slugLabel: Record<string, string> = { monthly: "Monthly", yearly: "Yearly", lifetime: "Lifetime" };
  const statusColor: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-600",
    expired: "bg-gray-100 text-gray-500",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Subscriptions</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage plans and view subscribers</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 w-fit">
        <button onClick={() => setTab("plans")} className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${tab === "plans" ? "bg-white dark:bg-card text-primary shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
          <CreditCard className="h-4 w-4 inline mr-1.5" />Plans
        </button>
        <button onClick={() => setTab("subscribers")} className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${tab === "subscribers" ? "bg-white dark:bg-card text-primary shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
          <Users className="h-4 w-4 inline mr-1.5" />Subscribers
        </button>
      </div>

      {/* Plans Tab */}
      {tab === "plans" && (
        <>
          {loadingPlans ? (
            <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : plans.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p>No subscription plans found. They will be auto-created when users visit the plans page.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map((plan) => (
                <div key={plan._id} className={`rounded-2xl border p-5 flex flex-col gap-3 ${plan.isActive ? "bg-white dark:bg-card border-gray-200 dark:border-gray-800 shadow-sm" : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 opacity-60"}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-gray-800 dark:text-gray-100">{plan.name}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={plan.isActive ? "bg-green-100 text-green-700 border-0" : "bg-gray-100 text-gray-500 border-0"}>
                        {plan.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Badge className="bg-primary/10 text-primary border-0">{slugLabel[plan.slug || ""] || plan.slug}</Badge>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                    {formatPrice(plan.price)}
                    {plan.period && <span className="text-sm font-normal text-gray-400">/{plan.period === "month" ? "mo" : plan.period}</span>}
                  </p>
                  <ul className="space-y-1 flex-1">
                    {plan.features.map((f, i) => (
                      <li key={i} className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />{f}
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => openEdit(plan)}>
                    <Edit2 className="h-3.5 w-3.5" /> Edit Plan
                  </Button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Subscribers Tab */}
      {tab === "subscribers" && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <select
              className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-card px-3 py-2 text-sm"
              value={subFilter.status || ""}
              onChange={(e) => setSubFilter({ ...subFilter, status: e.target.value || undefined })}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="cancelled">Cancelled</option>
              <option value="expired">Expired</option>
            </select>
            <select
              className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-card px-3 py-2 text-sm"
              value={subFilter.plan || ""}
              onChange={(e) => setSubFilter({ ...subFilter, plan: e.target.value || undefined })}
            >
              <option value="">All Plans</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
              <option value="lifetime">Lifetime</option>
            </select>
            <span className="text-sm text-gray-400 ml-auto">{subPagination.total} total subscribers</span>
          </div>

          {loadingSubs ? (
            <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : subscribers.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p>No subscribers found.</p>
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-gray-500">User</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500">Plan</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500">Amount</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500">Start Date</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500">End Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {subscribers.map((sub) => (
                      <tr key={sub._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={sub.user?.avatar} />
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {sub.user?.name?.charAt(0)?.toUpperCase() || "?"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-gray-800 dark:text-gray-100">{sub.user?.name || "Deleted User"}</p>
                              <p className="text-xs text-gray-400">{sub.user?.email || "—"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <Crown className="h-3.5 w-3.5 text-yellow-500" />
                            <span className="capitalize font-medium text-gray-700 dark:text-gray-300">{sub.plan}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={`border-0 capitalize ${statusColor[sub.status] || "bg-gray-100 text-gray-500"}`}>
                            {sub.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">
                          {formatPrice(sub.amount || 0)}
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {new Date(sub.startDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {sub.endDate ? new Date(sub.endDate).toLocaleDateString() : "Lifetime"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {subPagination.pages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-transparent">
                  <p className="text-sm text-gray-400">
                    Page {subPagination.page} of {subPagination.pages}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={subPagination.page <= 1} onClick={() => fetchSubscribers(subPagination.page - 1)}>Previous</Button>
                    <Button variant="outline" size="sm" disabled={subPagination.page >= subPagination.pages} onClick={() => fetchSubscribers(subPagination.page + 1)}>Next</Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Edit Plan Dialog */}
      <Dialog open={!!editPlan} onOpenChange={(open) => !open && setEditPlan(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit {editPlan?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>Plan Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Pro Monthly" />
            </div>
            <div>
              <Label>Price</Label>
              <Input type="number" min={0} step={0.01} value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} />
            </div>
            <div>
              <Label>Features (one per line)</Label>
              <textarea
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 text-sm min-h-[120px] focus:ring-2 focus:ring-primary/30 outline-none"
                value={form.features}
                onChange={(e) => setForm({ ...form, features: e.target.value })}
                placeholder={"Full workout library\nUnlimited workouts\nAdvanced analytics"}
              />
            </div>
            <div>
              <Label>Display Order</Label>
              <Input type="number" min={0} value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} />
            </div>
            <Button className="w-full" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
