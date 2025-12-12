"use client";

import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, Line } from "recharts";

interface PriceDataPoint {
  date: string;
  price: number;
  sma20?: number;
  sma50?: number;
}

interface PriceChartProps {
  data: PriceDataPoint[];
  showMovingAverages?: boolean;
}

export function PriceChart({ data, showMovingAverages = true }: PriceChartProps) {
  return (
    <div className="w-full h-[300px] md:h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
          <XAxis
            dataKey="date"
            stroke="#94a3b8"
            style={{ fontSize: "12px" }}
            tick={{ fill: "#94a3b8" }}
          />
          <YAxis
            stroke="#94a3b8"
            style={{ fontSize: "12px" }}
            tick={{ fill: "#94a3b8" }}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(15, 23, 42, 0.95)",
              border: "1px solid rgba(148, 163, 184, 0.2)",
              borderRadius: "8px",
              padding: "12px",
            }}
            labelStyle={{ color: "#e2e8f0", fontWeight: "600", marginBottom: "8px" }}
            itemStyle={{ color: "#94a3b8", fontSize: "13px" }}
            formatter={(value: number | string) => [`$${typeof value === "number" ? value.toFixed(2) : value}`, "Price"]}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke="#10b981"
            strokeWidth={2}
            fill="url(#colorPrice)"
            dot={false}
            activeDot={{ r: 6, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }}
          />
          {showMovingAverages && (
            <>
              <Line
                type="monotone"
                dataKey="sma20"
                stroke="#3b82f6"
                strokeWidth={1.5}
                dot={false}
                strokeDasharray="5 5"
              />
              <Line
                type="monotone"
                dataKey="sma50"
                stroke="#f59e0b"
                strokeWidth={1.5}
                dot={false}
                strokeDasharray="5 5"
              />
            </>
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
