import { getScoreColor, getScoreLabel } from "@/lib/matching";

export default function ScoreBadge({ score }: { score: number }) {
  return (
    <div className={`inline-flex flex-col items-center rounded-xl border px-4 py-2 ${getScoreColor(score)}`}>
      <span className="text-2xl font-bold">{score}%</span>
      <span className="text-xs font-medium">{getScoreLabel(score)}</span>
    </div>
  );
}
