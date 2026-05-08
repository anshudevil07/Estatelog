import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiMail, HiLockClosed, HiUser, HiEye, HiEyeOff, HiArrowRight, HiCheckCircle } from "react-icons/hi";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { validateEmail } from "../utils/validators";
import AuthIllustration from "../components/auth/AuthIllustration";

// Password strength checker
function getPasswordStrength(password) {
  if (!password) return { score: 0, label: "", color: "" };
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: "Weak", color: "bg-red-500" };
  if (score <= 2) return { score, label: "Fair", color: "bg-amber-500" };
  if (score <= 3) return { score, label: "Good", color: "bg-blue-500" };
  return { score, label: "Strong", color: "bg-emerald-500" };
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
  const [step, setStep] = useState(1); // 2-step form

  const strength = getPasswordStrength(form.password);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
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
    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 6) errs.password = "Minimum 6 characters";
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

  // Shared input class builder
  function inputClass(field) {
    return `w-full pl-11 pr-4 py-3.5 rounded-xl text-sm bg-slate-900 border text-white placeholder:text-slate-600 focus:outline-none transition-all duration-200 ${
      errors[field]
        ? "border-red-500 focus:border-red-400 focus:ring-2 focus:ring-red-500/20"
        : focused === field
        ? "border-violet-500 ring-2 ring-violet-500/20"
        : "border-slate-800 hover:border-slate-700"
    }`;
  }

  return (
    <div className="min-h-screen flex bg-slate-950 overflow-hidden">

      {/* ── LEFT PANEL — Animated Illustration ── */}
      <div className="hidden lg:block lg:w-[45%] relative">
        <AuthIllustration />
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-950 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-violet-900/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-900/15 rounded-full blur-3xl pointer-events-none" />

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

          {/* Step indicator */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                step >= 1 ? "bg-violet-600 text-white" : "bg-slate-800 text-slate-500"
              }`}>
                {step > 1 ? "✓" : "1"}
              </div>
              <span className={`text-sm font-medium transition-colors ${step === 1 ? "text-white" : "text-slate-500"}`}>
                Your Info
              </span>
            </div>
            <div className={`flex-1 h-px transition-all duration-500 ${step > 1 ? "bg-violet-600" : "bg-slate-800"}`} />
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                step >= 2 ? "bg-violet-600 text-white" : "bg-slate-800 text-slate-500"
              }`}>
                2
              </div>
              <span className={`text-sm font-medium transition-colors ${step === 2 ? "text-white" : "text-slate-500"}`}>
                Password
              </span>
            </div>
          </div>

          {/* Header */}
          <div className="mb-7">
            <h2 className="text-3xl font-black text-white mb-1">
              {step === 1 ? "Create account" : "Set your password"}
            </h2>
            <p className="text-slate-400 text-sm">
              {step === 1 ? "Step 1 of 2 — Enter your basic details" : "Step 2 of 2 — Choose a strong password"}
            </p>
          </div>

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <form onSubmit={handleNext} noValidate className="space-y-5">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Full Name</label>
                <div className={`relative transition-all duration-200 ${focused === "name" ? "scale-[1.01]" : ""}`}>
                  <HiUser className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focused === "name" ? "text-violet-400" : "text-slate-500"}`} />
                  <input
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    onFocus={() => setFocused("name")}
                    onBlur={() => setFocused("")}
                    placeholder="Himanshu Sharma"
                    autoComplete="name"
                    className={inputClass("name")}
                  />
                </div>
                {errors.name && <p className="text-xs text-red-400">⚠ {errors.name}</p>}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Email Address</label>
                <div className={`relative transition-all duration-200 ${focused === "email" ? "scale-[1.01]" : ""}`}>
                  <HiMail className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focused === "email" ? "text-violet-400" : "text-slate-500"}`} />
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    onFocus={() => setFocused("email")}
                    onBlur={() => setFocused("")}
                    placeholder="you@company.com"
                    autoComplete="email"
                    className={inputClass("email")}
                  />
                </div>
                {errors.email && <p className="text-xs text-red-400">⚠ {errors.email}</p>}
              </div>

              <button
                type="submit"
                className="w-full relative overflow-hidden group bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-violet-900/40 hover:scale-[1.01] active:scale-[0.99]"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative flex items-center justify-center gap-2">
                  Continue
                  <HiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </form>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* Password */}
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
                    placeholder="Min. 6 characters"
                    className={`${inputClass("password")} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <HiEyeOff className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password strength bar */}
                {form.password && (
                  <div className="space-y-1.5">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            i <= strength.score ? strength.color : "bg-slate-800"
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-xs font-medium ${
                      strength.label === "Weak" ? "text-red-400" :
                      strength.label === "Fair" ? "text-amber-400" :
                      strength.label === "Good" ? "text-blue-400" :
                      "text-emerald-400"
                    }`}>
                      Password strength: {strength.label}
                    </p>
                  </div>
                )}
                {errors.password && <p className="text-xs text-red-400">⚠ {errors.password}</p>}
              </div>

              {/* Confirm password */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Confirm Password</label>
                <div className={`relative transition-all duration-200 ${focused === "confirm" ? "scale-[1.01]" : ""}`}>
                  <HiLockClosed className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focused === "confirm" ? "text-violet-400" : "text-slate-500"}`} />
                  <input
                    name="confirm"
                    type={showConfirm ? "text" : "password"}
                    value={form.confirm}
                    onChange={handleChange}
                    onFocus={() => setFocused("confirm")}
                    onBlur={() => setFocused("")}
                    placeholder="Repeat your password"
                    className={`${inputClass("confirm")} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((p) => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showConfirm ? <HiEyeOff className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Match indicator */}
                {form.confirm && form.password && (
                  <p className={`text-xs font-medium flex items-center gap-1 ${
                    form.confirm === form.password ? "text-emerald-400" : "text-red-400"
                  }`}>
                    {form.confirm === form.password ? "✓ Passwords match" : "✗ Passwords don't match"}
                  </p>
                )}
                {errors.confirm && <p className="text-xs text-red-400">⚠ {errors.confirm}</p>}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-3.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 text-sm font-medium transition-all duration-200"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 relative overflow-hidden group bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold py-3.5 rounded-xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-violet-900/40 hover:scale-[1.01] active:scale-[0.99]"
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <span className="relative flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Creating account...
                      </>
                    ) : (
                      <>
                        Create Account
                        <HiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </span>
                </button>
              </div>
            </form>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-xs text-slate-600">or</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          <p className="text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link to="/login" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">
              Sign in →
            </Link>
          </p>

          <p className="text-center text-xs text-slate-700 mt-5 flex items-center justify-center gap-1.5">
            <span>🔒</span>
            Secured with Firebase Authentication
          </p>
        </div>
      </div>

    </div>
  );
}
