import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { topLanguages } from "../utils/stats";

// Donut chart of the languages used across a user's repos.
const LanguageStats = ({ repos }) => {
  const data = useMemo(() => topLanguages(repos, 6), [repos]);
  const total = data.reduce((sum, l) => sum + l.value, 0);

  if (data.length === 0) return null;

  return (
    <div className="bg-glass rounded-lg p-4">
      <h2 className="text-sm font-semibold mb-2">Top languages</h2>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="w-44 h-44 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={42}
                outerRadius={80}
                paddingAngle={2}
                stroke="none"
              >
                {data.map((l) => (
                  <Cell key={l.name} fill={l.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [`${value} repos`, name]}
                contentStyle={{
                  background: "var(--tooltip-bg)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                }}
                itemStyle={{ color: "var(--fg)" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <ul className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm w-full">
          {data.map((l) => (
            <li key={l.name} className="flex items-center gap-2 min-w-0">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: l.color }}
              />
              <span className="truncate">{l.name}</span>
              <span className="text-gray-500 text-xs ms-auto">
                {Math.round((l.value / total) * 100)}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default LanguageStats;
