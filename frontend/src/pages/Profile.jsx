import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import * as authApi from '../services/auth';

export default function Profile() {
  const { token, user, refreshProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [message, setMessage] = useState('');

  useEffect(() => {
    setName(user?.name || '');
    setEmail(user?.email || '');
  }, [user]);

  async function handleSave(e) {
    e.preventDefault();
    setMessage('');
    await authApi.updateProfile(token, { name });
    await refreshProfile();
    setMessage('Profile updated');
  }

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Profile</h2>
      {message && <div className="mb-3 p-2 bg-green-100 text-green-800 rounded">{message}</div>}
      <form onSubmit={handleSave} className="space-y-3">
        <div>
          <label className="block mb-1 text-sm">Name</label>
          <input className="w-full border rounded px-3 py-2" value={name} onChange={(e)=>setName(e.target.value)} />
        </div>
        <div>
          <label className="block mb-1 text-sm">Email</label>
          <input className="w-full border rounded px-3 py-2 bg-gray-100" value={email} disabled />
        </div>
        <button className="w-full bg-primary text-white py-2 rounded">Save</button>
      </form>
    </div>
  );
}


