"use client";

interface MacroRingProps {
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  size?: number;
}

export function MacroRing({ protein, carbs, fat, calories, size = 80 }: MacroRingProps) {
  const total = protein * 4 + carbs * 4 + fat * 9;
  const protPct = total > 0 ? (protein * 4) / total : 0;
  const carbsPct = total > 0 ? (carbs * 4) / total : 0;
  const fatPct = total > 0 ? (fat * 9) / total : 0;

  const r = 32;
  const cx = 40;
  const cy = 40;
  const circumference = 2 * Math.PI * r;

  const protLen = circumference * protPct;
  const carbsLen = circumference * carbsPct;
  const fatLen = circumference * fatPct;

  const segments = [
    { len: protLen, color: "#F04E23", offset: 0 },
    { len: carbsLen, color: "#E8A945", offset: protLen },
    { len: fatLen, color: "#47D4FF", offset: protLen + carbsLen },
  ];

  return (
    <div className="flex items-center gap-3">
      {/* Donut */}
      <svg width={size} height={size} viewBox="0 0 80 80" className="-rotate-90 flex-shrink-0">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#2E2E3E" strokeWidth="8" />
        {segments.map((seg, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth="8"
            strokeDasharray={`${seg.len} ${circumference - seg.len}`}
            strokeDashoffset={-seg.offset}
            strokeLinecap="butt"
          />
        ))}
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          className="rotate-90"
          style={{ transform: "rotate(90deg)", transformOrigin: "40px 40px", fontFamily: "var(--font-jetbrains)", fontSize: "11px", fontWeight: "700", fill: "#F2F2F5" }}
        >
          {calories}
        </text>
      </svg>

      {/* Legend */}
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-xs">
          <div className="w-2 h-2 rounded-sm bg-ember flex-shrink-0" />
          <span className="text-muted-foreground">Prot</span>
          <span className="font-mono font-bold text-foreground ml-1">{protein}g</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <div className="w-2 h-2 rounded-sm bg-gold flex-shrink-0" />
          <span className="text-muted-foreground">Carb</span>
          <span className="font-mono font-bold text-foreground ml-1">{carbs}g</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <div className="w-2 h-2 rounded-sm bg-chart-4 flex-shrink-0" />
          <span className="text-muted-foreground">Gord</span>
          <span className="font-mono font-bold text-foreground ml-1">{fat}g</span>
        </div>
      </div>
    </div>
  );
}
