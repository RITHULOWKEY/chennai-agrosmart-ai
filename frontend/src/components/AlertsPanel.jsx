import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AlertsPanel({ fieldId = 1, onClose }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, [fieldId]);

  const fetchAlerts = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/api/alerts/${fieldId}`);
      setAlerts(res.data.alerts || []);
    } catch (err) {
      console.error("Error fetching alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (alertId, actionText) => {
    try {
      await axios.post(`http://localhost:8000/api/alerts/${alertId}/action`, {
        action_taken: actionText
      });
      fetchAlerts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 space-y-4 shadow-2xl text-slate-100 max-w-xl w-full">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2">
          🚨 Active Alerts & Action Tracker
        </h3>
        {onClose && (
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-lg">✕</button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-4 text-slate-400 animate-pulse text-sm">Checking field rules...</div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-6 text-slate-400 text-sm">
          ✅ No active alerts for Field #{fieldId}. Microclimate is optimal!
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {alerts.map((a) => {
            const isUrgent = a.priority === 1;
            const isImportant = a.priority === 2;
            const borderClass = isUrgent
              ? 'border-red-500/60 bg-red-950/40'
              : isImportant
              ? 'border-amber-500/60 bg-amber-950/40'
              : 'border-emerald-500/60 bg-emerald-950/40';

            return (
              <div key={a.alert_id} className={`p-4 rounded-xl border ${borderClass} space-y-2 shadow-md`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase ${
                    isUrgent ? 'bg-red-600 text-white' : isImportant ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white'
                  }`}>
                    {isUrgent ? '🔴 URGENT' : isImportant ? '🟡 IMPORTANT' : '🟢 INFO'}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <p className="text-sm font-semibold text-slate-200">{a.message}</p>
                <div className="text-xs text-slate-300 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                  💡 <span className="font-bold text-slate-200">Recommended Action:</span> {a.action_recommended}
                </div>

                {a.action_taken ? (
                  <div className="text-xs text-emerald-400 font-semibold bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-500/30 flex items-center justify-between">
                    <span>✓ Farmer Action Logged: "{a.action_taken}"</span>
                  </div>
                ) : (
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleAction(a.alert_id, "Action Completed")}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition"
                    >
                      Mark Done
                    </button>
                    <button
                      onClick={() => handleAction(a.alert_id, "Irrigation Postponed")}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition"
                    >
                      Postpone
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
