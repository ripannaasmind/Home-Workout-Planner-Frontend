import Image from "next/image";
import { Button } from "@/components/ui/button";

export function RecentOrdersGrid() {
    const orders = [
        {
            id: "FH1834",
            date: "Apr 25, 2024",
            image: "/images/products/whey-protein.png",
            title: "Whey Protein Powder",
            price: "$49.00",
            status: "Shipped",
        },
        {
            id: "FH1817",
            date: "Apr 20, 2024",
            image: "/images/products/whey-protein-2.png", // reusing given assets
            title: "Whey Protein Powder",
            price: "$49.00",
            action: "Add to Cart", // Shows a button on the second one in reference
        }
    ];

    return (
        <div className="bg-[#f9fbf9] rounded-3xl p-6 border border-border/50 h-full">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Recent Orders</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-[calc(100%-2.5rem)]">
                {/* Order 1 */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-border/50 flex flex-col justify-between">
                    <div className="flex gap-4">
                        <div className="w-16 h-16 bg-neutral-100 rounded-xl overflow-hidden relative flex-shrink-0">
                            <Image src={orders[0].image} alt={orders[0].title} fill className="object-cover" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground text-sm">{orders[0].id}</h4>
                            <p className="text-xs text-muted-foreground mt-0.5">{orders[0].date}</p>
                        </div>
                    </div>
                    <div className="mt-4">
                        <Button size="sm" className="bg-[#5d8b63] hover:bg-[#4a724f] text-white rounded-full h-8 px-4 text-xs font-medium w-auto">
                            {orders[0].status}
                        </Button>
                    </div>
                </div>

                {/* Order 2 */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-border/50 flex flex-col justify-between">
                    <div className="flex gap-4">
                        <div className="w-16 h-16 bg-neutral-100 rounded-xl overflow-hidden relative flex-shrink-0">
                            <Image src={orders[1].image} alt={orders[1].title} fill className="object-cover" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground text-sm">{orders[1].title}</h4>
                            <p className="text-sm font-bold text-foreground mt-0.5">{orders[1].price}</p>
                        </div>
                    </div>
                    <div className="mt-4">
                        <Button size="sm" className="bg-[#5d8b63] hover:bg-[#4a724f] text-white rounded-full h-8 px-4 text-xs font-medium w-auto">
                            {orders[1].action}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
