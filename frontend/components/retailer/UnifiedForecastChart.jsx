import React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-xl rounded-lg">
        <p className="text-sm font-bold text-slate-500 mb-1">{label}</p>
        <p className="text-lg font-extrabold text-blue-600">
          {payload[0].value.toFixed(1)} units
        </p>
        {data.isPredicted && (
          <div className="mt-2 text-xs space-y-1 py-2 border-t border-slate-100 dark:border-slate-800">
            <p className="font-semibold text-amber-600 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Machine Learning Prediction
            </p>
            <p className="text-slate-400 italic">Factors: Seasonal Hub + Weather Signals</p>
          </div>
        )}
      </div>
    );
  }
  return null;
};

export const UnifiedForecastChart = ({ data = [], isLoading }) => {
  if (isLoading) {
    return (
      <div className="w-full h-[400px] bg-slate-50 dark:bg-slate-900/50 rounded-2xl flex items-center justify-center animate-pulse border border-slate-100 dark:border-slate-800">
        <span className="text-slate-400 font-medium">Crunching 12 months of trends...</span>
      </div>
    );
  }

  // Identify peak demand days for markers
  const threshold = Math.max(...data.map(d => d.value || 0)) * 0.9;
  const peaks = data.filter(d => (d.value || 0) >= threshold && d.isPredicted);

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 mb-8 overflow-hidden relative shadow-sm opacity-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#111827] mb-1 flex items-center gap-2">
            Demand Forecast Hub
            <span className="px-2 py-0.5 bg-blue-100 text-[#2563EB] text-[10px] font-black uppercase rounded-full tracking-tighter">
              AI Powered
            </span>
          </h2>
          <p className="text-sm text-[#6B7280]">Predicted inventory needs for the next 30 days based on weather & seasonality</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#2563EB]" />
            <span className="text-xs font-bold text-[#2563EB] uppercase">Actual Sales</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-0.5 border-t-2 border-dashed border-[#F97316]" />
            <span className="text-xs font-bold text-[#F97316] uppercase">ML Prediction</span>
          </div>
        </div>
      </div>

      <div className="h-[350px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f080" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fontWeight: 600, fill: "#94a3b8" }}
              minTickGap={30}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fontWeight: 600, fill: "#94a3b8" }}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Historical Area */}
            <Area
              type="monotone"
              dataKey="value"
              stroke="#2563EB"
              strokeWidth={4}
              fillOpacity={0.05}
              fill="#2563EB"
              connectNulls
              activeDot={{ r: 6, strokeWidth: 0 }}
            />

            {/* Prediction Area (Dashed) */}
            <Area
              dataKey="prediction"
              stroke="#F97316"
              strokeWidth={4}
              strokeDasharray="10 8"
              fillOpacity={0.05}
              fill="#F97316"
              connectNulls
              activeDot={{ r: 6, strokeWidth: 0, fill: "#F97316" }}
            />

            {/* Peak Markers */}
            {peaks.map((p, idx) => (
              <ReferenceDot
                key={idx}
                x={p.date}
                y={p.value}
                r={5}
                fill="#f43f5e"
                stroke="white"
                strokeWidth={2}
                isFront
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex items-center justify-between py-3 border-t border-slate-100 dark:border-slate-800">
         <p className="text-[10px] text-slate-400 font-mono tracking-tighter uppercase">
            Platform Engine v4.2 // Blended Signal Weight: 0.92
         </p>
         <div className="flex gap-2">
            {peaks.length > 0 && (
               <span className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-bold border border-rose-100 animate-bounce">
                 <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                 Peak Demand Detected
               </span>
            )}
         </div>
      </div>
    </div>
  );
};
