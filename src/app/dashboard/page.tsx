"use client";

import { useRouter } from "next/navigation";
import { useStore } from "@/store";
import Button from "@/components/ui/Button";
import StatCard from "@/components/StatCard";
import ItemCard from "@/components/ItemCard";

export default function DashboardPage() {
  const router = useRouter();
  const items = useStore((state) => state.items);

  // Derived stats
  const totalItems = items.length;
  const lostItems = items.filter((item) => item.type === "lost").length;
  const foundItems = items.filter((item) => item.type === "found").length;
  const openItems = items.filter((item) => item.status === "open").length;

  // Recently lost: up to 4 most recently created lost items
  const recentlyLost = items
    .filter((item) => item.type === "lost")
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 4);

  // Recently found: up to 4 most recently created found items
  const recentlyFound = items
    .filter((item) => item.type === "found")
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-ust-black via-gray-900 to-gray-800 text-white py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-3">NasaUSTe</h1>
          <p className="text-gray-300 text-lg mb-8 max-w-xl mx-auto">
            Report lost items or help reunite found belongings with their owners
            across the UST campus.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              variant="danger"
              onClick={() => router.push("/report/lost")}
              className="px-6 py-2.5"
            >
              Report Lost
            </Button>
            <Button
              variant="primary"
              onClick={() => router.push("/report/found")}
              className="px-6 py-2.5"
            >
              Report Found
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/items")}
              className="px-6 py-2.5"
            >
              Browse All
            </Button>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">
        {/* Stats */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard label="Total Items" value={totalItems} />
            <StatCard
              label="Lost Items"
              value={lostItems}
              accent="text-red-500"
            />
            <StatCard
              label="Found Items"
              value={foundItems}
              accent="text-blue-500"
            />
            <StatCard
              label="Open Items"
              value={openItems}
              accent="text-green-500"
            />
          </div>
        </section>

        {/* Recently Lost Items */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Recently Lost Items
          </h2>
          {recentlyLost.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {recentlyLost.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No lost items reported yet.</p>
          )}
        </section>

        {/* Recently Found Items */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Recently Found Items
          </h2>
          {recentlyFound.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {recentlyFound.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">
              No found items reported yet.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
