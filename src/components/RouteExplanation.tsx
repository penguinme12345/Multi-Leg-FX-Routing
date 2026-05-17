type RouteExplanationProps = {
  rank: number;
  explanation: string;
};

export function RouteExplanation({ rank, explanation }: RouteExplanationProps) {
  return (
    <div className="route-explanation">
      <h3>{rank === 1 ? "Why this route ranked #1" : "Why this route ranked here"}</h3>
      <p>{explanation}</p>
    </div>
  );
}
