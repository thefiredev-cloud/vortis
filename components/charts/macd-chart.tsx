"use client";

import { Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart } from "recharts";

interface MACDDataPoint {
  date: string;
  macd: number;
  signal: number;
  histogram: number;
}

interface MACDChartProps {
  data: MACDDataPoint[];
}

export function MACDChart({ data }: MACDChartProps) {
  return (
    <div className="w-full h-[250px] md:h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
          <XAxis
            dataKey="date"
            stroke="#94a3b8"
            style={{ fontSize: "11px" }}
            tick={{ fill: "#94a3b8" }}
          />
          <YAxis
            stroke="#94a3b8"
            style={{ fontSize: "11px" }}
            tick={{ fill: "#94a3b8" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(15, 23, 42, 0.95)",
              border: "1px solid rgba(148, 163, 184, 0.2)",
              borderRadius: "8px",
              padding: "12px",
            }}
            labelStyle={{ color: "#e2e8f0", fontWeight: "600", marginBottom: "8px" }}
            itemStyle={{ fontSize: "12px" }}
            formatter={(value: number | string, name: string) => {
              const formatted = typeof value === "number" ? value.toFixed(3) : value;
              const label = name === "macd" ? "MACD" : name === "signal" ? "Signal" : "Histogram";
              return [formatted, label];
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
            iconType="line"
          />
          <Bar
            dataKey="histogram"
            fill="#64748b"
            opacity={0.6}
            radius={[4, 4, 0, 0]}
          />
          <Line
            type="monotone"
            dataKey="macd"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            name="MACD"
          />
          <Line
            type="monotone"
            dataKey="signal"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={false}
            name="Signal"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
