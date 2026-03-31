"use client";

import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { useAuth } from "@/context/AuthContext";
import { supportApi, type SupportTicket } from "@/services/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { HelpCircle, Loader2, Plus, MessageCircle, Clock, CheckCircle2 } from "lucide-react";
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

const CATEGORIES = [
  { value: "general", label: "General" },
  { value: "account", label: "Account" },
  { value: "payment", label: "Payment" },
  { value: "workout", label: "Workout" },
  { value: "bug", label: "Bug Report" },
  { value: "feature_request", label: "Feature Request" },
  { value: "other", label: "Other" },
];


export default function SupportPage() {
  const { token } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("general");

  useEffect(() => {
    if (!token) return;
    supportApi
      .getMyTickets(token)
      .then((res) => setTickets(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const handleSubmit = async () => {
    if (!token || !subject.trim() || !message.trim()) return;
    setSubmitting(true);
    try {
      const res = await supportApi.create({ subject: subject.trim(), message: message.trim(), category }, token);
      setTickets((prev) => [res.data, ...prev]);
      setSubject("");
      setMessage("");
      setCategory("general");
      setDialogOpen(false);
      toast.success("Support ticket submitted!");
    } catch {
      toast.error("Failed to submit ticket");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <DashboardHeader
          title="Support"
          description="Get help from our support team"
        />
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Submit Support Ticket</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief description of your issue"
                  maxLength={200}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your issue in detail..."
                  rows={5}
                  maxLength={3000}
                />
              </div>
              <Button
                onClick={handleSubmit}
                disabled={submitting || !subject.trim() || !message.trim()}
                className="w-full"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Submit Ticket
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : tickets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <HelpCircle className="h-14 w-14 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-1">No tickets yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Need help? Submit a support ticket and we&apos;ll get back to you.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <Card key={ticket._id} className="overflow-hidden">
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
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
                      <p className="text-xs text-gray-400">
                        {new Date(ticket.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                        {" · "}
                        {CATEGORIES.find((c) => c.value === ticket.category)?.label || ticket.category}
                      </p>
                    </div>
                  </div>
                  <Badge
                    className={`text-xs border shrink-0 ${statusColor[ticket.status] ?? "bg-gray-100 text-gray-700"}`}
                  >
                    {statusLabel[ticket.status] || ticket.status}
                  </Badge>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap mb-3">
                  {ticket.message}
                </p>

                {ticket.adminReply && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-lg p-3 mt-2">
                    <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-1">Admin Reply</p>
                    <p className="text-sm text-green-800 dark:text-green-300 whitespace-pre-wrap">
                      {ticket.adminReply}
                    </p>
                    {ticket.repliedAt && (
                      <p className="text-xs text-green-500 mt-2">
                        {new Date(ticket.repliedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
