import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiMail, HiLockClosed, HiUser, HiEye, HiEyeOff, HiArrowRight } from "react-icons/hi";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { validateEmail } from "../utils/validators";
import AuthIllustration from "../components/auth/AuthIllustration";

function getPasswordStrength(password) {
  if (!password) return { score: 0, label: "", color: "" };
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return { score, label: "Weak", color: "#ef4444" };
  if (score <= 2) return { score, label: "Fair", color: "#f59e0b" };
  if (score <= 3) return { score, label: "Good", color: "#3b82f6" };
  return { score, label: "Strong", color: "#10b981" };
}

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState("");
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(1);

  const strength = getPasswordStrength(form.password);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  }

  function validateStep1() {
    const errs = {};
    if (!form.name.trim()) errs.name = "Full name is required";
    if (!form.email) errs.email = "Email is required";
    else if (!validateEmail(form.email)) errs.email = "Enter a valid email";
    return errs;
  }

  function validateStep2() {
    const errs = {};
    if (!form.password || form.password.length < 6) errs.password = "Minimum 6 characters";
    if (!form.confirm) errs.confirm = "Please confirm your password";
    else if (form.confirm !== form.password) errs.confirm = "Passwords do not match";
    return errs;
  }

  function handleNext(e) {
    e.preventDefault();
    const errs = validateStep1();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setStep(2);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validateStep2();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    try {
      await signup(form.name, form.email, form.password, "agent");
      toast.success("Account created! Welcome to EstateFlow.");
      navigate("/agent/dashboard");
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        toast.error("This email is already registered.");
        setStep(1);
      } else {
        toast.error("Signup failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  // Shared input style
  function inputStyle(field) {
    return {
      background: "rgba(255,255,255,0.04)",
      border: errors[field]
        ? "1px solid rgba(239,68,68,0.6)"
        : focused === field
        ? "1px solid rgba(167,139,250,0.6)"
        : "1px solid rgba(255,255,255,0.08)",
      boxShadow: focused === field ? "0 0 0 3px rgba(124,58,237,0.1)" : "none"
    };
  }

  const inputClass = "w-full pl-11 pr-4 py-3.5 rounded-xl text-sm text-white placeholder:text-slate-600 transition-all duration-200 outline-none";

  return (
    <div className="min-h-screen flex bg-[#0a0a0f]">

      {/* ── LEFT — Illustration ── */}
      <div className="hidden lg:block lg:w-[45%] relative">
        <AuthIllustration variant="signup" />
      </div>

      {/* ── RIGHT — Signup Form ── */}
      <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden">

        <div className="absolute top-0 left-0 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(79,70,229,0.07) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 right-0 w-60 h-60 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)" }} />

        <div className={`relative w-full max-w-[400px] transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}>
              <span className="text-white font-black">E</span>
            </div>
            <span className="text-white font-black text-xl">EstateFlow</span>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-7">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                  style={{
                    background: step >= s ? "linear-gradient(135deg, #7c3aed, #4f46e5)" : "rgba(255,255,255,0.05)",
                    border: step >= s ? "none" : "1px solid rgba(255,255,255,0.1)",
                    color: step >= s ? "white" : "#4b5563"
                  }}>
                  {step > s ? "✓" : s}
                </div>
                <span className="text-xs font-medium transition-colors"
                  style={{ color: step === s ? "white" : "#4b5563" }}>
                  {s === 1 ? "Your Info" : "Password"}
                </span>
                {s < 2 && (
                  <div className="w-8 h-px mx-1 transition-all duration-500"
                    style={{ background: step > 1 ? "linear-gradient(90deg, #7c3aed, #4f46e5)" : "rgba(255,255,255,0.08)" }} />
                )}
              </div>
            ))}
          </div>

          {/* Header */}
          <div className="mb-7">
            <p className="text-purple-400 text-sm font-semibold tracking-widest uppercase mb-2">
              {step === 1 ? "Step 1 of 2" : "Step 2 of 2"}
            </p>
            <h1 className="text-3xl font-black text-white leading-tight">
              {step === 1 ? "Create your\naccount" : "Set your\npassword"}
            </h1>
          </div>

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <form onSubmit={handleNext} noValidate className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                <div className="relative">
                  <HiUser className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focused === "name" ? "text-purple-400" : "text-slate-600"}`} />
                  <input name="name" type="text" value={form.name} onChange={handleChange}
                    onFocus={() => setFocused("name")} onBlur={() => setFocused("")}
                    placeholder="Himanshu Sharma" autoComplete="name"
                    className={inputClass} style={inputStyle("name")} />
                </div>
                {errors.name && <p className="text-red-400 text-xs mt-1.5">⚠ {errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                <div className="relative">
                  <HiMail className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focused === "email" ? "text-purple-400" : "text-slate-600"}`} />
                  <input name="email" type="email" value={form.email} onChange={handleChange}
                    onFocus={() => setFocused("email")} onBlur={() => setFocused("")}
                    placeholder="you@company.com" autoComplete="email"
                    className={inputClass} style={inputStyle("email")} />
                </div>
                {errors.email && <p className="text-red-400 text-xs mt-1.5">⚠ {errors.email}</p>}
              </div>

              <button type="submit"
                className="w-full relative overflow-hidden group py-3.5 rounded-xl font-semibold text-white text-sm transition-all duration-300 mt-2"
                style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)", boxShadow: "0 0 30px rgba(124,58,237,0.35)" }}>
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative flex items-center justify-center gap-2">
                  Continue <HiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </form>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
                <div className="relative">
                  <HiLockClosed className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focused === "password" ? "text-purple-400" : "text-slate-600"}`} />
                  <input name="password" type={showPassword ? "text" : "password"} value={form.password}
                    onChange={handleChange} onFocus={() => setFocused("password")} onBlur={() => setFocused("")}
                    placeholder="Min. 6 characters"
                    className={`${inputClass} pr-12`} style={inputStyle("password")} />
                  <button type="button" onClick={() => setShowPassword(p => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-300 transition-colors">
                    {showPassword ? <HiEyeOff className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Strength bar */}
                {form.password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(i => (
                        <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                          style={{ background: i <= strength.score ? strength.color : "rgba(255,255,255,0.08)" }} />
                      ))}
                    </div>
                    <p className="text-xs font-medium" style={{ color: strength.color }}>
                      {strength.label}
                    </p>
                  </div>
                )}
                {errors.password && <p className="text-red-400 text-xs mt-1.5">⚠ {errors.password}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Confirm Password</label>
                <div className="relative">
                  <HiLockClosed className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focused === "confirm" ? "text-purple-400" : "text-slate-600"}`} />
                  <input name="confirm" type={showConfirm ? "text" : "password"} value={form.confirm}
                    onChange={handleChange} onFocus={() => setFocused("confirm")} onBlur={() => setFocused("")}
                    placeholder="Repeat your password"
                    className={`${inputClass} pr-12`} style={inputStyle("confirm")} />
                  <button type="button" onClick={() => setShowConfirm(p => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-300 transition-colors">
                    {showConfirm ? <HiEyeOff className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
                  </button>
                </div>
                {form.confirm && (
                  <p className="text-xs mt-1.5 font-medium" style={{ color: form.confirm === form.password ? "#10b981" : "#ef4444" }}>
                    {form.confirm === form.password ? "✓ Passwords match" : "✗ Passwords don't match"}
                  </p>
                )}
                {errors.confirm && <p className="text-red-400 text-xs mt-1.5">⚠ {errors.confirm}</p>}
              </div>

              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setStep(1)}
                  className="px-5 py-3.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white transition-all duration-200"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  ← Back
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 relative overflow-hidden group py-3.5 rounded-xl font-semibold text-white text-sm transition-all duration-300 disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)", boxShadow: "0 0 30px rgba(124,58,237,0.35)" }}>
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <span className="relative flex items-center justify-center gap-2">
                    {loading ? (
                      <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Creating...</>
                    ) : (
                      <>Create Account <HiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                    )}
                  </span>
                </button>
              </div>
            </form>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
            <span className="text-xs text-slate-700">or</span>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
          </div>

          <p className="text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link to="/login" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
              Sign in →
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
