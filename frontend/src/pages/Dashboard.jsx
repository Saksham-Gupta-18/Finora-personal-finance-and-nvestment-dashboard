import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { request } from '../services/api';
import { deleteTransaction } from '../services/transactions';
import Chart from '../components/Chart';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { formatIndianNumber } from '../utils/formatNumber';

export default function Dashboard() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({ total_income: 0, total_expense: 0, total_saving: 0 });
  const [error, setError] = useState('');
  const [monthly, setMonthly] = useState([]);
  const [byCategory, setByCategory] = useState([]);
  const [bySaving, setBySaving] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [savingsForecast, setSavingsForecast] = useState({ goals: [] });
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [budgetMonth, setBudgetMonth] = useState(() => new Date().toISOString().slice(0,7));
  const [budget, setBudget] = useState({ limit_amount: 0, spent: 0 });

  useEffect(() => {
    async function load() {
      try {
        const data = await request(`/transactions?start=${encodeURIComponent(start||'')}&end=${encodeURIComponent(end||'')}`, { token });
        const statsData = await request(`/transactions/stats/summary?start=${encodeURIComponent(start||'')}&end=${encodeURIComponent(end||'')}`, { token });
        const fc = await request('/forecast', { token });
        const sfc = await request('/forecast/savings', { token });
        setItems(data.transactions);
        setStats({
          total_income: Number(data.stats?.total_income || statsData.totals?.total_income || 0),
          total_expense: Number(data.stats?.total_expense || statsData.totals?.total_expense || 0),
          total_saving: Number(data.stats?.total_saving || statsData.totals?.total_saving || 0)
        });
        setMonthly(statsData.monthly || []);
        setByCategory(statsData.byCategory || []);
        setBySaving(statsData.bySaving || []);
        setForecast(fc || null);
        setSavingsForecast(sfc || { goals: [] });
      } catch (e) {
        setError(e.message);
      }
    }
    load();
  }, [token, start, end]);

  const balance = stats.total_income - stats.total_expense;
  // build last 10 days income/expense series
  const last10Dates = Array.from({ length: 10 }, (_, i) => {
    const d = end ? new Date(end) : new Date();
    d.setDate(d.getDate() - (9 - i));
    const iso = d.toISOString().slice(0, 10);
    const label = iso.slice(5); // MM-DD
    return { iso, label };
  });
  const dailySeries = last10Dates.map(({ iso, label }) => {
    let inc = 0; let exp = 0; let sav = 0;
    for (const t of items) {
      const tDateIso = new Date(t.date).toISOString().slice(0,10);
      // apply optional start/end filter to daily series too
      const withinStart = !start || tDateIso >= start;
      const withinEnd = !end || tDateIso <= end;
      if (!(withinStart && withinEnd)) continue;
      if (tDateIso === iso) {
        if (t.type === 'income') inc += Number(t.amount);
        else if (t.type === 'expense') exp += Number(t.amount);
        else if (t.type === 'saving') sav += Number(t.amount);
      }
    }
    return { day: label, income: inc, expense: exp, saving: sav };
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
          <button className="px-3 py-2 bg-gray-200 text-gray-800 rounded" onClick={()=>{ setStart(''); setEnd(''); }}>Reset</button>
        </div>
      </div>
      <div className="grid md:grid-cols-4 gap-4">
        <StatCard title="Income" value={stats.total_income} color="text-green-600" />
        <StatCard title="Expenses" value={stats.total_expense} color="text-red-600" />
        <StatCard title="Balance" value={balance} color="text-blue-700" />
        <StatCard title="Total Savings" value={stats.total_saving} color="text-blue-600" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow h-80">
          <h3 className="font-semibold mb-3">Monthly Income vs Expense</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(v)=>`₹${formatIndianNumber(v, 0)}`} />
              <Tooltip formatter={(val,name)=>[`₹${formatIndianNumber(val)}`, name]} />
              <Legend />
              <Line type="monotone" dataKey="income" stroke="#10b981" />
              <Line type="monotone" dataKey="expense" stroke="#ef4444" />
              {/* Optionally show savings as a line if desired */}
              {/* <Line type="monotone" dataKey="saving" stroke="#3b82f6" /> */}
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
              <Tooltip formatter={(val,name)=>[`₹${formatIndianNumber(val)}`, name]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Savings by Category */}
      <div className="bg-white p-4 rounded shadow h-80">
        <h3 className="font-semibold mb-3">Savings by Category/Goal</h3>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={bySaving} dataKey="total" nameKey="category" outerRadius={100}>
              {bySaving.map((entry, index) => (
                <Cell key={`scell-${index}`} fill={["#3b82f6","#60a5fa","#93c5fd","#1d4ed8","#2563eb"][index % 5]} />
              ))}
            </Pie>
            <Tooltip formatter={(val,name)=>[`₹${formatIndianNumber(val)}`, name]} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Forecast Section */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-2">Forecast</h3>
        {forecast?.message && (
          <div className="mb-3 text-sm">
            {forecast.message}
          </div>
        )}
        {forecast?.monthly && forecast?.forecast_next_month !== undefined && (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={(function(){
                const last6 = (forecast.monthly || []).slice(-6);
                // next month label
                let nextLabel = '';
                if (last6.length) {
                  const last = last6[last6.length - 1].month; // YYYY-MM
                  const [y,m] = last.split('-').map(Number);
                  const d = new Date(y, (m||1)-1, 1);
                  d.setMonth(d.getMonth()+1);
                  nextLabel = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
                }
                return [
                  ...last6.map(x => ({ month: x.month, expense: Number(x.expense||0), isForecast: false })),
                  { month: nextLabel || 'Next', expense: Number(forecast.forecast_next_month||0), isForecast: true }
                ];
              })()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(v)=>`₹${formatIndianNumber(v, 0)}`} />
                <Tooltip formatter={(val,name)=>[`₹${formatIndianNumber(val)}`, name]} />
                <Legend />
                <Line type="monotone" dataKey="expense" stroke="#3b82f6" strokeDasharray="3 0"
                  dot={{ r: 3 }}
                  isAnimationActive={false}
                  name="Expense" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Goals Completion Forecast */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-2">Savings Goals – Expected Completion</h3>
        {Array.isArray(savingsForecast?.goals) && savingsForecast.goals.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Goal</th>
                  <th>Saved</th>
                  <th>Target</th>
                  <th>Est. Completion</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {savingsForecast.goals.map((g, idx) => {
                  const goal = g.goal || {};
                  const f = g.forecast || {};
                  const statusLabel = f.not_enough_data ? 'Not enough data' : (f.status === 'on_track' ? 'On Track' : f.status === 'slightly_behind' ? 'Slightly Behind' : f.status === 'behind' ? 'Behind' : '—');
                  const statusColor = f.not_enough_data ? 'text-gray-600' : (f.status === 'on_track' ? 'text-green-600' : f.status === 'slightly_behind' ? 'text-orange-500' : f.status === 'behind' ? 'text-red-600' : 'text-gray-600');
                  return (
                    <tr key={goal.id || idx} className="border-b last:border-0">
                      <td className="py-2">{goal.name}</td>
                      <td>₹{formatIndianNumber(goal.current_savings||0)}</td>
                      <td>₹{formatIndianNumber(goal.target_amount||0)} by {goal.target_date ? new Date(goal.target_date).toLocaleDateString() : '—'}</td>
                      <td>{f.not_enough_data ? '—' : (f.estimated_completion_date || '—')}</td>
                      <td className={statusColor}>{statusLabel}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-sm text-gray-600">No goals found.</div>
        )}
      </div>

      <div className="bg-white p-4 rounded shadow h-80">
        <h3 className="font-semibold mb-3">Income, Expenses and Savings for last 10 days</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dailySeries}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis tickFormatter={(v)=>`₹${formatIndianNumber(v, 0)}`} />
            <Tooltip formatter={(val,name)=>[`₹${formatIndianNumber(val)}`, name]} />
            <Legend />
            <Line type="monotone" dataKey="income" stroke="#10b981" />
            <Line type="monotone" dataKey="expense" stroke="#ef4444" />
            <Line type="monotone" dataKey="saving" stroke="#3b82f6" />
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
              {items.map(tx => (
                <tr key={tx.id} className="border-b last:border-0">
                  <td className="py-2">{new Date(tx.date).toLocaleDateString()}</td>
                  <td className={tx.type === 'income' ? 'text-green-600' : 'text-red-600'}>{tx.type}</td>
                  <td>{(tx.note && tx.note.includes('saved_to:')) ? `saved to ${tx.note.split('saved_to:')[1]}` : tx.category}</td>
                  <td className="text-right">₹{formatIndianNumber(tx.amount)}</td>
                  <td className="text-right">
                    <button
                      className="text-red-600 hover:underline"
                      onClick={async ()=>{
                        try {
                          await deleteTransaction(token, tx.id);
                          const data = await request(`/transactions?start=${encodeURIComponent(start||'')}&end=${encodeURIComponent(end||'')}`, { token });
                          setItems(data.transactions);
                          setStats({
                            total_income: Number(data.stats?.total_income || 0),
                            total_expense: Number(data.stats?.total_expense || 0),
                            total_saving: Number(data.stats?.total_saving || 0)
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
      <div className={`text-2xl font-bold ${color}`}>₹{formatIndianNumber(value)}</div>
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
          <span>₹{formatIndianNumber(budget.spent)} / ₹{formatIndianNumber(budget.limit_amount)} spent</span>
          {overBudget && <span className="text-red-600 font-semibold">Over budget</span>}
        </div>
      </div>
      
    </div>
  );
}
