"use client";

import { useState } from "react";
import { formatRouteSummary } from "@/lib/routing/formatRouteSummary";
import type { RankedRouteResult } from "@/lib/routing/types";

type CopyRouteSummaryButtonProps = {
  route: RankedRouteResult;
  source: string;
  target: string;
  amount: number;
  warnings: string[];
};

export function CopyRouteSummaryButton({
  route,
  source,
  target,
  amount,
  warnings
}: CopyRouteSummaryButtonProps) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");

  async function copySummary() {
    const summary = formatRouteSummary({
      route,
      source,
      target,
      amount,
      warnings
    });

    try {
      await navigator.clipboard.writeText(summary);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }

    window.setTimeout(() => setStatus("idle"), 1800);
  }

  return (
    <div className="copy-action">
      <button className="secondary-button" type="button" onClick={copySummary}>
        Copy Summary
      </button>
      {status === "copied" ? <span className="copy-status success">Copied</span> : null}
      {status === "failed" ? <span className="copy-status error">Copy failed</span> : null}
    </div>
  );
}
