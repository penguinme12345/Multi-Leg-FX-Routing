import { NextRequest, NextResponse } from "next/server";
import { createInvalidJsonRouteError, handleRoutesRequest } from "@/controllers/routesController";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const parsedBody = await parseJson(request);

  if (!parsedBody.ok) {
    return NextResponse.json(createInvalidJsonRouteError(), { status: 400 });
  }

  const result = await handleRoutesRequest(parsedBody.body);
  return NextResponse.json(result.body, { status: result.status });
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
