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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Edit2, Search, Tag, Loader2, Copy, Check } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { promoApi, type PromoCode } from "@/services/api";
import toast from "react-hot-toast";


// ------- Admin Promo Codes Page -------
export default function AdminPromoCodesPage() {
  const { token } = useAuth();
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<PromoCode | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PromoCode | null>(null);
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const emptyForm = {
    code: "",
    discountType: "percentage" as "percentage" | "fixed",
    discountValue: 10,
    minOrderAmount: 0,
    maxUses: "" as string | number,
    isActive: true,
    expiresAt: "",
    description: "",
  };
  const [form, setForm] = useState(emptyForm);

  const fetchCodes = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await promoApi.getAll(token);
      setPromoCodes(res.data);
    } catch {
      toast.error("Failed to load promo codes");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchCodes(); }, [fetchCodes]);

  const openCreate = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (p: PromoCode) => {
    setEditTarget(p);
    setForm({
      code: p.code,
      discountType: p.discountType,
      discountValue: p.discountValue,
      minOrderAmount: p.minOrderAmount,
      maxUses: p.maxUses ?? "",
      isActive: p.isActive,
      expiresAt: p.expiresAt ? p.expiresAt.slice(0, 10) : "",
      description: p.description || "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!token) return;
    if (!form.code.trim()) { toast.error("Code is required"); return; }
    if (!form.discountValue || form.discountValue <= 0) { toast.error("Discount value must be > 0"); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        maxUses: form.maxUses === "" ? null : Number(form.maxUses),
        expiresAt: form.expiresAt || null,
        code: String(form.code).toUpperCase().trim(),
      };
      if (editTarget) {
        await promoApi.update(editTarget._id, payload, token);
        toast.success("Promo code updated");
      } else {
        await promoApi.create(payload, token);
        toast.success("Promo code created");
      }
      setDialogOpen(false);
      fetchCodes();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget || !token) return;
    try {
      await promoApi.delete(deleteTarget._id, token);
      toast.success("Promo code deleted");
      setDeleteTarget(null);
      fetchCodes();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleToggleActive = async (p: PromoCode) => {
    if (!token) return;
    try {
      await promoApi.update(p._id, { isActive: !p.isActive }, token);
      setPromoCodes((prev) => prev.map((c) => c._id === p._id ? { ...c, isActive: !c.isActive } : c));
    } catch {
      toast.error("Failed to update");
    }
  };

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = promoCodes.filter((p) =>
    p.code.toLowerCase().includes(search.toLowerCase()) ||
    (p.description || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {}
      <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Promo Codes</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{promoCodes.length} total codes</p>
          </div>
          <Button onClick={openCreate} className="bg-primary hover:bg-primary/90 text-white gap-2">
            <Plus className="h-4 w-4" /> New Promo Code
          </Button>
        </div>
      </div>

      {}
      <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-50 dark:border-gray-800 flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search codes..." className="pl-9 h-9 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-800" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Tag className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No promo codes found</p>
            <p className="text-sm mt-1">Create your first promo code</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50/60">
                  <th className="text-left px-4 py-3 text-gray-500 dark:text-gray-400 font-medium">Code</th>
                  <th className="text-left px-4 py-3 text-gray-500 dark:text-gray-400 font-medium">Discount</th>
                  <th className="text-left px-4 py-3 text-gray-500 dark:text-gray-400 font-medium">Min Order</th>
                  <th className="text-left px-4 py-3 text-gray-500 dark:text-gray-400 font-medium">Uses</th>
                  <th className="text-left px-4 py-3 text-gray-500 dark:text-gray-400 font-medium">Expires</th>
                  <th className="text-left px-4 py-3 text-gray-500 dark:text-gray-400 font-medium">Status</th>
                  <th className="text-right px-4 py-3 text-gray-500 dark:text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p._id} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-gray-800 dark:text-gray-100 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-xs">{p.code}</span>
                        <button
                          onClick={() => copyCode(p.code, p._id)}
                          className="text-gray-400 hover:text-primary transition-colors"
                          title="Copy code"
                        >
                          {copiedId === p._id ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                      {p.description && <p className="text-xs text-gray-400 mt-0.5">{p.description}</p>}
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-200 font-medium">
                      {p.discountType === "percentage" ? `${p.discountValue}%` : `$${p.discountValue.toFixed(2)}`}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{p.minOrderAmount > 0 ? `$${p.minOrderAmount}` : "—"}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                      {p.usedCount}{p.maxUses !== null ? `/${p.maxUses}` : ""}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                      {p.expiresAt ? new Date(p.expiresAt).toLocaleDateString() : "Never"}
                    </td>
                    <td className="px-4 py-3">
                      <Switch checked={p.isActive} onCheckedChange={() => handleToggleActive(p)} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:bg-primary hover:text-white hover:border-primary transition-colors" onClick={() => openEdit(p)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-lg border border-gray-200 dark:border-gray-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-50 dark:hover:bg-red-500/100/100 hover:text-white hover:border-red-500 transition-colors" onClick={() => setDeleteTarget(p)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit Promo Code" : "Create Promo Code"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Code <span className="text-red-500">*</span></Label>
              <Input
                placeholder="e.g. SUMMER20"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className="font-mono uppercase"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Discount Type</Label>
                <Select value={form.discountType} onValueChange={(v) => setForm({ ...form, discountType: v as "percentage" | "fixed" })}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Discount Value <span className="text-red-500">*</span></Label>
                <Input
                  type="number"
                  min={0}
                  max={form.discountType === "percentage" ? 100 : undefined}
                  placeholder={form.discountType === "percentage" ? "10" : "5.00"}
                  value={form.discountValue}
                  onChange={(e) => setForm({ ...form, discountValue: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Min Order ($)</Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={form.minOrderAmount}
                  onChange={(e) => setForm({ ...form, minOrderAmount: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Max Uses (blank = unlimited)</Label>
                <Input
                  type="number"
                  min={1}
                  placeholder="Unlimited"
                  value={form.maxUses}
                  onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Expires At (optional)</Label>
              <Input
                type="date"
                value={form.expiresAt}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Description (optional)</Label>
              <Input
                placeholder="e.g. Summer sale discount"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="flex items-center gap-3">
              <Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} />
              <Label>Active (users can apply this code)</Label>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button className="flex-1 bg-primary text-white" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {editTarget ? "Save Changes" : "Create Code"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Promo Code</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
            Are you sure you want to delete <span className="font-mono font-bold">{deleteTarget?.code}</span>? This cannot be undone.
          </p>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white" onClick={handleDelete}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
