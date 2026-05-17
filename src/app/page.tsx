"use client";

import { useFxDashboardController } from "@/controllers/useFxDashboardController";
import { FxRouteDashboardView } from "@/views/FxRouteDashboardView";

export default function Home() {
  const controller = useFxDashboardController();

  return <FxRouteDashboardView controller={controller} />;
}
