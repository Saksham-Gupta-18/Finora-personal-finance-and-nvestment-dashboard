import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { request } from '../services/api';
import { deleteTransaction } from '../services/transactions';
import Chart from '../components/Chart';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

export default function Dashboard() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({ total_income: 0, total_expense: 0 });
  const [error, setError] = useState('');
  const [monthly, setMonthly] = useState([]);
  const [byCategory, setByCategory] = useState([]);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [budgetMonth, setBudgetMonth] = useState(() => new Date().toISOString().slice(0,7));
  const [budget, setBudget] = useState({ limit_amount: 0, spent: 0 });

  useEffect(() => {
    async function load() {
      try {
        const data = await request('/transactions', { token });
        const statsData = await request(`/transactions/stats/summary?start=${encodeURIComponent(start||'')}&end=${encodeURIComponent(end||'')}`, { token });
        setItems(data.transactions);
        setStats({
          total_income: Number(data.stats?.total_income || statsData.totals?.total_income || 0),
          total_expense: Number(data.stats?.total_expense || statsData.totals?.total_expense || 0)
        });
        setMonthly(statsData.monthly || []);
        setByCategory(statsData.byCategory || []);
      } catch (e) {
        setError(e.message);
      }
    }
    load();
  }, [token, start, end]);

  const balance = stats.total_income - stats.total_expense;
  // build last 10 days income/expense series
  const last10Dates = Array.from({ length: 10 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (9 - i));
    const iso = d.toISOString().slice(0, 10);
    const label = iso.slice(5); // MM-DD
    return { iso, label };
  });
  const dailySeries = last10Dates.map(({ iso, label }) => {
    let inc = 0; let exp = 0;
    for (const t of items) {
      const tDate = new Date(t.date).toISOString().slice(0,10);
      if (tDate === iso) {
        if (t.type === 'income') inc += Number(t.amount);
        else if (t.type === 'expense') exp += Number(t.amount);
      }
    }
    return { day: label, income: inc, expense: exp };
  });

  return (
    <div className="space-y-6">
      <BudgetSection token={token} />
      <div className="bg-white p-4 rounded shadow flex flex-col gap-3">
        <h3 className="font-semibold">Filter by Date Range</h3>
        <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-sm">Start</label>
          <input type="date" className="border rounded px-3 py-2" value={start} onChange={(e)=>setStart(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm">End</label>
          <input type="date" className="border rounded px-3 py-2" value={end} onChange={(e)=>setEnd(e.target.value)} />
        </div>
          <button className="px-3 py-2 bg-primary text-white rounded" onClick={()=>{ /* state changes trigger reload */ }}>Apply</button>
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <StatCard title="Income" value={stats.total_income} color="text-green-600" />
        <StatCard title="Expenses" value={stats.total_expense} color="text-red-600" />
        <StatCard title="Balance" value={balance} color="text-blue-700" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow h-80">
          <h3 className="font-semibold mb-3">Monthly Income vs Expense</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(v)=>`₹${Number(v).toFixed(0)}`} />
              <Tooltip formatter={(val,name)=>[`₹${Number(val).toFixed(2)}`, name]} />
              <Legend />
              <Line type="monotone" dataKey="income" stroke="#10b981" />
              <Line type="monotone" dataKey="expense" stroke="#ef4444" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-4 rounded shadow h-80">
          <h3 className="font-semibold mb-3">Expense by Category</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={byCategory} dataKey="total" nameKey="category" outerRadius={100}>
                {byCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={["#3b82f6","#10b981","#f59e0b","#ef4444","#8b5cf6"][index % 5]} />
                ))}
              </Pie>
              <Tooltip formatter={(val,name)=>[`₹${Number(val).toFixed(2)}`, name]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow h-80">
        <h3 className="font-semibold mb-3">Income and Expenses for last 10 days</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dailySeries}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis tickFormatter={(v)=>`₹${Number(v).toFixed(0)}`} />
            <Tooltip formatter={(val,name)=>[`₹${Number(val).toFixed(2)}`, name]} />
            <Legend />
            <Line type="monotone" dataKey="income" stroke="#10b981" />
            <Line type="monotone" dataKey="expense" stroke="#ef4444" />
          </LineChart>
        </ResponsiveContainer>
      </div>


      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-3">Recent Transactions</h3>
        {error && <div className="mb-3 p-2 bg-red-100 text-red-700 rounded">{error}</div>}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">Date</th>
                <th>Type</th>
                <th>Category</th>
                <th className="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.slice(0, 10).map(tx => (
                <tr key={tx.id} className="border-b last:border-0">
                  <td className="py-2">{new Date(tx.date).toLocaleDateString()}</td>
                  <td className={tx.type === 'income' ? 'text-green-600' : 'text-red-600'}>{tx.type}</td>
                  <td>{(tx.note && tx.note.includes('saved_to:')) ? `saved to ${tx.note.split('saved_to:')[1]}` : tx.category}</td>
                  <td className="text-right">₹{Number(tx.amount).toFixed(2)}</td>
                  <td className="text-right">
                    <button
                      className="text-red-600 hover:underline"
                      onClick={async ()=>{
                        try {
                          await deleteTransaction(token, tx.id);
                          const data = await request('/transactions', { token });
                          setItems(data.transactions);
                          setStats({
                            total_income: Number(data.stats?.total_income || 0),
                            total_expense: Number(data.stats?.total_expense || 0)
                          });
                        } catch (e) { setError(e.message); }
                      }}
                    >Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, color }) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <div className="text-sm text-gray-500">{title}</div>
      <div className={`text-2xl font-bold ${color}`}>₹{Number(value).toFixed(2)}</div>
    </div>
  );
}

import { getBudgetProgress, setBudget } from '../services/budgets';

function BudgetSection({ token }) {
  const [budgetMonth, setBudgetMonth] = useState(() => new Date().toISOString().slice(0,7));
  const [budget, setBudgetState] = useState({ limit_amount: 0, spent: 0 });

  useEffect(()=>{ (async ()=>{
    try {
      const b = await getBudgetProgress(token, budgetMonth);
      setBudgetState(b.progress);
      
    } catch(_){}
  })(); }, [token, budgetMonth]);

  const overBudget = budget.limit_amount > 0 && budget.spent > budget.limit_amount;
  const percent = budget.limit_amount > 0 ? Math.min(100, (budget.spent / budget.limit_amount) * 100) : 0;

  return (
    <div className="grid md:grid-cols-1 gap-4">
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-2">Monthly Budget</h3>
        <div className="flex gap-2 mb-2">
          <input type="month" className="border rounded px-3 py-2" value={budgetMonth} onChange={(e)=>setBudgetMonth(e.target.value)} />
          <input type="number" className="border rounded px-3 py-2" placeholder="Limit" onChange={(e)=>setBudgetState(s=>({...s, limit_amount:Number(e.target.value)||0}))} />
          <button className="px-3 py-2 bg-primary text-white rounded" onClick={async ()=>{ await setBudget(token, budgetMonth, budget.limit_amount); const b=await getBudgetProgress(token, budgetMonth); setBudgetState(b.progress); }}>Save</button>
        </div>
        <div className="h-3 bg-gray-200 rounded">
          <div className={`h-3 rounded ${overBudget ? 'bg-red-500' : 'bg-accent'}`} style={{ width: `${percent}%` }}></div>
        </div>
        <div className="text-sm mt-1 flex items-center gap-2">
          <span>₹{budget.spent.toFixed(2)} / ₹{budget.limit_amount.toFixed(2)} spent</span>
          {overBudget && <span className="text-red-600 font-semibold">Over budget</span>}
        </div>
      </div>
      
    </div>
  );
}
