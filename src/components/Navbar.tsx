"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/store";

export default function Navbar() {
  const user = useStore((state) => state.user);
  const signOut = useStore((state) => state.signOut);
  const router = useRouter();

  function handleSignOut() {
    signOut();
    router.push("/login");
  }

  return (
    <nav className="bg-ust-black px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <Link
          href="/dashboard"
          className="text-ust-gold font-bold text-lg tracking-tight hover:opacity-90 transition-opacity"
        >
          NasaUSTe
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-6">
          <Link
            href="/dashboard"
            className="text-white text-sm hover:text-ust-gold transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/items"
            className="text-white text-sm hover:text-ust-gold transition-colors"
          >
            Browse Items
          </Link>
          <Link
            href="/report/lost"
            className="text-white text-sm hover:text-ust-gold transition-colors"
          >
            Report Lost
          </Link>
        </div>

        {/* User section */}
        {user !== null && (
          <div className="flex items-center gap-4">
            <span className="text-ust-gold text-sm font-medium">{user.name}</span>
            <button
              type="button"
              onClick={handleSignOut}
              className="text-white text-sm border border-white/40 rounded-lg px-3 py-1.5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
