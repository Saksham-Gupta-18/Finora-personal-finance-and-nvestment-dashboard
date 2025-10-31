import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
  const { signOut } = useAuth();
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[240px_1fr]">
      <aside className="bg-white border-r p-4 flex md:flex-col gap-3 items-center md:items-stretch sticky top-0 md:h-screen">
        <div className="text-2xl font-bold text-primary">Finora</div>
        <nav className="flex md:flex-col gap-2 w-full">
          <NavItem to="/dashboard" label="Dashboard" />
          <NavItem to="/add" label="Add Tx" />
          <NavItem to="/categories" label="Categories" />
          <NavItem to="/portfolio" label="Portfolio" />
          <NavItem to="/savings-goals" label="Savings Goals" />
          <NavItem to="/profile" label="Profile" />
        </nav>
        <button onClick={signOut} className="ml-auto md:ml-0 mt-auto px-3 py-1 rounded bg-gray-800 text-white">Logout</button>
      </aside>
      <div className="flex flex-col">
        <header className="bg-white border-b p-3 flex items-center justify-between">
          <div className="font-semibold">Personal Finance & Investment Dashboard</div>
        </header>
        <main className="p-4 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

function NavItem({ to, label }) {
  return (
    <NavLink to={to} className={({isActive})=>`px-3 py-2 rounded hover:bg-gray-100 ${isActive? 'bg-gray-100 text-primary font-semibold':''}`}>{label}</NavLink>
  );
}


