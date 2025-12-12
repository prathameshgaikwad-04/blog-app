import React, { useMemo } from "react";

/**
 * StreakHeatmap (updated wrapper)
 * - posts: array of posts (each must have createdAt)
 * - days: number of days to show (default 180)
 *
 * This version ensures the heatmap's container is horizontally scrollable,
 * calculates a minWidth for the grid based on the number of week-columns,
 * and forces each week-column to not shrink (flex: 0 0 auto).
 */
export default function StreakHeatmap({ posts = [], days = 180 }) {
  const { grid, maxCount } = useMemo(() => {
    const map = new Map();
    for (const p of (posts || [])) {
      if (!p?.createdAt) continue;
      const d = new Date(p.createdAt).toISOString().slice(0, 10);
      map.set(d, (map.get(d) || 0) + 1);
    }
    const today = new Date();
    const arr = [];
    for (let i = days - 1; i >= 0; i--) {
      const dt = new Date();
      dt.setDate(today.getDate() - i);
      const key = dt.toISOString().slice(0, 10);
      arr.push({ day: key, count: map.get(key) || 0 });
    }
    const maxCount = Math.max(1, ...arr.map(x => x.count));
    return { grid: arr, maxCount };
  }, [posts, days]);

  const levelFor = (count) => {
    if (count <= 0) return 0;
    if (count >= maxCount) return 4;
    const step = maxCount / 4;
    return Math.min(4, Math.ceil(count / step));
  };

  // Build weeks (columns). Weeks start on Sunday (0).
  const weeks = [];
  let week = [];
  const firstDate = new Date(grid[0].day);
  const startPad = firstDate.getDay();
  for (let i = 0; i < startPad; i++) week.push(null);
  grid.forEach(item => {
    week.push(item);
    if (week.length === 7) { weeks.push(week); week = []; }
  });
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }

  // layout tuning (must match CSS sizes for best fit)
  const cellSize = 14; // px
  const gap = 6;       // px between week columns
  const weekWidth = cellSize; // each week column width equals cell size
  const weeksCount = weeks.length || 1;
  // compute min width: weeks columns + gaps
  const minWidthPx = weeksCount * weekWidth + Math.max(0, (weeksCount - 1) * gap) + 24; // + padding slop

  // legend colors (use CSS variables if present)
  const colors = [
    "var(--heat-0, #f1f5f9)",
    "var(--heat-1, #efe6ff)",
    "var(--heat-2, #c7b3ff)",
    "var(--heat-3, #7c3aed)",
    "var(--heat-4, #4c1d95)"
  ];

  return (
    <div
      className="heatmap-root"
      style={{
        width: "100%",
        overflowX: "auto",
        WebkitOverflowScrolling: "touch",
        paddingBottom: 8
      }}
    >
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div
          className="heatmap-grid"
          role="grid"
          aria-label="Activity heatmap"
          style={{
            display: "flex",
            gap,
            padding: 12,
            minWidth: `${minWidthPx}px`, // ensures the grid width matches the number of week columns
            boxSizing: "border-box"
          }}
        >
          {weeks.map((w, wi) => (
            <div
              key={wi}
              className="heatmap-week"
              role="row"
              style={{ display: "flex", flexDirection: "column", gap, flex: "0 0 auto" }} // prevent shrink
            >
              {w.map((cell, ci) => {
                const count = cell ? cell.count : 0;
                const level = cell ? levelFor(count) : 0;
                const title = cell ? `${cell.day} — ${count} post${count !== 1 ? "s" : ""}` : "";
                return (
                  <div
                    key={ci}
                    className={`heatmap-cell level-${level}`}
                    title={title}
                    aria-label={title}
                    role="gridcell"
                    style={{
                      width: cellSize,
                      height: cellSize,
                      borderRadius: 4,
                      border: "1px solid rgba(0,0,0,0.06)",
                      boxSizing: "border-box",
                      background: `var(--heat-${level}, ${colors[level]})`,
                      transition: "transform .12s, box-shadow .12s, background-color .12s"
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div style={{ alignSelf: "center", marginLeft: 8 }}>
          <div className="small" style={{ marginBottom: 6 }}>Less</div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {colors.map((c, i) => (
              <div
                key={i}
                style={{
                  width: 18,
                  height: 18,
                  background: c,
                  borderRadius: 4,
                  border: "1px solid rgba(0,0,0,0.04)"
                }}
              />
            ))}
          </div>
          <div className="small" style={{ marginTop: 6 }}>More</div>
        </div>
      </div>
    </div>
  );
}

