import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NavBar() {
  const { token, user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-primary">Finora</Link>
        <nav className="flex items-center gap-4">
          <NavLink to="/" className={({isActive})=>`hover:text-primary ${isActive?'text-primary':''}`}>Home</NavLink>
          {token && (
            <>
              <NavLink to="/dashboard" className={({isActive})=>`hover:text-primary ${isActive?'text-primary':''}`}>Dashboard</NavLink>
              <NavLink to="/profile" className={({isActive})=>`hover:text-primary ${isActive?'text-primary':''}`}>Profile</NavLink>
            </>
          )}
        </nav>
        <div className="flex items-center gap-3">
          {!token ? (
            <>
              <button onClick={()=>navigate('/signin')} className="px-3 py-1 rounded border">Sign In</button>
              <button onClick={()=>navigate('/signup')} className="px-3 py-1 rounded bg-primary text-white">Sign Up</button>
            </>
          ) : (
            <>
              <span className="hidden sm:inline text-sm text-gray-600">Hi, {user?.name || 'User'}</span>
              <button onClick={signOut} className="px-3 py-1 rounded bg-gray-800 text-white">Logout</button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}


