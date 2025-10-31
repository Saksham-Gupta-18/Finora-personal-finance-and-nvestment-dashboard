import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { request } from '../services/api';
import { listCategories } from '../services/categories';
import { request as api } from '../services/api';

export default function AddTransaction() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [type, setType] = useState('income');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [recurring, setRecurring] = useState(false);
  const [recurringDay, setRecurringDay] = useState(1);
  const [goals, setGoals] = useState([]);
  const [goalId, setGoalId] = useState('');

  useEffect(()=>{ (async ()=>{ try {
    const res = await listCategories(token); setCategories(res.categories);
    const gs = await api('/goals', { token }); setGoals(gs.goals || []);
  } catch(_){} })(); }, [token]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await request('/transactions', {
        method: 'POST',
        token,
        body: { type, amount: Number(amount), categoryId: categoryId || null, note, date, add_to_savings: type==='expense' && !!goalId, goal_id: goalId && type==='expense' ? Number(goalId) : null }
      });
      if (recurring) {
        await request('/recurring', { method: 'POST', token, body: { categoryId: categoryId || null, type, amount: Number(amount), note, day_of_month: Number(recurringDay) } });
      }
      navigate('/dashboard');
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Add Transaction</h2>
      {error && <div className="mb-3 p-2 bg-red-100 text-red-700 rounded">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block mb-1 text-sm">Type</label>
          <select className="w-full border rounded px-3 py-2" value={type} onChange={(e)=>setType(e.target.value)}>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
        <div>
          <label className="block mb-1 text-sm">Amount</label>
          <input type="number" min="0" step="0.01" className="w-full border rounded px-3 py-2" value={amount} onChange={(e)=>setAmount(e.target.value)} required />
        </div>
        <div>
          <label className="block mb-1 text-sm">Category</label>
          <select className="w-full border rounded px-3 py-2" value={categoryId} onChange={(e)=>setCategoryId(e.target.value)}>
            <option value="">Uncategorized</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block mb-1 text-sm">Note</label>
          <input className="w-full border rounded px-3 py-2" value={note} onChange={(e)=>setNote(e.target.value)} />
        </div>
        <div>
          <label className="block mb-1 text-sm">Date</label>
          <input type="date" className="w-full border rounded px-3 py-2" value={date} onChange={(e)=>setDate(e.target.value)} />
        </div>
        <div className="col-span-full flex items-center gap-2">
          <input id="recurring" type="checkbox" checked={recurring} onChange={(e)=>setRecurring(e.target.checked)} />
          <label htmlFor="recurring">Mark as recurring</label>
          {recurring && (
            <>
              <span className="text-sm text-gray-600">on day</span>
              <input type="number" min="1" max="28" className="border rounded px-2 py-1 w-20" value={recurringDay} onChange={(e)=>setRecurringDay(e.target.value)} />
            </>
          )}
        </div>
        {type==='expense' && (
          <div>
            <label className="block mb-1 text-sm">Add to savings</label>
            <select className="w-full border rounded px-3 py-2" value={goalId} onChange={(e)=>setGoalId(e.target.value)}>
              <option value="">None</option>
              {goals.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>
        )}
        <button className="w-full bg-accent text-white py-2 rounded">Save</button>
      </form>
    </div>
  );
}


