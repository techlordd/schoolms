// src/pages/auth/LoginPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Eye, EyeOff, Loader2 } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore(s => s.login);
  const [form, setForm]     = useState({ email: 'admin@educore.ng', password: 'Admin@123' });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email.trim(), form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const demos = [
    { label: 'Admin',        email: 'admin@educore.ng',   pw: 'Admin@123'   },
    { label: 'Head Teacher', email: 'head@educore.ng',    pw: 'Head@123'    },
    { label: 'Teacher',      email: 'teacher1@educore.ng',pw: 'Teacher@123' },
    { label: 'Parent',       email: 'parent1@educore.ng', pw: 'Parent@123'  },
  ];

  return (
    <div className="min-h-screen bg-primary-600 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-4">
            <GraduationCap size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-white">EduCore SMS</h1>
          <p className="text-white/50 text-sm mt-1">School Management System</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-6 shadow-2xl">
          <h2 className="text-base font-semibold text-gray-800 mb-5">Sign in to your account</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input
                type="email" required
                className="input"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="you@school.com"
              />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'} required
                  className="input pr-10"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPw(v => !v)}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary w-full justify-center py-2.5">
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'Sign In'}
            </button>
          </form>

          {/* Quick demo logins */}
          <div className="mt-5 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-2 font-medium">Quick demo login:</p>
            <div className="grid grid-cols-2 gap-2">
              {demos.map(d => (
                <button key={d.label} className="btn btn-ghost btn-sm text-xs justify-start"
                  onClick={() => setForm({ email: d.email, password: d.pw })}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-white/30 text-xs mt-6">
          © 2025 EduCore SMS v1.0.0
        </p>
      </div>
    </div>
  );
}
