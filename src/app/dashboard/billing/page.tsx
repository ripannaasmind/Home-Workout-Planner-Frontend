import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard, CheckCircle } from "lucide-react";

const transactions = [
    { id: "TXN-001", description: "Adjustable Dumbbell", date: "Apr 23, 2024", amount: "$89.00", status: "Paid" },
    { id: "TXN-002", description: "Whey Protein Powder", date: "Apr 18, 2024", amount: "$49.00", status: "Paid" },
    { id: "TXN-003", description: "Resistance Bands Set", date: "Apr 04, 2024", amount: "$39.00", status: "Refunded" },
    { id: "TXN-004", description: "Premium Yoga Mat + Foam Roller", date: "Mar 28, 2024", amount: "$129.00", status: "Paid" },
];

export default function BillingPage() {
    return (
        <div className="flex flex-col h-full bg-[#f4f7f4] rounded-3xl p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-semibold text-foreground">Billing</h1>
                <p className="text-muted-foreground mt-1">Manage your payment methods and view transaction history.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Payment method */}
                <div className="bg-white rounded-3xl p-6 border border-border/50 shadow-sm">
                    <h3 className="font-semibold text-foreground mb-4">Payment Methods</h3>
                    <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-2xl border border-border/40 mb-3">
                        <div className="bg-blue-600 text-white rounded-lg p-2">
                            <CreditCard className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">Visa •••• 4242</p>
                            <p className="text-xs text-muted-foreground">Expires 12/26</p>
                        </div>
                        <CheckCircle className="w-4 h-4 text-[#5d8b63]" />
                    </div>
                    <Button variant="outline" size="sm" className="rounded-full text-xs w-full mt-2">
                        + Add Payment Method
                    </Button>
                </div>

                {/* Billing summary */}
                <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-border/50 shadow-sm">
                    <h3 className="font-semibold text-foreground mb-4">Transaction History</h3>
                    <div className="divide-y divide-border/40">
                        {transactions.map((txn) => (
                            <div key={txn.id} className="flex items-center justify-between py-3">
                                <div>
                                    <p className="text-sm font-medium text-foreground">{txn.description}</p>
                                    <p className="text-xs text-muted-foreground">{txn.date} • {txn.id}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Badge className={`text-xs border ${txn.status === "Paid" ? "bg-[#5d8b63]/10 text-[#5d8b63] border-[#5d8b63]/20" : "bg-orange-50 text-orange-600 border-orange-200"}`}>
                                        {txn.status}
                                    </Badge>
                                    <span className="text-sm font-semibold text-foreground">{txn.amount}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
