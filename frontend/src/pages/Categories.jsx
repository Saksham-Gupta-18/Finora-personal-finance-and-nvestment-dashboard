import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { listCategories, createCategory, deleteCategory } from '../services/categories';

export default function Categories() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  async function refresh() {
    try {
      const res = await listCategories(token);
      setItems(res.categories);
    } catch (e) { setError(e.message); }
  }

  useEffect(()=>{ refresh(); }, [token]);

  async function add(e) {
    e.preventDefault();
    setError('');
    try { await createCategory(token, name); setName(''); await refresh(); } catch (e) { setError(e.message); }
  }

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-3">Categories</h2>
        {error && <div className="mb-3 p-2 bg-red-100 text-red-700 rounded">{error}</div>}
        <form onSubmit={add} className="flex gap-2">
          <input className="border rounded px-3 py-2 flex-1" value={name} onChange={(e)=>setName(e.target.value)} placeholder="New category" />
          <button className="px-3 py-2 bg-primary text-white rounded">Add</button>
        </form>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <ul className="divide-y">
          {items.map(c => (
            <li key={c.id} className="py-2 flex items-center justify-between">
              <span>{c.name}</span>
              <button className="text-red-600" onClick={async ()=>{ await deleteCategory(token, c.id); await refresh(); }}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}


