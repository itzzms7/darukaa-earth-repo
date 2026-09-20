import { useState } from 'react';
import { UserPlus, Mail, Lock, User, Building2, AlertCircle } from 'lucide-react';
import { api } from '../api/client.js';

export default function SignUpPage({ onSuccess, onNavigateToSignIn }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: 'Darukaa Earth',
    role: 'Admin',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const result = await api.register({
        name: formData.name,
        email: formData.email,
        organization: formData.organization,
        role: formData.role,
        password: formData.password,
      });

      if (result.success && result.user) {
        onSuccess(result.user);
      } else {
        setError(result.message || 'Unable to register. Please try again.');
      }
    } catch (err) {
      setError('Registration failed. Please check your information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="signup-page" className="max-w-md mx-auto py-6 sm:py-8">
      {/* Card Container */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-[#DEC8D4] shadow-xl shadow-pink-950/5 p-7 relative overflow-hidden">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#FAF0F4] border border-[#DEC8D4] text-[#D65D80] mb-3 shadow-xs">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-[#231C20] tracking-tight">Create Account</h1>
          <p className="text-xs text-[#756770] mt-1">
            Join the Darukaa Earth geospatial workspace
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-[#554A51] mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#A698A0] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Suhail"
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#DEC8D4] rounded-lg focus:outline-none focus:border-[#D65D80] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#554A51] mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#A698A0] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#DEC8D4] rounded-lg focus:outline-none focus:border-[#D65D80] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#554A51] mb-1">
              Organization
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-[#A698A0] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                placeholder="Darukaa Earth"
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#DEC8D4] rounded-lg focus:outline-none focus:border-[#D65D80] transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#554A51] mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#A698A0] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Min 6 chars"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#DEC8D4] rounded-lg focus:outline-none focus:border-[#D65D80] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#554A51] mb-1">
                Confirm
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#A698A0] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Repeat password"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#DEC8D4] rounded-lg focus:outline-none focus:border-[#D65D80] transition-colors"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-[#D65D80] hover:bg-[#C24D70] disabled:opacity-70 text-white font-semibold rounded-lg text-xs transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-2 mt-4"
          >
            {loading ? 'Creating Account...' : 'Register & Enter Workspace'}
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-[#756770]">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onNavigateToSignIn}
            className="font-semibold text-[#D65D80] hover:underline cursor-pointer"
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
}
