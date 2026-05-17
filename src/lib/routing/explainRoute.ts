import { routeUsesStablecoin } from "@/lib/routing/calculateComplexity";
import type { RouteResult } from "@/lib/routing/types";

export function explainRoute(route: RouteResult, rank: number) {
  const isDirect = route.legs.length === 1;
  const usesStablecoin = routeUsesStablecoin(route.legs);
  const beatsDirect = route.differenceVsDirect !== null && route.differenceVsDirect > 0;
  const trailsDirect = route.differenceVsDirect !== null && route.differenceVsDirect < 0;

  if (rank === 1 && isDirect) {
    return "This route ranks #1 because it avoids extra conversion steps and flat fees while still delivering the strongest available final amount.";
  }

  if (rank === 1 && usesStablecoin && beatsDirect) {
    return "This route ranks #1 because the stablecoin leg creates a stronger all-in conversion path, and the added fees are outweighed by the final amount delivered.";
  }

  if (rank === 1 && beatsDirect) {
    return "This route ranks #1 because its improved multi-leg conversion path outweighs the additional fees at this transfer size.";
  }

  if (rank === 1) {
    return "This route ranks #1 because it delivers the highest final amount among the currently available provider paths.";
  }

  if (isDirect) {
    return "This route is operationally simple because it uses one provider and one conversion step, though another available path delivers more.";
  }

  if (usesStablecoin) {
    return "This route uses a stablecoin rail to access an alternate conversion path, but its added steps and fees keep it below the top route.";
  }

  if (trailsDirect) {
    return "This route has additional conversion steps, and after fees it delivers less than the best direct option.";
  }

  return "This route remains competitive because its provider sequence delivers a strong final amount after all leg-level fees are applied.";
}
