import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

export default function EnvironmentalDashboard({ fieldId = 1 }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchEnvData();
  }, [fieldId]);

  const fetchEnvData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:8000/api/environment/${fieldId}`);
      setData(res.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Could not load environmental data. Please ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-emerald-400 animate-pulse">Loading Environmental Data...</div>;
  }

  if (error || !data) {
    return <div className="p-6 bg-red-900/30 border border-red-500/50 rounded-xl text-red-200">{error || "No data available."}</div>;
  }

  const { current, forecast, trends, anomalies } = data;

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60 shadow-xl backdrop-blur-md">
        <div>
          <h2 className="text-2xl font-bold text-emerald-400 flex items-center gap-2">
            🌤️ Environmental & Microclimate Monitor
          </h2>
          <p className="text-sm text-slate-400">Field #{fieldId} • Chennai AgroSmart Weather Telemetry</p>
        </div>
        <button
          onClick={fetchEnvData}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition shadow-lg shadow-emerald-900/20 self-start md:self-auto"
        >
          🔄 Refresh Telemetry
        </button>
      </div>

      {/* Anomalies Alert Banner */}
      {anomalies && anomalies.length > 0 && (
        <div className="bg-amber-950/60 border border-amber-500/60 p-4 rounded-xl flex items-center gap-3 text-amber-200 shadow-lg">
          <span className="text-2xl">⚠️</span>
          <div>
            <h4 className="font-semibold text-amber-300">Environmental Anomaly Detected</h4>
            <p className="text-sm text-amber-200/90">{anomalies.join(" • ")}</p>
          </div>
        </div>
      )}

      {/* Live Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-4 rounded-xl border border-slate-700/50 shadow-md">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Temperature</div>
          <div className="text-3xl font-extrabold text-amber-400 mt-1">{current.temperature}°C</div>
          <div className="text-xs text-amber-400/80 mt-1">Tropical Warm</div>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-4 rounded-xl border border-slate-700/50 shadow-md">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Humidity</div>
          <div className="text-3xl font-extrabold text-cyan-400 mt-1">{current.humidity}%</div>
          <div className="text-xs text-cyan-400/80 mt-1">Optimal Range</div>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-4 rounded-xl border border-slate-700/50 shadow-md">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Rainfall (24h)</div>
          <div className="text-3xl font-extrabold text-blue-400 mt-1">{current.rainfall_24h} mm</div>
          <div className="text-xs text-blue-400/80 mt-1">Light Precip</div>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-4 rounded-xl border border-slate-700/50 shadow-md">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Wind Speed</div>
          <div className="text-3xl font-extrabold text-teal-400 mt-1">{current.wind_speed} km/h</div>
          <div className="text-xs text-teal-400/80 mt-1">Gentle Breeze</div>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-4 rounded-xl border border-slate-700/50 shadow-md col-span-2 md:col-span-1">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Soil Moisture</div>
          <div className="text-3xl font-extrabold text-emerald-400 mt-1">{current.soil_moisture}%</div>
          <div className="text-xs text-emerald-400/80 mt-1">Sensor Active</div>
        </div>
      </div>

      {/* 7-Day Weather Forecast */}
      <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60 shadow-xl">
        <h3 className="text-lg font-semibold text-emerald-300 mb-4 flex items-center gap-2">
          📅 7-Day Agricultural Weather Forecast
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {forecast.map((item, idx) => {
            const isRainy = item.condition === 'rainy';
            const isExtreme = item.condition === 'extreme';
            const bgClass = isRainy
              ? 'from-blue-900/40 to-slate-800 border-blue-500/50'
              : isExtreme
              ? 'from-red-900/40 to-slate-800 border-red-500/50'
              : 'from-slate-800 to-slate-900 border-slate-700/50';

            return (
              <div key={idx} className={`bg-gradient-to-b ${bgClass} p-3 rounded-xl border text-center space-y-2 shadow-sm`}>
                <div className="text-xs font-bold text-slate-400 uppercase">{item.day}</div>
                <div className="text-2xl">
                  {isRainy ? '🌧️' : isExtreme ? '🔥' : '☀️'}
                </div>
                <div className="text-sm font-bold text-slate-200">
                  {item.high}° <span className="text-xs text-slate-400 font-normal">/ {item.low}°</span>
                </div>
                <div className="text-xs text-cyan-300">{item.humidity}% RH</div>
                {item.rainfall > 0 && (
                  <div className="text-xs font-bold text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded-full inline-block">
                    {item.rainfall}mm
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 30-Day Historical Trend Graphs */}
      <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/60 pb-4">
          <h3 className="text-lg font-semibold text-emerald-300 flex items-center gap-2">
            📈 30-Day Historical Trends & Water Overlay
          </h3>
          <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-700 text-xs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-md transition ${activeTab === 'overview' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Water vs Rain
            </button>
            <button
              onClick={() => setActiveTab('temp')}
              className={`px-3 py-1.5 rounded-md transition ${activeTab === 'temp' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Temp & Humidity
            </button>
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {activeTab === 'overview' ? (
              <BarChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} unit="mm" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Bar dataKey="water_applied" name="Water Applied (mm)" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="rainfall" name="Natural Rainfall (mm)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" stroke="#f59e0b" tick={{ fontSize: 11 }} unit="°C" />
                <YAxis yAxisId="right" orientation="right" stroke="#06b6d4" tick={{ fontSize: 11 }} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Line yAxisId="left" type="monotone" dataKey="temperature" name="Temp (°C)" stroke="#f59e0b" strokeWidth={2} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="humidity" name="Humidity (%)" stroke="#06b6d4" strokeWidth={2} dot={false} />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
