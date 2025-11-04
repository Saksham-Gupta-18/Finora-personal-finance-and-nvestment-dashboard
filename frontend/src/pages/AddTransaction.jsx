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
  const [categoryName, setCategoryName] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
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
      // Resolve typed category/goal name to id
      const foundCategory = categories.find(c => String(c.id) === String(categoryId)) || categories.find(c => (c.name||'').toLowerCase() === categoryName.trim().toLowerCase());
      const foundGoal = goals.find(g => String(g.id) === String(categoryId)) || goals.find(g => (g.name||'').toLowerCase() === categoryName.trim().toLowerCase());

      if (type === 'saving' && !foundGoal) {
        setError('Please start typing and select a goal from suggestions');
        return;
      }

      const payload = {
        type,
        amount: Number(amount),
        categoryId: type==='saving' ? null : (foundCategory ? Number(foundCategory.id) : null),
        note,
        date,
        goal_id: type==='saving' ? (foundGoal ? Number(foundGoal.id) : null) : null
      };
      await request('/transactions', {
        method: 'POST',
        token,
        body: payload
      });
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
            <option value="saving">Saving</option>
          </select>
        </div>
        <div>
          <label className="block mb-1 text-sm">Amount</label>
          <input type="number" min="0" step="0.01" className="w-full border rounded px-3 py-2" value={amount} onChange={(e)=>setAmount(e.target.value)} required />
        </div>
        <div>
          <label className="block mb-1 text-sm">Category{type==='saving' ? ' (choose goal)' : ''}</label>
          <input
            className="w-full border rounded px-3 py-2"
            list="categoryOptions"
            placeholder={type==='saving' ? 'Start typing a goal name…' : 'Start typing a category…'}
            value={categoryName}
            onChange={(e)=>{ setCategoryName(e.target.value); setCategoryId(''); }}
            required={type==='saving'}
          />
          <datalist id="categoryOptions">
            {type==='saving'
              ? goals.map(g => (<option key={g.id} value={g.name} />))
              : categories.map(c => (<option key={c.id} value={c.name} />))}
          </datalist>
        </div>
        <div>
          <label className="block mb-1 text-sm">Note</label>
          <input className="w-full border rounded px-3 py-2" value={note} onChange={(e)=>setNote(e.target.value)} />
        </div>
        <div>
          <label className="block mb-1 text-sm">Date</label>
          <input type="date" className="w-full border rounded px-3 py-2" value={date} onChange={(e)=>setDate(e.target.value)} />
        </div>
        {/* Goal picker removed; choose goal from Category when type='saving' */}
        <button className="w-full bg-accent text-white py-2 rounded">Save</button>
      </form>
    </div>
  );
}


