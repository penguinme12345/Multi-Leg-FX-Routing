import type { ReviewStatus, RouteResult, RouteWarning } from "@/lib/routing/types";

export const LARGE_IMPROVEMENT_THRESHOLD_PERCENT = 5;

export const LARGE_IMPROVEMENT_WARNING_MESSAGE =
  "Large improvement detected. This route may reflect stale or inconsistent rates because it combines live fiat API rates with configured static stablecoin rates.";

export const LARGE_IMPROVEMENT_REVIEW_REASON =
  "Large improvement vs direct detected. Check rate sources before treating this route as executable.";

export function buildRouteWarnings(route: Pick<RouteResult, "differenceVsDirectPercent">): RouteWarning[] {
  if (
    route.differenceVsDirectPercent !== null &&
    route.differenceVsDirectPercent > LARGE_IMPROVEMENT_THRESHOLD_PERCENT
  ) {
    return [
      {
        severity: "review_required",
        message: LARGE_IMPROVEMENT_WARNING_MESSAGE
      }
    ];
  }

  return [];
}

export function getReviewStatus(
  route: Pick<RouteResult, "differenceVsDirectPercent" | "routeWarnings"> | null
): ReviewStatus {
  if (!route) {
    return {
      status: "clear",
      reason: "No recommended route is available for review."
    };
  }

  const hasReviewWarning = route.routeWarnings.some((warning) => warning.severity === "review_required");

  if (
    hasReviewWarning ||
    (route.differenceVsDirectPercent !== null &&
      route.differenceVsDirectPercent > LARGE_IMPROVEMENT_THRESHOLD_PERCENT)
  ) {
    return {
      status: "review_required",
      reason: LARGE_IMPROVEMENT_REVIEW_REASON
    };
  }

  return {
    status: "clear",
    reason: "No route-level consistency warnings were detected."
  };
}
