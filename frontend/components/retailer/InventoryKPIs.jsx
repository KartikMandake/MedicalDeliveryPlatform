import React from "react";

const KPI_CONFIG = {
  inventoryItems: {
    label: "Inventory Value",
    formatter: (v) => `₹${v.toLocaleString()}`,
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: "emerald"
  },
  lowStockCount: {
    label: "Low Stock Alerts",
    formatter: (v) => v,
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    color: "rose"
  },
  totalOrders: {
    label: "Sales Velocity",
    formatter: (v) => `${v} units/day`,
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    color: "amber"
  },
  stockHealth: {
    label: "Stock Health",
    formatter: (v) => v,
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: "sky"
  }
};

const KPICard = ({ type, value, isLoading }) => {
  const config = KPI_CONFIG[type];
  if (!config) return null;

  const colorStyles = {
    emerald: {
      bg: "bg-[#ECFDF5]",
      border: "border-[#10B981]",
      text: "text-[#065F46]",
      label: "text-[#065F46]/80"
    },
    rose: {
      bg: "bg-[#FEF2F2]",
      border: "border-[#EF4444]",
      text: "text-[#991B1B]",
      label: "text-[#991B1B]/80"
    },
    amber: {
      bg: "bg-[#FFF7ED]",
      border: "border-[#F97316]",
      text: "text-[#9A3412]",
      label: "text-[#9A3412]/80"
    },
    sky: {
      bg: "bg-[#EFF6FF]",
      border: "border-[#3B82F6]",
      text: "text-[#1E3A8A]",
      label: "text-[#1E3A8A]/80"
    },
  };

  const style = colorStyles[config.color];

  return (
    <div className={`p-6 rounded-2xl border ${style.bg} ${style.border} ${style.text} transition-all hover:shadow-xl opacity-100`}>
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-xl bg-white/60">
          {config.icon}
        </div>
        {isLoading ? (
          <div className="h-4 w-12 bg-current/20 animate-pulse rounded" />
        ) : (
          <span className="text-xs font-bold uppercase tracking-wider opacity-70">
            Realtime
          </span>
        )}
      </div>
      <div>
        <h3 className={`text-sm font-bold ${style.label} mb-1`}>{config.label}</h3>
        {isLoading ? (
          <div className="h-8 w-24 bg-current/20 animate-pulse rounded" />
        ) : (
          <p className="text-2xl font-bold tracking-tight">
            {config.formatter(value)}
          </p>
        )}
      </div>
    </div>
  );
};

export const InventoryKPIs = ({ data, isLoading }) => {
  // Map raw backend data to KPI cards
  const stats = [
    { type: "inventoryItems", value: data?.totalRevenue || 0 }, // Using revenue as proxy for "Value" in this view
    { type: "lowStockCount", value: data?.lowStockCount || 0 },
    { type: "totalOrders", value: data?.ordersToday || 0 },
    { type: "stockHealth", value: (data?.lowStockCount > 5 ? "Critical" : "Good") }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => (
        <KPICard key={stat.type} {...stat} isLoading={isLoading} />
      ))}
    </div>
  );
};
