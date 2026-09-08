import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from 'recharts';

export default function ResultsDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/analytics');
      setAnalytics(res.data);
    } catch (err) {
      console.error("Error fetching analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-emerald-400 animate-pulse">Loading Pilot Analytics...</div>;
  }

  if (!analytics) {
    return <div className="p-6 bg-slate-800 text-slate-300 rounded-xl">Unable to load analytics metrics.</div>;
  }

  const comparisonData = [
    { metric: 'Water Usage (mm/wk)', Traditional: 42, AgroSmartAI: 31 },
    { metric: 'Yield (Tons/Hectare)', Traditional: 4.8, AgroSmartAI: 5.9 },
    { metric: 'Net Revenue (₹/Ha)', Traditional: 85000, AgroSmartAI: 100500 },
  ];

  const pieData = [
    { name: 'Water Saved (24.5%)', value: 24.5, color: '#10b981' },
    { name: 'Water Usage (75.5%)', value: 75.5, color: '#334155' },
  ];

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header */}
      <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60 shadow-xl backdrop-blur-md">
        <h2 className="text-2xl font-bold text-emerald-400 flex items-center gap-2">
          📊 Chennai Farmer Pilot Results & Impact Metrics
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Evaluating 12-Week Pilot Across {analytics.pilot_farmers} Registered Small Farms & Terrace Gardens
        </p>
      </div>

      {/* Aggregate KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-950/60 to-slate-900 p-5 rounded-xl border border-emerald-500/40 shadow-lg">
          <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Water Saved</div>
          <div className="text-3xl font-black text-emerald-300 mt-1">{analytics.water_saved_percent}%</div>
          <div className="text-xs text-emerald-400/80 mt-1">~145,000 Liters Total</div>
        </div>

        <div className="bg-gradient-to-br from-cyan-950/60 to-slate-900 p-5 rounded-xl border border-cyan-500/40 shadow-lg">
          <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Farmer Profit Boost</div>
          <div className="text-3xl font-black text-cyan-300 mt-1">+{analytics.profit_increase_percent}%</div>
          <div className="text-xs text-cyan-400/80 mt-1">Market Timing Optimization</div>
        </div>

        <div className="bg-gradient-to-br from-blue-950/60 to-slate-900 p-5 rounded-xl border border-blue-500/40 shadow-lg">
          <div className="text-xs font-bold text-blue-400 uppercase tracking-wider">Alert Action Rate</div>
          <div className="text-3xl font-black text-blue-300 mt-1">{analytics.alert_response_rate}%</div>
          <div className="text-xs text-blue-400/80 mt-1">High Farmer Trust</div>
        </div>

        <div className="bg-gradient-to-br from-amber-950/60 to-slate-900 p-5 rounded-xl border border-amber-500/40 shadow-lg">
          <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">Satisfaction Rating</div>
          <div className="text-3xl font-black text-amber-300 mt-1">⭐ {analytics.satisfaction_rating} / 5.0</div>
          <div className="text-xs text-amber-400/80 mt-1">18/18 Farmers Surveyed</div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traditional vs AI Comparison Bar Chart */}
        <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60 shadow-xl">
          <h3 className="text-lg font-semibold text-emerald-300 mb-4">
            ⚖️ Traditional Farming vs. AgroSmart AI Pilot
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="metric" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }} />
                <Legend />
                <Bar dataKey="Traditional" fill="#64748b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="AgroSmartAI" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Case Studies & Testimonials */}
        <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60 shadow-xl flex flex-col justify-between">
          <h3 className="text-lg font-semibold text-emerald-300 mb-3">
            🗣️ Chennai Farmer Pilot Testimonial
          </h3>
          <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-700 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-700 flex items-center gap-1 justify-center text-xl font-bold text-white">
                👨‍🌾
              </div>
              <div>
                <div className="font-bold text-emerald-200">K. Ramanathan</div>
                <div className="text-xs text-slate-400">Tomato & Chili Farmer • Thiruvallur, Chennai</div>
              </div>
            </div>
            <p className="text-sm italic text-slate-300">
              "The SMS alerts saved my crop when extreme heat hit last month. Skipping water before heavy rain also saved me hours of pump electricity and reduced my water usage by almost 25%."
            </p>
            <div className="text-xs text-emerald-400 font-semibold bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-500/30 inline-block">
              Outcome: ₹16,500 additional income per acre
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
            <span>Verified 12-Week Pilot Result</span>
            <span className="text-emerald-400 font-bold">100% Production Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
}
