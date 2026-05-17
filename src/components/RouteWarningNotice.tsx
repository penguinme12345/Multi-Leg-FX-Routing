import type { RouteWarning } from "@/lib/routing/types";

type RouteWarningNoticeProps = {
  warnings: RouteWarning[];
};

export function RouteWarningNotice({ warnings }: RouteWarningNoticeProps) {
  if (warnings.length === 0) {
    return null;
  }

  return (
    <div className="route-warning" role="status">
      <strong>Review Required</strong>
      {warnings.map((warning) => (
        <p key={warning.message}>{warning.message}</p>
      ))}
    </div>
  );
}
