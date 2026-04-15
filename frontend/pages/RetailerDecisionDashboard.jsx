import React, { useEffect, useState } from "react";
import { getDemandForecast, getInventoryPredictions } from "../api/ai";
import { getDashboard as getRetailerDashboard } from "../api/retailer";
import { ActionCenter } from "../components/retailer/ActionCenter";
import { InventoryKPIs } from "../components/retailer/InventoryKPIs";
import { UnifiedForecastChart } from "../components/retailer/UnifiedForecastChart";
import RetailerSidebar from '../components/retailer/RetailerSidebar';
import RetailerTopNav from '../components/retailer/RetailerTopNav';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const RetailerDecisionDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState({
    kpis: null,
    forecast: [],
    insights: [],
    lastUpdated: null
  });

  const [loading, setLoading] = useState({
    kpis: true,
    forecast: true,
    insights: true
  });

  const fetchKPIs = async () => {
    try {
      const res = await getRetailerDashboard();
      setData(prev => ({ ...prev, kpis: res.data || res }));
    } catch (err) {
      console.error("KPI Sync Failed:", err);
    } finally {
      setLoading(prev => ({ ...prev, kpis: false }));
    }
  };

  const fetchForecast = async () => {
    try {
      const res = await getDemandForecast();
      const raw = res.data || res;
      setData(prev => ({ 
        ...prev, 
        forecast: processForecastData(raw.weeklyDemand || []),
        lastUpdated: new Date().toLocaleTimeString() 
      }));
    } catch (err) {
      console.error("Forecast Sync Failed:", err);
    } finally {
      setLoading(prev => ({ ...prev, forecast: false }));
    }
  };

  const fetchInsights = async () => {
    try {
      const res = await getInventoryPredictions();
      const raw = res.data || res;
      setData(prev => ({ 
        ...prev, 
        insights: (raw.insights || []).sort((a,b) => {
           const priority = { high: 0, medium: 1, low: 2 };
           return priority[a.severity] - priority[b.severity];
        }) 
      }));
    } catch (err) {
      console.error("Insights Sync Failed:", err);
    } finally {
      setLoading(prev => ({ ...prev, insights: false }));
    }
  };

  const fetchData = () => {
    setLoading({ kpis: true, forecast: true, insights: true });
    fetchKPIs();
    fetchForecast();
    fetchInsights();
  };

  const processForecastData = (weeklyDemand) => {
    if (!Array.isArray(weeklyDemand)) return [];
    
    return weeklyDemand.map(point => ({
      date: point.date || point.week || point.label,
      value: point.period === 'actual' ? point.actualDemand : null,
      prediction: point.period === 'projected' ? point.projectedDemand : null,
      isPredicted: point.period === 'projected'
    }));
  };

  useEffect(() => {
    if (user && !authLoading) {
      fetchData();
    }
  }, [user, authLoading]);

  if (authLoading) return null;
  if (!user || user.role !== 'retailer') return <Navigate to="/login" replace />;

  return (
    <div className="bg-[#f8f9fa] font-body text-[#111827] antialiased fixed inset-0 overflow-y-auto overflow-x-hidden opacity-100">
      <RetailerTopNav />
      <RetailerSidebar />

      <main className="lg:ml-56 pt-24 pb-24 md:pb-12 px-5">
        <div className="max-w-7xl mx-auto">
          
          {/* Header Section */}
          <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#6B7280] mb-2">Decision Support System</p>
              <h1 className="text-3xl md:text-[34px] font-extrabold font-headline text-[#111827] tracking-tight mb-1 flex items-center gap-3 italic">
                Inventory Hub
                <span className="bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-md uppercase font-black tracking-widest">
                  AI v2.1
                </span>
              </h1>
              <p className="text-sm text-[#6B7280] max-w-md font-medium">
                Smarter demand guidance and proactive supply chain signals.
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest leading-none">Last Intelligence Sync</p>
                <p className="text-xs font-extrabold text-[#111827]">{data.lastUpdated || '--:--:--'}</p>
              </div>
              <button 
                onClick={fetchData}
                disabled={loading.kpis || loading.forecast || loading.insights}
                className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-600 dark:text-slate-300 hover:shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                <span className={`material-symbols-outlined text-[20px] ${loading.kpis || loading.forecast || loading.insights ? 'animate-spin' : ''}`}>sync</span>
              </button>
            </div>
          </header>

          {/* Dashboard Grid */}
          <div className="space-y-6">
            
            {/* 1. KPIs */}
            <InventoryKPIs data={data.kpis} isLoading={loading.kpis} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* 2. Demand Forecast (Wide) */}
              <div className="lg:col-span-2">
                 <UnifiedForecastChart data={data.forecast} isLoading={loading.forecast} />
                 
                 {/* Quick Filters / Tips */}
                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {['General', 'Cold & Flu', 'Chronic', 'First Aid'].map(cat => (
                      <button key={cat} className="py-3 px-4 bg-white border border-slate-200/50 rounded-xl text-[11px] font-bold text-slate-500 hover:border-indigo-500 hover:text-indigo-600 transition-all shadow-sm">
                        {cat}
                      </button>
                    ))}
                 </div>
              </div>

              {/* 3. Global AI Action Center (Narrow) */}
              <ActionCenter insights={data.insights} isLoading={loading.insights} />

            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RetailerDecisionDashboard;
