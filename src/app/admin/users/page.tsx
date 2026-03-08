"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Trash2, ShieldOff, ShieldCheck, Edit2, Loader2 } from "lucide-react";
import { adminApi, AdminUser } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";


// ------- Admin Users Page Component -------
export default function AdminUsersPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [editRole, setEditRole] = useState<string>("user");
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);

  const fetchUsers = useCallback(() => {
    if (!token) return;
    setLoading(true);
    adminApi
      .getUsers(token, {
        search: search || undefined,
        role: roleFilter !== "all" ? roleFilter : undefined,
      })
      .then((res) => setUsers(res.data))
      .catch(() => toast.error("Failed to load users"))
      .finally(() => setLoading(false));
  }, [token, search, roleFilter]);

  useEffect(() => {
    const t = setTimeout(fetchUsers, 300);
    return () => clearTimeout(t);
  }, [fetchUsers]);

  const handleEdit = (u: AdminUser) => {
    setEditUser(u);
    setEditRole(u.role);
  };

  const handleSaveEdit = async () => {
    if (!editUser || !token) return;
    setSaving(true);
    try {
      await adminApi.updateUser(editUser._id, { role: editRole }, token);
      toast.success("User updated");
      setEditUser(null);
      fetchUsers();
    } catch {
      toast.error("Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  const handleBan = async (u: AdminUser) => {
    if (!token) return;
    try {
      if (u.isBanned) {
        await adminApi.unbanUser(u._id, token);
        toast.success("User unbanned");
      } else {
        await adminApi.banUser(u._id, "Banned by admin", token);
        toast.success("User banned");
      }
      fetchUsers();
    } catch {
      toast.error("Action failed");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget || !token) return;
    try {
      await adminApi.deleteUser(deleteTarget._id, token);
      toast.success("User deleted");
      setDeleteTarget(null);
      fetchUsers();
    } catch {
      toast.error("Failed to delete user");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
        <p className="text-gray-500 text-sm mt-1">Manage all platform users</p>
      </div>

      {}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white border-gray-200"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-36 bg-white border-gray-200">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {}
      <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-20 text-gray-400">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Name</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Email</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Role</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Joined</th>
                  <th className="text-right px-4 py-3 text-gray-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800">{u.name}</td>
                    <td className="px-4 py-3 text-gray-600">{u.email}</td>
                    <td className="px-4 py-3">
                      <Badge className={u.role === "admin" ? "bg-primary/10 text-primary border-0" : "bg-gray-100 text-gray-600 border-0"}>
                        {u.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {u.isBanned ? (
                        <Badge className="bg-red-100 text-red-600 border-0">Banned</Badge>
                      ) : u.isEmailVerified ? (
                        <Badge className="bg-green-100 text-green-600 border-0">Active</Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-600 border-0">Unverified</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 rounded-lg text-gray-500 hover:bg-primary hover:text-white transition-colors"
                          onClick={() => handleEdit(u)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className={`h-8 w-8 p-0 rounded-lg transition-colors ${u.isBanned ? "text-green-600 hover:bg-green-500 hover:text-white" : "text-yellow-600 hover:bg-yellow-500 hover:text-white"}`}
                          onClick={() => handleBan(u)}
                        >
                          {u.isBanned ? <ShieldCheck className="h-4 w-4" /> : <ShieldOff className="h-4 w-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                          onClick={() => setDeleteTarget(u)}
                        >
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
      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-gray-700 text-sm mb-1 block">Name</Label>
              <p className="text-gray-800 font-medium">{editUser?.name}</p>
            </div>
            <div>
              <Label className="text-gray-700 text-sm mb-1 block">Email</Label>
              <p className="text-gray-600 text-sm">{editUser?.email}</p>
            </div>
            <div>
              <Label className="text-gray-700 text-sm mb-1.5 block">Role</Label>
              <Select value={editRole} onValueChange={setEditRole}>
                <SelectTrigger className="border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>Cancel</Button>
            <Button onClick={handleSaveEdit} disabled={saving} className="bg-primary text-white">
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600 text-sm">
            Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This will permanently delete all their data.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
