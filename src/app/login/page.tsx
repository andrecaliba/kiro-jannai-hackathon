"use client";

import { useRouter } from "next/navigation";
import { useStore } from "@/store";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function LoginPage() {
  const signIn = useStore((state) => state.signIn);
  const router = useRouter();

  function handleSignIn() {
    signIn();
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-ust-black flex items-center justify-center">
      <div className="flex flex-col items-center">
        {/* UST Logo Element */}
        <div className="w-24 h-24 rounded-full bg-ust-gold mb-8 flex items-center justify-center">
          <span className="text-ust-black font-bold text-2xl">UST</span>
        </div>

        {/* Login Card */}
        <Card className="p-8 w-full max-w-sm">
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            UST Lost and Found
          </h1>
          <p className="text-gray-700 text-sm mb-6">
            Sign in to report or manage lost and found items
          </p>

          <div className="flex flex-col gap-3">
            <Button variant="primary" onClick={handleSignIn} className="w-full">
              Continue with Google
            </Button>

            <button
              type="button"
              onClick={handleSignIn}
              className="border border-gray-300 text-gray-900 hover:bg-gray-50 rounded-lg px-4 py-2 w-full font-medium transition-colors cursor-pointer"
            >
              Continue with Demo Account
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
