import React, { useState } from 'react';
import axios from 'axios';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const url = isLogin ? 'http://localhost:8000/api/auth/login' : 'http://localhost:8000/api/auth/register';
    const payload = isLogin ? { username, password } : { name, username, password, phone };

    try {
      const res = await axios.post(url, payload);
      if (res.data.token) {
        localStorage.setItem('farmer_token', res.data.token);
        localStorage.setItem('farmer_name', res.data.name);
        localStorage.setItem('farmer_id', res.data.farmer_id);
        onLoginSuccess(res.data);
        onClose();
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Authentication failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 text-xl font-bold"
        >
          ✕
        </button>

        <div className="text-center space-y-1">
          <h3 className="text-2xl font-bold text-emerald-400">
            {isLogin ? '🔑 Farmer Login' : '👨‍🌾 Farmer Onboarding'}
          </h3>
          <p className="text-xs text-slate-400">
            {isLogin ? 'Access your private field advisory dashboard' : 'Register your Chennai farm account'}
          </p>
        </div>

        {error && (
          <div className="bg-red-950/80 border border-red-500/50 p-3 rounded-lg text-xs text-red-200 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. K. Ramanathan"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Username / Phone</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. ramanathan_farm"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number (for SMS Alerts)</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9876543210"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-emerald-900/40"
          >
            {loading ? 'Authenticating...' : isLogin ? 'Sign In to Dashboard' : 'Complete Registration'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-800">
          <button
            onClick={() => { setIsLogin(!isLogin); setError(null); }}
            className="text-xs text-emerald-400 hover:underline"
          >
            {isLogin ? "New farmer? Register account" : "Already registered? Log in"}
          </button>
        </div>
      </div>
    </div>
  );
}
