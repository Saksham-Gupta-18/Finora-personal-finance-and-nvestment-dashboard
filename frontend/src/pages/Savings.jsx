import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, PieChart, Pie, Cell } from 'recharts';
import { request } from '../services/api';

export default function Savings() {
  const { token } = useAuth();
  const [progress, setProgress] = useState([]);
  const [error, setError] = useState('');

  useEffect(()=>{ (async ()=>{
    try {
      const res = await request('/goals/progress', { token });
      setProgress(res.progress || []);
    } catch(e) { setError(e.message); }
  })(); }, [token]);

  const pie = progress.map(g => ({ name: g.name, value: g.current_savings }));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Savings</h2>
      {error && <div className="p-2 bg-red-100 text-red-700 rounded">{error}</div>}
      <div className="bg-white p-4 rounded shadow h-80">
        <h3 className="font-semibold mb-2">Goal Contributions</h3>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={pie} dataKey="value" nameKey="name" outerRadius={110}>
              {pie.map((_, i) => <Cell key={i} fill={["#10b981", "#3b82f6", "#f59e0b", "#ef4444"][i%4]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-2">Goals</h3>
        <ul className="divide-y">
          {progress.map(g => (
            <li key={g.id} className="py-2 flex justify-between">
              <div>
                <div className="font-semibold">{g.name}</div>
                <div className="text-sm text-gray-600">Target ₹{g.target_amount.toFixed(2)} by {new Date(g.target_date).toLocaleDateString()}</div>
              </div>
              <div className="w-48">
                <div className="h-2 bg-gray-200 rounded">
                  <div className="h-2 rounded bg-blue-600" style={{ width: `${Math.min(100, g.progress)}%` }}></div>
                </div>
                <div className="text-xs mt-1 text-right">₹{g.current_savings.toFixed(2)} saved</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}


