import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { HiMail, HiLockClosed, HiEye, HiEyeOff, HiArrowRight } from "react-icons/hi";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { validateEmail } from "../utils/validators";
import AuthIllustration from "../components/auth/AuthIllustration";

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
    const t = setTimeout(() => setMounted(true), 80);
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
    <div className="min-h-screen flex bg-[#0a0a0f]">

      {/* ── LEFT — Animated Illustration ── */}
      <div className="hidden lg:block lg:w-[55%] relative">
        <AuthIllustration variant="login" />
      </div>

      {/* ── RIGHT — Login Form ── */}
      <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden">

        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(79,70,229,0.06) 0%, transparent 70%)" }} />

        <div className={`relative w-full max-w-[400px] transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}>
              <span className="text-white font-black">E</span>
            </div>
            <span className="text-white font-black text-xl">EstateFlow</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <p className="text-purple-400 text-sm font-semibold tracking-widest uppercase mb-2">Welcome back</p>
            <h1 className="text-3xl font-black text-white leading-tight">Sign in to your<br />account</h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <HiMail className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${focused === "email" ? "text-purple-400" : "text-slate-600"}`} />
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused("")}
                  placeholder="you@estateflow.com"
                  autoComplete="email"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm text-white placeholder:text-slate-600 transition-all duration-200 outline-none"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: errors.email
                      ? "1px solid rgba(239,68,68,0.6)"
                      : focused === "email"
                      ? "1px solid rgba(167,139,250,0.6)"
                      : "1px solid rgba(255,255,255,0.08)",
                    boxShadow: focused === "email" ? "0 0 0 3px rgba(124,58,237,0.1)" : "none"
                  }}
                />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1"><span>⚠</span>{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <HiLockClosed className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${focused === "password" ? "text-purple-400" : "text-slate-600"}`} />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused("")}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pl-11 pr-12 py-3.5 rounded-xl text-sm text-white placeholder:text-slate-600 transition-all duration-200 outline-none"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: errors.password
                      ? "1px solid rgba(239,68,68,0.6)"
                      : focused === "password"
                      ? "1px solid rgba(167,139,250,0.6)"
                      : "1px solid rgba(255,255,255,0.08)",
                    boxShadow: focused === "password" ? "0 0 0 3px rgba(124,58,237,0.1)" : "none"
                  }}
                />
                <button type="button" onClick={() => setShowPassword(p => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-300 transition-colors">
                  {showPassword ? <HiEyeOff className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1"><span>⚠</span>{errors.password}</p>}
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <button type="button" onClick={() => setForm(p => ({ ...p, remember: !p.remember }))}
                  className="w-5 h-5 rounded-md flex items-center justify-center transition-all duration-200 shrink-0"
                  style={{
                    background: form.remember ? "linear-gradient(135deg, #7c3aed, #4f46e5)" : "rgba(255,255,255,0.05)",
                    border: form.remember ? "none" : "1px solid rgba(255,255,255,0.1)"
                  }}>
                  {form.remember && <span className="text-white text-xs font-bold">✓</span>}
                </button>
                <span className="text-sm text-slate-500 group-hover:text-slate-300 transition-colors">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-purple-400 hover:text-purple-300 font-medium transition-colors">
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full relative overflow-hidden group py-3.5 rounded-xl font-semibold text-white text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              style={{
                background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
                boxShadow: "0 0 30px rgba(124,58,237,0.35)"
              }}
            >
              {/* Shimmer */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <span className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Signing in...</>
                ) : (
                  <>Sign In <HiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                )}
              </span>
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
            <span className="text-xs text-slate-700">or</span>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
          </div>

          {/* Sign up */}
          <p className="text-center text-sm text-slate-600">
            Don't have an account?{" "}
            <Link to="/signup" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
              Create one free →
            </Link>
          </p>

          <p className="text-center text-xs text-slate-800 mt-5 flex items-center justify-center gap-1.5">
            🔒 Secured with Firebase Authentication
          </p>
        </div>
      </div>
    </div>
  );
}
