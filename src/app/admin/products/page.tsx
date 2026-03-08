"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Trash2, Edit2, Loader2, Search, Upload } from "lucide-react";
import { adminApi, productsApi, Product } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { uploadImage, validateImageFile } from "@/services/imageUploadService";

const emptyForm = {
  name: "",
  description: "",
  price: 0,
  originalPrice: 0,
  category: "",
  stock: 0,
  featured: false,
  image: "",
};


// ------- Admin Products Page Component -------
export default function AdminProductsPage() {
  const { token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const imageFileRef = useRef<HTMLInputElement>(null);

  const fetchProducts = useCallback(() => {
    if (!token) return;
    productsApi
      .getAll({ limit: 100 })
      .then((res) => setProducts(res.data))
      .catch(() => toast.error("Failed to load products"))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    fetchProducts();
    productsApi.getCategories().then((res) => setCategories(res.data)).catch(() => {});
  }, [fetchProducts]);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditTarget(p);
    setForm({
      name: p.name,
      description: p.description ?? "",
      price: p.price,
      originalPrice: p.originalPrice ?? 0,
      category: p.category,
      stock: p.stock ?? 0,
      featured: p.featured ?? false,
      image: p.image ?? "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    try {
      const id = editTarget?._id || editTarget?.id || "";
      if (editTarget && id) {
        await adminApi.updateProduct(id, form, token);
        toast.success("Product updated");
      } else {
        await adminApi.createProduct(form, token);
        toast.success("Product created");
      }
      setDialogOpen(false);
      fetchProducts();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget || !token) return;
    const id = deleteTarget._id || deleteTarget.id || "";
    try {
      await adminApi.deleteProduct(id, token);
      toast.success("Product deleted");
      setDeleteTarget(null);
      fetchProducts();
    } catch {
      toast.error("Failed to delete product");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Product Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage shop products</p>
        </div>
        <Button onClick={openCreate} className="bg-primary text-white gap-2">
          <Plus className="h-4 w-4" /> New Product
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-white border-gray-200"
        />
      </div>

      <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">No products found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Image</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Name</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Category</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Price</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Stock</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Featured</th>
                  <th className="text-right px-4 py-3 text-gray-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p._id || p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      {p.image ? (
                        <div className="relative h-12 w-12 flex-shrink-0 rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                          <Image src={p.image} alt={p.name} fill className="object-cover" unoptimized />
                        </div>
                      ) : (
                        <div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center border border-gray-200">
                          <span className="text-gray-400 text-xs">No img</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">{p.name}</td>
                    <td className="px-4 py-3 text-gray-600">{p.category}</td>
                    <td className="px-4 py-3 text-gray-800 font-medium">${p.price}</td>
                    <td className="px-4 py-3 text-gray-600">{p.stock ?? 0}</td>
                    <td className="px-4 py-3">
                      {p.featured ? (
                        <Badge className="bg-primary/10 text-primary border-0">Yes</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-500 border-0">No</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-lg border border-gray-200 text-gray-500 hover:bg-primary hover:text-white hover:border-primary transition-colors" onClick={() => openEdit(p)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-lg border border-gray-200 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors" onClick={() => setDeleteTarget(p)}>
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit Product" : "Create Product"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto">
            <div>
              <Label className="text-sm text-gray-700 mb-1.5 block">Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border-gray-200" />
            </div>
            <div>
              <Label className="text-sm text-gray-700 mb-1.5 block">Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="border-gray-200 text-sm" rows={3} />
            </div>
            <div>
              <Label className="text-sm text-gray-700 mb-1.5 block">Image</Label>
              <div className="flex flex-col items-center gap-3">
                <div
                  className="relative w-full h-44 rounded-xl border-2 border-dashed border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => imageFileRef.current?.click()}
                >
                  {form.image ? (
                    <Image src={form.image} alt="Product" fill className="object-cover" unoptimized />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <Upload className="h-8 w-8" />
                      <span className="text-sm">Click to upload image</span>
                    </div>
                  )}
                  {uploadingImage && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploadingImage}
                  onClick={() => imageFileRef.current?.click()}
                  className="w-full"
                >
                  {uploadingImage ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                  {form.image ? "Change Image" : "Upload Image"}
                </Button>
                <input
                  ref={imageFileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const validation = validateImageFile(file, 5);
                    if (!validation.isValid) { toast.error(validation.error); return; }
                    setUploadingImage(true);
                    try {
                      const url = await uploadImage(file);
                      setForm((prev) => ({ ...prev, image: url }));
                    } catch {
                      toast.error("Failed to upload image");
                    } finally {
                      setUploadingImage(false);
                      if (imageFileRef.current) imageFileRef.current.value = "";
                    }
                  }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm text-gray-700 mb-1.5 block">Category *</Label>
                {categories.length > 0 ? (
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger className="border-gray-200">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="border-gray-200" />
                )}
              </div>
              <div>
                <Label className="text-sm text-gray-700 mb-1.5 block">Stock</Label>
                <Input type="number" min={0} value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} className="border-gray-200" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm text-gray-700 mb-1.5 block">Price ($) *</Label>
                <Input type="number" min={0} step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="border-gray-200" />
              </div>
              <div>
                <Label className="text-sm text-gray-700 mb-1.5 block">Original Price ($)</Label>
                <Input type="number" min={0} step="0.01" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: Number(e.target.value) })} className="border-gray-200" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="featured"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="featured" className="text-sm text-gray-700 cursor-pointer">Featured product</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !form.name || !form.category} className="bg-primary text-white">
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {editTarget ? "Save Changes" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Delete Product</DialogTitle></DialogHeader>
          <p className="text-gray-600 text-sm">Are you sure you want to delete <strong>{deleteTarget?.name}</strong>?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
