import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { request } from '../services/api';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts';
import { formatIndianNumber } from '../utils/formatNumber';

export default function SavingsGoals() {
  const { token } = useAuth();
  const [goals, setGoals] = useState([]);
  const [forecast, setForecast] = useState([]);
  const [form, setForm] = useState({ name: '', target_amount: '', target_date: '' });
  const [error, setError] = useState('');

  async function load() {
    try {
      const list = await request('/goals', { token });
      const prog = await request('/goals/progress', { token });
      const progressMap = new Map((prog.progress||[]).map(p=>[p.id, p]));
      const merged = (list.goals||[]).map(g => ({ ...g, ...(progressMap.get(g.id)||{}) }));
      setGoals(merged);
      const fc = await request('/forecast/savings', { token });
      setForecast(fc.goals || []);
    } catch (e) { setError(e.message); }
  }
  function statusColor(status) {
    if (status === 'on_track') return 'text-green-600';
    if (status === 'slightly_behind') return 'text-orange-500';
    if (status === 'behind') return 'text-red-600';
    return 'text-gray-600';
  }

  function buildChart(goalId, targetAmount) {
    const entry = forecast.find(x => String(x.goal?.id) === String(goalId));
    if (!entry) return [];
    const series = entry.forecast?.series || [];
    // create a target line reference value
    return series.map(p => ({ month: p.month, amount: Number(p.amount||0), target: Number(targetAmount||0) }));
  }

  useEffect(()=>{ load(); }, [token]);

  async function addGoal(e) {
    e.preventDefault(); setError('');
    if (!form.target_date) { setError('Target date is required'); return; }
    try {
      await request('/goals', { method: 'POST', token, body: { name: form.name, target_amount: Number(form.target_amount), target_date: form.target_date } });
      setForm({ name: '', target_amount: '', target_date: '' });
      await load();
    } catch (e) { setError(e.message); }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Savings Goals</h2>
      {error && <div className="p-2 bg-red-100 text-red-700 rounded">{error}</div>}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-2">Add New Goal</h3>
        <form onSubmit={addGoal} className="grid md:grid-cols-3 gap-2">
          <input className="border rounded px-3 py-2" placeholder="Goal name" value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})} />
          <input type="number" className="border rounded px-3 py-2" placeholder="Target amount" value={form.target_amount} onChange={(e)=>setForm({...form, target_amount:e.target.value})} />
          <input type="date" required className="border rounded px-3 py-2" value={form.target_date} onChange={(e)=>setForm({...form, target_date:e.target.value})} />
          <button className="px-3 py-2 bg-primary text-white rounded md:col-span-3 w-max">Save</button>
        </form>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {goals.map(g => (
          <div key={g.id} className="bg-white p-4 rounded shadow">
            <div className="flex items-center justify-between">
              <div className="font-semibold">{g.name}</div>
              <div className="text-sm text-gray-600">Target: ₹{formatIndianNumber(g.target_amount)} by {new Date(g.target_date).toLocaleDateString()}</div>
            </div>
            <div className="h-2 bg-gray-200 rounded mt-3">
              <div className="h-2 rounded bg-blue-600" style={{ width: `${Math.min(100, g.progress||0)}%` }}></div>
            </div>
            <div className="text-xs mt-1">Saved ₹{formatIndianNumber(g.current_savings||0)}</div>

            {/* Forecast details */}
            {(() => {
              const f = forecast.find(x => String(x.goal?.id) === String(g.id));
              if (!f) return null;
              const info = f.forecast || {};
              if (info.not_enough_data) {
                return (
                  <div className="mt-3 text-sm text-gray-600">Not enough data to forecast yet for this goal.</div>
                );
              }
              return (
                <div className="mt-3 text-sm">
                  <div className="flex flex-wrap gap-4">
                    <div>Avg monthly: ₹{formatIndianNumber(info.avg_monthly||0)}</div>
                    <div>Est. completion: {info.estimated_completion_date || '—'}</div>
                    <div className={statusColor(info.status)}>Status: {info.status === 'on_track' ? 'On Track' : info.status === 'slightly_behind' ? 'Slightly Behind' : info.status === 'behind' ? 'Behind Schedule' : '—'}</div>
                    <div>Required/month: ₹{formatIndianNumber(info.required_per_month||0)}</div>
                    <div>Completion probability: {Number(info.completion_probability||0).toFixed(0)}%</div>
                  </div>
                  <div className="h-60 mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={buildChart(g.id, g.target_amount)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis tickFormatter={(v)=>`₹${formatIndianNumber(v, 0)}`} />
                        <Tooltip formatter={(val,name)=>[`₹${formatIndianNumber(val)}`, name]} />
                        <Legend />
                        <Line type="monotone" dataKey="amount" stroke="#3b82f6" name="Saved per month" />
                        <Line type="monotone" dataKey="target" stroke="#10b981" strokeDasharray="5 5" dot={false} name="Target" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              );
            })()}
          </div>
        ))}
      </div>
    </div>
  );
}


