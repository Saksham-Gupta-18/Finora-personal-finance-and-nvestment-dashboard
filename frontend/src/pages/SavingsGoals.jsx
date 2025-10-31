import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { request } from '../services/api';

export default function SavingsGoals() {
  const { token } = useAuth();
  const [goals, setGoals] = useState([]);
  const [form, setForm] = useState({ name: '', target_amount: '', target_date: '' });
  const [error, setError] = useState('');

  async function load() {
    try {
      const list = await request('/goals', { token });
      const prog = await request('/goals/progress', { token });
      const progressMap = new Map((prog.progress||[]).map(p=>[p.id, p]));
      const merged = (list.goals||[]).map(g => ({ ...g, ...(progressMap.get(g.id)||{}) }));
      setGoals(merged);
    } catch (e) { setError(e.message); }
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
              <div className="text-sm text-gray-600">Target: ₹{Number(g.target_amount).toFixed(2)} by {new Date(g.target_date).toLocaleDateString()}</div>
            </div>
            <div className="h-2 bg-gray-200 rounded mt-3">
              <div className="h-2 rounded bg-blue-600" style={{ width: `${Math.min(100, g.progress||0)}%` }}></div>
            </div>
            <div className="text-xs mt-1">Saved ₹{Number(g.current_savings||0).toFixed(2)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}


