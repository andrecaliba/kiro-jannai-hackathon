"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/store";
import { isProtected } from "@/lib/constants";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

interface PageProps {
  params: Promise<{ id: string }>;
}

const GENERIC_LABELS: Record<string, string> = {
  Electronics: "Lost electronic device",
  "Bags and Wallets": "Lost bag or wallet",
  "ID and Cards": "Lost ID or card",
  Accessories: "Lost accessory",
  Documents: "Lost document",
};

function getGenericLabel(category: string): string {
  return GENERIC_LABELS[category] ?? "Lost item";
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function ItemDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { items, user, updateItemStatus, submitClaimAnswer } = useStore();

  const [claimFlowOpen, setClaimFlowOpen] = useState(false);
  const [claimAnswer, setClaimAnswer] = useState("");
  const [claimAnswerError, setClaimAnswerError] = useState("");
  const [submitConfirmed, setSubmitConfirmed] = useState(false);

  const item = items.find((i) => i.id === id);

  if (!item) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Item not found</h1>
        <p className="text-gray-500 mb-6">
          The item you are looking for does not exist or may have been removed.
        </p>
        <Link
          href="/items"
          className="inline-block bg-ust-gold text-ust-black font-medium px-5 py-2.5 rounded-lg hover:bg-yellow-400 transition-colors"
        >
          Back to Items
        </Link>
      </div>
    );
  }

  const protected_ = isProtected(item);
  const displayTitle = protected_ ? getGenericLabel(item.category) : item.title;

  const showClaimButton =
    user !== null &&
    item.status === "open" &&
    item.secret_detail !== undefined &&
    item.claim_answer === undefined &&
    user.email !== item.contact_email;

  function handleMarkClaimed() {
    updateItemStatus(item!.id, "claimed");
  }

  function handleMarkResolved() {
    updateItemStatus(item!.id, "resolved");
    router.refresh();
  }

  function handleSubmitAnswer() {
    const trimmedAnswer = claimAnswer.trim();
    if (!trimmedAnswer) {
      setClaimAnswerError("Please enter an answer before submitting.");
      return;
    }
    submitClaimAnswer(item!.id, trimmedAnswer, user!.name);
    setClaimFlowOpen(false);
    setSubmitConfirmed(true);
  }

  function handleCancelClaim() {
    setClaimFlowOpen(false);
    setClaimAnswer("");
    setClaimAnswerError("");
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Hero image / placeholder */}
      <div className="w-full h-64 md:h-80 rounded-2xl overflow-hidden mb-6">
        {!protected_ && item.image_url ? (
          <img
            src={item.image_url}
            alt={displayTitle}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-ust-gold to-yellow-300" />
        )}
      </div>

      {/* Badges row */}
      <div className="flex flex-wrap gap-2 mb-4">
        {item.type === "lost" ? (
          <Badge variant="red">Lost</Badge>
        ) : (
          <Badge variant="blue">Found</Badge>
        )}
        {item.status === "open" && <Badge variant="green">Open</Badge>}
        {item.status === "claimed" && <Badge variant="amber">Claimed</Badge>}
        {item.status === "resolved" && <Badge variant="gray">Resolved</Badge>}
        {protected_ && <Badge variant="amber">Protected</Badge>}
        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full self-center">
          {item.category}
        </span>
      </div>

      {/* Title */}
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
        {displayTitle}
      </h1>

      {/* Privacy notice block */}
      {protected_ && (
        <div
          className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4"
          data-testid="privacy-notice"
        >
          <p className="text-amber-800 text-sm font-medium mb-1">
            Details hidden for privacy
          </p>
          <p className="text-amber-700 text-sm">
            The specific details of this item are kept private to protect the
            owner. If you believe this item is yours, please contact the
            reporter directly. Ownership will be verified privately before the
            item is returned.
          </p>
        </div>
      )}

      {/* Description (only for unprotected items) */}
      {!protected_ && (
        <p className="text-gray-600 mb-6 leading-relaxed">{item.description}</p>
      )}

      {/* 2x2 info grid */}
      <Card className="p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
              Location
            </p>
            <p className="text-gray-800 text-sm">{item.location}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
              Date
            </p>
            <p className="text-gray-800 text-sm">{formatDate(item.date)}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
              Reporter
            </p>
            <p className="text-gray-800 text-sm">{item.reporter_name}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
              Contact Email
            </p>
            <a
              href={`mailto:${item.contact_email}`}
              className="text-ust-gold hover:underline text-sm break-all"
            >
              {item.contact_email}
            </a>
          </div>
        </div>
      </Card>

      {/* Verification Panel — shown to signed-in users when a claim has been submitted */}
      {user !== null && item.claim_answer !== undefined && (
        <Card className="p-5 mb-6 border-l-4 border-amber-500">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Claim Submitted
          </h2>
          <div className="space-y-2">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                Claimant
              </p>
              <p className="text-gray-800 text-sm">{item.claimant_name}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                Answer
              </p>
              <p className="text-gray-800 text-sm">{item.claim_answer}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Status action buttons — only for signed-in users viewing open items */}
      {user !== null && item.status === "open" && (
        <div className="flex flex-wrap gap-3">
          <Button variant="primary" onClick={handleMarkClaimed}>
            Mark as Claimed
          </Button>
          <button
            type="button"
            onClick={handleMarkResolved}
            className="px-4 py-2 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700 transition-colors cursor-pointer"
          >
            Mark as Resolved
          </button>
          {showClaimButton && (
            <Button variant="primary" onClick={() => setClaimFlowOpen(true)}>
              Claim This Item
            </Button>
          )}
        </div>
      )}

      {/* Claim Flow panel */}
      {claimFlowOpen && user !== null && (
        <Card className="p-5 mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Verify Your Ownership
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            <strong>Secret detail:</strong> {item.secret_detail}
          </p>
          <div className="mb-4">
            <label htmlFor="claimAnswer" className="block text-sm font-medium text-gray-700 mb-1">
              Your Answer
            </label>
            <textarea
              id="claimAnswer"
              value={claimAnswer}
              onChange={(e) => {
                setClaimAnswer(e.target.value);
                setClaimAnswerError("");
              }}
              rows={3}
              className="border border-gray-300 rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-ust-gold"
              placeholder="Enter your answer..."
            />
            {claimAnswerError && (
              <p className="text-red-500 text-xs mt-1">{claimAnswerError}</p>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="primary" onClick={handleSubmitAnswer}>
              Submit Answer
            </Button>
            <button
              type="button"
              onClick={handleCancelClaim}
              className="px-4 py-2 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </Card>
      )}

      {/* Confirmation message after successful claim submission */}
      {submitConfirmed && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mt-6">
          <p className="text-green-800 text-sm font-medium mb-1">
            Answer Submitted
          </p>
          <p className="text-green-700 text-sm">
            Your answer has been recorded. The reporter will review it and be in touch to confirm ownership.
          </p>
        </div>
      )}
    </div>
  );
}
