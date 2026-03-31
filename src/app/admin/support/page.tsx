"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supportApi, type SupportTicket } from "@/services/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  HelpCircle,
  Loader2,
  MessageCircle,
  Trash2,
  Send,
  Clock,
  CheckCircle2,
  User,
} from "lucide-react";
import toast from "react-hot-toast";


const statusColor: Record<string, string> = {
  open: "bg-yellow-100 text-yellow-700 border-yellow-200",
  in_progress: "bg-blue-100 text-blue-700 border-blue-200",
  resolved: "bg-green-100 text-green-700 border-green-200",
  closed: "bg-gray-100 text-gray-700 border-gray-200",
};

const statusLabel: Record<string, string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

const categoryLabel: Record<string, string> = {
  general: "General",
  account: "Account",
  payment: "Payment",
  workout: "Workout",
  bug: "Bug",
  feature_request: "Feature Request",
  other: "Other",
};

const STATUS_OPTIONS = ["open", "in_progress", "resolved", "closed"] as const;
const CATEGORY_OPTIONS = ["general", "account", "payment", "workout", "bug", "feature_request", "other"] as const;


export default function AdminSupportPage() {
  const { token } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Reply dialog
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [replyTicket, setReplyTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);

  const fetchTickets = () => {
    if (!token) return;
    setLoading(true);
    const params: { status?: string; category?: string } = {};
    if (filterStatus !== "all") params.status = filterStatus;
    if (filterCategory !== "all") params.category = filterCategory;

    supportApi
      .getAllTickets(token, params)
      .then((res) => setTickets(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, filterStatus, filterCategory]);

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    if (!token) return;
    setUpdatingId(ticketId);
    try {
      await supportApi.updateStatus(ticketId, newStatus, token);
      setTickets((prev) =>
        prev.map((t) =>
          t._id === ticketId ? { ...t, status: newStatus as SupportTicket["status"] } : t
        )
      );
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (ticketId: string) => {
    if (!token) return;
    const confirmed = window.confirm("Delete this support ticket?");
    if (!confirmed) return;

    setDeletingId(ticketId);
    try {
      await supportApi.delete(ticketId, token);
      setTickets((prev) => prev.filter((t) => t._id !== ticketId));
      toast.success("Ticket deleted");
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  const openReplyDialog = (ticket: SupportTicket) => {
    setReplyTicket(ticket);
    setReplyText(ticket.adminReply || "");
    setReplyDialogOpen(true);
  };

  const handleReply = async () => {
    if (!token || !replyTicket || !replyText.trim()) return;
    setReplying(true);
    try {
      const res = await supportApi.reply(replyTicket._id, replyText.trim(), token);
      setTickets((prev) =>
        prev.map((t) => (t._id === replyTicket._id ? res.data : t))
      );
      setReplyDialogOpen(false);
      toast.success("Reply sent");
    } catch {
      toast.error("Failed to send reply");
    } finally {
      setReplying(false);
    }
  };

  const openCount = tickets.filter((t) => t.status === "open").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Support Tickets
          {openCount > 0 && (
            <span className="ml-2 text-sm font-medium text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full">
              {openCount} open
            </span>
          )}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Manage user support requests
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40 h-9 text-sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>
                {statusLabel[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-44 h-9 text-sm">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORY_OPTIONS.map((c) => (
              <SelectItem key={c} value={c}>
                {categoryLabel[c]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : tickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <HelpCircle className="h-14 w-14 text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-1">
            No support tickets
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Support tickets from users will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {tickets.map((ticket) => {
            const userInfo =
              typeof ticket.user === "object" ? ticket.user : null;

            return (
              <Card key={ticket._id} className="overflow-hidden">
                <CardContent className="p-4 sm:p-5">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3 mb-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        {ticket.status === "resolved" ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : ticket.status === "in_progress" ? (
                          <Clock className="h-4 w-4 text-blue-600" />
                        ) : (
                          <MessageCircle className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                          {ticket.subject}
                        </p>
                        {userInfo && (
                          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <User className="h-3 w-3" />
                            <span className="truncate">{userInfo.name}</span>
                            <span className="text-gray-300">·</span>
                            <span className="truncate">{userInfo.email}</span>
                          </div>
                        )}
                        <p className="text-xs text-gray-400">
                          {new Date(ticket.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {" · "}
                          {categoryLabel[ticket.category] || ticket.category}
                        </p>
                      </div>
                    </div>
                    <Badge
                      className={`text-xs border shrink-0 ${statusColor[ticket.status] ?? "bg-gray-100 text-gray-700"}`}
                    >
                      {statusLabel[ticket.status] || ticket.status}
                    </Badge>
                  </div>

                  {/* Message */}
                  <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap mb-3 line-clamp-4">
                    {ticket.message}
                  </p>

                  {/* Admin Reply (if exists) */}
                  {ticket.adminReply && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-lg p-3 mb-3">
                      <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-1">
                        Your Reply
                      </p>
                      <p className="text-sm text-green-800 dark:text-green-300 whitespace-pre-wrap line-clamp-3">
                        {ticket.adminReply}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2 flex-1">
                      <Select
                        value={ticket.status}
                        onValueChange={(val) => handleStatusChange(ticket._id, val)}
                        disabled={updatingId === ticket._id}
                      >
                        <SelectTrigger className="h-8 text-xs w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((s) => (
                            <SelectItem key={s} value={s} className="text-xs">
                              {statusLabel[s]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {updatingId === ticket._id && (
                        <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 gap-1 text-xs"
                        onClick={() => openReplyDialog(ticket)}
                      >
                        <Send className="h-3 w-3" />
                        {ticket.adminReply ? "Edit Reply" : "Reply"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(ticket._id)}
                        disabled={deletingId === ticket._id}
                      >
                        {deletingId === ticket._id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Reply Dialog */}
      <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Reply to: {replyTicket?.subject}
            </DialogTitle>
          </DialogHeader>
          {replyTicket && (
            <div className="space-y-4 mt-2">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">User&apos;s message:</p>
                <p className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap">
                  {replyTicket.message}
                </p>
              </div>
              <div className="space-y-2">
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply..."
                  rows={5}
                />
              </div>
              <Button
                onClick={handleReply}
                disabled={replying || !replyText.trim()}
                className="w-full gap-2"
              >
                {replying ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Send Reply
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
