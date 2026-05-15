import { NextRequest, NextResponse } from "next/server";
import { ProviderConfigError, loadProviders } from "@/lib/providers";
import { buildEdges } from "@/lib/routing/buildEdges";
import { collectSupportedCurrencies, findTopRoutes } from "@/lib/routing/findTopRoutes";
import type { RoutesResponse } from "@/lib/routing/types";

export const dynamic = "force-dynamic";

type ValidatedRequest = {
  source: string;
  target: string;
  amount: number;
};

export async function POST(request: NextRequest) {
  const parsedBody = await parseJson(request);

  if (!parsedBody.ok) {
    return jsonError("Request body must be valid JSON.", 400);
  }

  const validation = validateRequest(parsedBody.body);

  if (!validation.ok) {
    return jsonError(validation.error, 400);
  }

  const { source, target, amount } = validation.value;

  try {
    const providers = await loadProviders();
    const edgeResult = await buildEdges(providers, source, target);
    const supportedCurrencies = collectSupportedCurrencies(edgeResult.edges);

    if (!supportedCurrencies.has(source) || !supportedCurrencies.has(target)) {
      return jsonError(
        `Unsupported or unavailable currency. ${source} and ${target} must appear in provider rates.`,
        400,
        edgeResult.warnings
      );
    }

    const routes = findTopRoutes(source, target, amount, edgeResult.edges);
    const response: RoutesResponse = {
      source,
      target,
      amount,
      routes,
      warnings: edgeResult.warnings,
      message: routes.length === 0 ? `No valid routes found for ${source} to ${target}.` : undefined
    };

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof ProviderConfigError) {
      return jsonError(error.message, 500);
    }

    return jsonError("Unexpected route calculation error.", 500);
  }
}

export function GET() {
  return NextResponse.json({
    message: "POST source, target, and amount to calculate the top FX routes."
  });
}

async function parseJson(request: NextRequest): Promise<{ ok: true; body: unknown } | { ok: false }> {
  try {
    return {
      ok: true,
      body: await request.json()
    };
  } catch {
    return {
      ok: false
    };
  }
}

function validateRequest(body: unknown): { ok: true; value: ValidatedRequest } | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Request body must be an object." };
  }

  const source = readCurrency((body as Record<string, unknown>).source);
  const target = readCurrency((body as Record<string, unknown>).target);
  const rawAmount = (body as Record<string, unknown>).amount;
  const amount = typeof rawAmount === "number" ? rawAmount : Number(rawAmount);

  if (!source) {
    return { ok: false, error: "Source currency is required." };
  }

  if (!target) {
    return { ok: false, error: "Target currency is required." };
  }

  if (source === target) {
    return { ok: false, error: "Source and target currencies must be different." };
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, error: "Amount must be a positive number." };
  }

  return {
    ok: true,
    value: {
      source,
      target,
      amount
    }
  };
}

function readCurrency(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().toUpperCase();
}

function jsonError(error: string, status: number, warnings: string[] = []) {
  return NextResponse.json(
    {
      error,
      warnings,
      routes: []
    },
    { status }
  );
}
