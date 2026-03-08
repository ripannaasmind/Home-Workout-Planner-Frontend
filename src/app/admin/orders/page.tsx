"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ordersApi, type Order } from "@/services/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Package, Loader2, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";


const statusColor: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  processing: "bg-blue-100 text-blue-700 border-blue-200",
  shipped: "bg-purple-100 text-purple-700 border-purple-200",
  delivered: "bg-green-100 text-green-700 border-green-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
};

const paymentLabel: Record<string, string> = {
  stripe: "Card (Stripe)",
  paypal: "PayPal",
  cod: "Cash on Delivery",
};

const STATUS_OPTIONS = ["pending", "processing", "shipped", "delivered", "cancelled"] as const;


// ------- Admin Orders Page -------
export default function AdminOrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    ordersApi.getAllOrders(token)
      .then((res) => setOrders(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    if (!token) return;
    setUpdatingId(orderId);
    try {
      await ordersApi.updateStatus(orderId, newStatus, token);
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId ? { ...o, status: newStatus as Order["status"] } : o
        )
      );
      toast.success("Order status updated");
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Orders</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage all customer orders</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ShoppingBag className="h-14 w-14 text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-1">No orders yet</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Orders placed by customers will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const userInfo = typeof order.user === "object" ? order.user : null;
            return (
              <Card key={order._id} className="overflow-hidden">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3 mb-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Package className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-gray-400 font-mono">#{order._id.slice(-8).toUpperCase()}</p>
                        {userInfo && (
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{userInfo.name}</p>
                        )}
                        {userInfo && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{userInfo.email}</p>
                        )}
                        <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <Badge className={`text-xs border ${statusColor[order.status] ?? "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200"}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                      <span className="text-sm font-bold text-primary">${order.total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="divide-y divide-gray-50 dark:divide-gray-800 mb-3">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between items-center py-1.5 text-sm gap-2">
                        <span className="text-gray-700 dark:text-gray-200 truncate flex-1 min-w-0">{item.name} <span className="text-gray-400">×{item.quantity}</span></span>
                        <span className="font-medium shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400 flex-1">
                      {order.discount > 0 && <span className="text-green-600">Promo: -{order.promoCode} (-${order.discount.toFixed(2)})</span>}
                      <span>Shipping: {order.shipping === 0 ? "Free" : `$${order.shipping.toFixed(2)}`}</span>
                      <span>Tax: ${order.tax.toFixed(2)}</span>
                      <span>Payment: {paymentLabel[order.paymentMethod] ?? order.paymentMethod}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">Update status:</span>
                      <Select
                        value={order.status}
                        onValueChange={(val) => handleStatusChange(order._id, val)}
                        disabled={updatingId === order._id}
                      >
                        <SelectTrigger className="h-8 text-xs w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((s) => (
                            <SelectItem key={s} value={s} className="text-xs">
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {updatingId === order._id && (
                        <Button size="sm" disabled className="h-8 w-8 p-0">
                          <Loader2 className="h-3 w-3 animate-spin" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
