'use client';

import { useState } from "react";

export default function AuthForm() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          password,
          email,
          mode,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      
      // Store token and user in localStorage
      if (data.token && data.user) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('authUser', JSON.stringify(data.user));
      }
      
      // Redirect to home page
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto mt-8">
      <h2 className="text-xl font-bold mb-2">{mode === 'login' ? 'Login' : 'Register'}</h2>
      <div>
        <label className="block mb-1">Username</label>
        <input value={username} onChange={e => setUsername(e.target.value)} required className="w-full border px-2 py-1 rounded" />
      </div>
      {mode === 'register' && (
        <div>
          <label className="block mb-1">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full border px-2 py-1 rounded" />
        </div>
      )}
      <div>
        <label className="block mb-1">Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full border px-2 py-1 rounded" />
      </div>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded">{loading ? 'Processing...' : (mode === 'login' ? 'Login' : 'Register')}</button>
      <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="w-full mt-2 text-blue-600 underline">{mode === 'login' ? 'Need an account? Register' : 'Already have an account? Login'}</button>
    </form>
  );
}
