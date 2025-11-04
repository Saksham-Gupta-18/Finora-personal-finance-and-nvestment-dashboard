import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { listAssets, createAsset, deleteAsset, updateAsset } from '../services/portfolio';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { formatIndianNumber } from '../utils/formatNumber';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Portfolio() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ asset_name: '', type: 'stock', quantity: '', buy_price: '', current_price: '' });
  const [error, setError] = useState('');

  async function refresh() {
    try {
      const res = await listAssets(token);
      setItems(res.assets);
    } catch (e) { setError(e.message); }
  }
  useEffect(()=>{ refresh(); }, [token]);

  const pieData = useMemo(() => items.map(a => ({ name: a.asset_name, value: Number(a.quantity) * Number(a.current_price) })), [items]);
  const lineData = useMemo(() => items.map(a => ({ name: a.asset_name, gain: (a.current_price - a.buy_price) * a.quantity })), [items]);
  const summary = useMemo(() => {
    const totalValue = items.reduce((s, a)=> s + Number(a.quantity) * Number(a.current_price), 0);
    const totalCost = items.reduce((s, a)=> s + Number(a.quantity) * Number(a.buy_price), 0);
    const diff = totalValue - totalCost;
    return { totalValue, totalCost, diff };
  }, [items]);

  async function add(e) {
    e.preventDefault(); setError('');
    try { await createAsset(token, { ...form, quantity: Number(form.quantity), buy_price: Number(form.buy_price), current_price: Number(form.current_price) });
      setForm({ asset_name: '', type: 'stock', quantity: '', buy_price: '', current_price: '' });
      await refresh();
    } catch (e) { setError(e.message); }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded shadow">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Portfolio {summary.diff >= 0 ? 'Profit' : 'Loss'}</h2>
          <div className={`text-lg font-bold ${summary.diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>₹{formatIndianNumber(Math.abs(summary.diff))}</div>
        </div>
        <div className="text-sm text-gray-600">Value ₹{formatIndianNumber(summary.totalValue)} vs Cost ₹{formatIndianNumber(summary.totalCost)}</div>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-3">Add Asset</h2>
        {error && <div className="mb-3 p-2 bg-red-100 text-red-700 rounded">{error}</div>}
        <form onSubmit={add} className="grid md:grid-cols-6 gap-2">
          <input className="border rounded px-3 py-2" placeholder="Asset name" value={form.asset_name} onChange={(e)=>setForm({...form, asset_name:e.target.value})} />
          <select className="border rounded px-3 py-2" value={form.type} onChange={(e)=>setForm({...form, type:e.target.value})}>
            <option value="stock">Stock</option>
            <option value="mutual_fund">Mutual Fund</option>
            <option value="crypto">Crypto</option>
            <option value="other">Other</option>
          </select>
          <input className="border rounded px-3 py-2" placeholder="Quantity" type="number" step="0.00000001" value={form.quantity} onChange={(e)=>setForm({...form, quantity:e.target.value})} />
          <input className="border rounded px-3 py-2" placeholder="Buy price" type="number" step="0.00000001" value={form.buy_price} onChange={(e)=>setForm({...form, buy_price:e.target.value})} />
          <input className="border rounded px-3 py-2" placeholder="Current price" type="number" step="0.00000001" value={form.current_price} onChange={(e)=>setForm({...form, current_price:e.target.value})} />
          <button className="px-3 py-2 bg-accent text-white rounded">Add</button>
        </form>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-2">Assets</h3>
        <div className="text-sm mb-2">Portfolio {summary.diff >= 0 ? <span className="text-green-600">Profit</span> : <span className="text-red-600">Loss</span>}: ₹{formatIndianNumber(summary.diff)} (Value ₹{formatIndianNumber(summary.totalValue)} vs Cost ₹{formatIndianNumber(summary.totalCost)})</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">Asset</th><th>Type</th><th className="text-right">Qty</th><th className="text-right">Buy</th><th className="text-right">Current</th><th className="text-right">P/L</th><th></th>
              </tr>
            </thead>
            <tbody>
              {items.map(a => {
                const pl = (a.current_price - a.buy_price) * a.quantity;
                return (
                  <AssetRow key={a.id} token={token} asset={a} onChanged={refresh} pnl={pl} />
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow h-80">
          <h3 className="font-semibold mb-2">Portfolio Allocation</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={100}>
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(val,name)=>[`₹${formatIndianNumber(val)}`, name]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-4 rounded shadow h-80">
          <h3 className="font-semibold mb-2">Unrealized Gains</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(v)=>`₹${formatIndianNumber(v, 0)}`} />
              <Tooltip formatter={(val,name)=>[`₹${formatIndianNumber(val)}`, name]} />
              <Legend />
              <Line type="monotone" dataKey="gain" stroke="#3b82f6" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}


function AssetRow({ token, asset, onChanged, pnl }) {
  const [editing, setEditing] = React.useState(false);
  const [price, setPrice] = React.useState(asset.current_price);
  return (
    <tr className="border-b last:border-0">
      <td className="py-2">{asset.asset_name}</td>
      <td>{asset.type}</td>
      <td className="text-right">{Number(asset.quantity)}</td>
      <td className="text-right">₹{formatIndianNumber(asset.buy_price)}</td>
      <td className="text-right">
        {editing ? (
          <div className="flex items-center gap-2 justify-end">
            <input className="border rounded px-2 py-1 w-28 text-right" type="number" step="0.00000001" value={price} onChange={(e)=>setPrice(e.target.value)} />
            <button className="text-primary" onClick={async ()=>{ await updateAsset(token, asset.id, { current_price: Number(price) }); setEditing(false); await onChanged(); }}>Save</button>
            <button className="text-gray-600" onClick={()=>{ setEditing(false); setPrice(asset.current_price); }}>Cancel</button>
          </div>
        ) : (
          <>
            ₹{formatIndianNumber(asset.current_price)}
            <button className="ml-2 text-blue-600" onClick={()=>setEditing(true)}>Edit</button>
          </>
        )}
      </td>
      <td className={`text-right ${pnl>=0?'text-green-600':'text-red-600'}`}>₹{formatIndianNumber(pnl)}</td>
      <td className="text-right"><button className="text-red-600" onClick={async ()=>{ await deleteAsset(token, asset.id); await onChanged(); }}>Delete</button></td>
    </tr>
  );
}

