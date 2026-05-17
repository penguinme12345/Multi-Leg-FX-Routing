import {
  calculateRoutesResponse,
  createRouteErrorBody,
  type RouteCalculationResponse
} from "@/lib/routing/calculateRoutes";

export async function handleRoutesRequest(body: unknown): Promise<RouteCalculationResponse> {
  return calculateRoutesResponse(body);
}

export function createInvalidJsonRouteError() {
  return createRouteErrorBody("Request body must be valid JSON.", 400);
}

export { createRouteErrorBody };
