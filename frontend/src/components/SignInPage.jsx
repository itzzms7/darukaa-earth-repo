import { useState } from 'react';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import { api } from '../api/client.js';

export default function SignInPage({ onSuccess, onNavigateToSignUp }) {
  const [email, setEmail] = useState('iamxuhail@gmail.com');
  const [password, setPassword] = useState('••••••••');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await api.login(email, password);
      if (result.success && result.user) {
        onSuccess(result.user);
      } else {
        setError(result.message || 'Unable to sign in. Please verify your credentials.');
      }
    } catch (err) {
      setError('Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="signin-page" className="max-w-md mx-auto py-6 sm:py-10">
      {/* Card Container (Transparent card bg) */}
      <div className="bg-transparent rounded-2xl border border-[#2D3139]/70 p-8 liquid-crystal-card relative overflow-hidden">
        {/* Subtle Brand Accent Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-transparent border border-[#2D3139]/70 text-blue-400 mb-3 shadow-lg shadow-blue-500/10">
            <LogIn className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-[#F3F4F6] tracking-tight">Sign In</h1>
          <p className="text-xs text-[#9CA3AF] font-medium mt-1">
            Access your Darukaa Earth geospatial workspace
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-xs text-red-400 flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">
              Email Address / Username
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-transparent text-[#F3F4F6] placeholder-[#6B7280] border border-[#2D3139]/70 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-transparent text-[#F3F4F6] placeholder-[#6B7280] border border-[#2D3139]/70 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-[#9CA3AF]">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-[#2D3139] bg-white/[0.04] text-blue-500 focus:ring-blue-500/20"
              />
              Remember me
            </label>
            <span className="text-[#9CA3AF] hover:text-blue-400 cursor-pointer text-[11px] font-medium transition-colors">
              Forgot password?
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 disabled:opacity-50 font-semibold rounded-xl text-xs cursor-pointer flex items-center justify-center gap-2 mt-2 btn-crystal-blue"
          >
            {loading ? 'Authenticating...' : 'Sign In to Workspace'}
          </button>
        </form>

        {/* Navigation to Sign Up */}
        <div className="mt-5 text-center text-xs text-[#9CA3AF]">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onNavigateToSignUp}
            className="font-semibold text-blue-400 hover:underline cursor-pointer"
          >
            Create account
          </button>
        </div>
      </div>
    </div>
  );
}
