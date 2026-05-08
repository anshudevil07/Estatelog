import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { HiMail, HiLockClosed, HiEye, HiEyeOff, HiArrowRight } from "react-icons/hi";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { validateEmail } from "../utils/validators";

// Floating property cards shown on the left panel
const floatingCards = [
  { title: "Sunset Villa", location: "Mumbai, MH", price: "₹2.4Cr", badge: "Available", color: "from-violet-500 to-purple-600", delay: "0s" },
  { title: "Sky Penthouse", location: "Pune, MH", price: "₹5.1Cr", badge: "Featured", color: "from-blue-500 to-cyan-500", delay: "0.4s" },
  { title: "Green Residency", location: "Bangalore, KA", price: "₹98L", badge: "Sold", color: "from-emerald-500 to-teal-500", delay: "0.8s" },
];

// Animated stat counter
function StatCard({ value, label, delay }) {
  return (
    <div
      className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center"
      style={{ animationDelay: delay }}
    >
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="text-violet-200 text-xs mt-0.5">{label}</p>
    </div>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const toast = useToast();

  const from = location.state?.from?.pathname || "/dashboard";

  const [form, setForm] = useState({ email: "", password: "", remember: true });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function validate() {
    const errs = {};
    if (!form.email) errs.email = "Email is required";
    else if (!validateEmail(form.email)) errs.email = "Enter a valid email";
    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 6) errs.password = "Minimum 6 characters";
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      const userData = await login(form.email, form.password);
      toast.success(`Welcome back, ${userData.name || "User"}!`);
      if (userData.role === "admin") navigate("/admin/dashboard", { replace: true });
      else if (userData.role === "manager") navigate("/manager/dashboard", { replace: true });
      else navigate("/agent/dashboard", { replace: true });
    } catch (err) {
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        toast.error("Invalid email or password");
      } else if (err.code === "auth/too-many-requests") {
        toast.error("Too many attempts. Please try again later.");
      } else {
        toast.error("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-slate-950 overflow-hidden">

      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900 via-violet-700 to-indigo-900" />

        {/* Animated mesh blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-violet-500 rounded-full opacity-20 blur-3xl animate-pulse" />
          <div className="absolute top-1/2 -right-20 w-80 h-80 bg-indigo-400 rounded-full opacity-20 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-purple-500 rounded-full opacity-20 blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "40px 40px"
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-xl">E</span>
            </div>
            <div>
              <span className="text-white font-black text-xl tracking-tight">EstateFlow</span>
              <p className="text-violet-300 text-xs">Real Estate CRM</p>
            </div>
          </div>

          {/* Main headline */}
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-white/80 text-xs font-medium">Trusted by 500+ agents across India</span>
            </div>

            <h1 className="text-5xl font-black text-white leading-tight mb-4">
              Close more deals,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-200 to-pink-200">
                faster than ever.
              </span>
            </h1>
            <p className="text-violet-200 text-lg leading-relaxed max-w-md">
              India's most powerful real estate CRM. Manage properties, track leads, and grow your business.
            </p>
          </div>

          {/* Floating property cards */}
          <div className="space-y-3">
            {floatingCards.map((card, i) => (
              <div
                key={card.title}
                className="flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 hover:bg-white/15 transition-all duration-300 hover:translate-x-1"
                style={{
                  animation: "slideInLeft 0.6s ease forwards",
                  animationDelay: `${i * 0.15}s`,
                  opacity: 0,
                }}
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shrink-0 shadow-lg`}>
                  <span className="text-white text-lg">🏠</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm">{card.title}</p>
                  <p className="text-violet-300 text-xs">{card.location}</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold text-sm">{card.price}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    card.badge === "Available" ? "bg-emerald-500/20 text-emerald-300" :
                    card.badge === "Featured" ? "bg-amber-500/20 text-amber-300" :
                    "bg-blue-500/20 text-blue-300"
                  }`}>
                    {card.badge}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <StatCard value="2,400+" label="Properties" delay="0s" />
            <StatCard value="₹210Cr+" label="Deals Closed" delay="0.1s" />
            <StatCard value="500+" label="Agents" delay="0.2s" />
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-950 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-900/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-900/20 rounded-full blur-3xl pointer-events-none" />

        {/* Form card */}
        <div
          className={`relative w-full max-w-md transition-all duration-700 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center">
              <span className="text-white font-bold">E</span>
            </div>
            <span className="text-white font-bold text-xl">EstateFlow</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-black text-white mb-2">Welcome back</h2>
            <p className="text-slate-400">Sign in to your EstateFlow account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">

            {/* Email field */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Email address</label>
              <div className={`relative transition-all duration-200 ${focused === "email" ? "scale-[1.01]" : ""}`}>
                <HiMail className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focused === "email" ? "text-violet-400" : "text-slate-500"}`} />
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused("")}
                  placeholder="you@estateflow.com"
                  autoComplete="email"
                  className={`w-full pl-11 pr-4 py-3.5 rounded-xl text-sm bg-slate-900 border text-white placeholder:text-slate-600 focus:outline-none transition-all duration-200 ${
                    errors.email
                      ? "border-red-500 focus:border-red-400 focus:ring-2 focus:ring-red-500/20"
                      : focused === "email"
                      ? "border-violet-500 ring-2 ring-violet-500/20"
                      : "border-slate-800 hover:border-slate-700"
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <span>⚠</span> {errors.email}
                </p>
              )}
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Password</label>
              <div className={`relative transition-all duration-200 ${focused === "password" ? "scale-[1.01]" : ""}`}>
                <HiLockClosed className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focused === "password" ? "text-violet-400" : "text-slate-500"}`} />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused("")}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={`w-full pl-11 pr-12 py-3.5 rounded-xl text-sm bg-slate-900 border text-white placeholder:text-slate-600 focus:outline-none transition-all duration-200 ${
                    errors.password
                      ? "border-red-500 focus:border-red-400 focus:ring-2 focus:ring-red-500/20"
                      : focused === "password"
                      ? "border-violet-500 ring-2 ring-violet-500/20"
                      : "border-slate-800 hover:border-slate-700"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <HiEyeOff className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <span>⚠</span> {errors.password}
                </p>
              )}
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    name="remember"
                    checked={form.remember}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                    form.remember ? "bg-violet-600 border-violet-600" : "border-slate-600 bg-transparent"
                  }`}>
                    {form.remember && <span className="text-white text-xs font-bold">✓</span>}
                  </div>
                </div>
                <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-violet-400 hover:text-violet-300 font-medium transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full relative overflow-hidden group bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold py-3.5 rounded-xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-violet-900/40 hover:shadow-violet-900/60 hover:scale-[1.01] active:scale-[0.99]"
            >
              {/* Shimmer effect */}
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

              <span className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <HiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-xs text-slate-600">or</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          {/* Sign up link */}
          <p className="text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-violet-400 hover:text-violet-300 font-semibold transition-colors"
            >
              Create one free →
            </Link>
          </p>

          {/* Security note */}
          <p className="text-center text-xs text-slate-700 mt-6 flex items-center justify-center gap-1.5">
            <span>🔒</span>
            Secured with Firebase Authentication
          </p>
        </div>
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
