import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiMail, HiLockClosed, HiUser, HiEye, HiEyeOff, HiArrowRight } from "react-icons/hi";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { validateEmail } from "../utils/validators";

// Different set of images for signup — interior/luxury feel
const BG_IMAGES = [
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1920&q=85",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1920&q=85",
  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1920&q=85",
];

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
  const [bgIndex, setBgIndex] = useState(0);

  const strength = getPasswordStrength(form.password);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    const interval = setInterval(() => setBgIndex(i => (i + 1) % BG_IMAGES.length), 6000);
    return () => { clearTimeout(t); clearInterval(interval); };
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: "" }));
  }

  function handleNext(e) {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = "Full name is required";
    if (!form.email) errs.email = "Email is required";
    else if (!validateEmail(form.email)) errs.email = "Enter a valid email";
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setStep(2);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = {};
    if (!form.password || form.password.length < 6) errs.password = "Minimum 6 characters";
    if (!form.confirm) errs.confirm = "Please confirm your password";
    else if (form.confirm !== form.password) errs.confirm = "Passwords do not match";
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

  const inputStyle = (field) => ({
    background: "rgba(255,255,255,0.06)",
    border: errors[field] ? "1px solid rgba(239,68,68,0.7)" : focused === field ? "1px solid rgba(52,211,153,0.6)" : "1px solid rgba(255,255,255,0.1)",
    boxShadow: focused === field ? "0 0 0 3px rgba(16,185,129,0.12)" : "none",
  });

  const inputClass = "w-full pl-11 pr-4 py-3.5 rounded-xl text-sm text-white placeholder:text-white/20 outline-none transition-all duration-200";

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center py-8">

      {/* ── Background images with crossfade ── */}
      {BG_IMAGES.map((src, i) => (
        <div key={src} className="absolute inset-0 transition-opacity duration-2000"
          style={{ opacity: i === bgIndex ? 1 : 0, transitionDuration: "2000ms" }}>
          <img src={src} alt="" className="w-full h-full object-cover" />
        </div>
      ))}

      {/* ── Design overlays ── */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-emerald-950/50 to-black/80" />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(5,150,105,0.15) 0%, transparent 70%)" }} />
      <div className="absolute inset-0 pointer-events-none opacity-[0.05]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "70px 70px",
        }}
      />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 50%, rgba(0,0,0,0.55) 100%)" }} />

      {/* Particles */}
      {[...Array(14)].map((_, i) => (
        <div key={i} className="absolute rounded-full pointer-events-none"
          style={{
            width: Math.random() * 3 + 2 + "px",
            height: Math.random() * 3 + 2 + "px",
            top: Math.random() * 100 + "%",
            left: Math.random() * 100 + "%",
            background: ["#6ee7b7", "#93c5fd", "#a78bfa", "#fde68a"][i % 4],
            opacity: Math.random() * 0.5 + 0.2,
            animation: `particleFloat ${Math.random() * 8 + 5}s ease-in-out infinite`,
            animationDelay: Math.random() * 4 + "s",
          }}
        />
      ))}

      {/* Bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 px-8 py-5 flex items-center justify-between pointer-events-none"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)" }}>
        <p className="text-white/40 text-xs">Agent accounts only · Admin creates Manager/Admin accounts</p>
        <div className="flex gap-1.5">
          {BG_IMAGES.map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full transition-all duration-500"
              style={{ background: i === bgIndex ? "white" : "rgba(255,255,255,0.3)" }} />
          ))}
        </div>
      </div>

      {/* ── Glass card ── */}
      <div className={`relative z-10 w-full max-w-[420px] mx-4 transition-all duration-700 ${
        mounted ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"
      }`}>
        <div className="rounded-3xl p-8"
          style={{
            background: "rgba(10,10,20,0.65)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05) inset, 0 1px 0 rgba(255,255,255,0.1) inset",
          }}>

          {/* Logo */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #059669, #0891b2)", boxShadow: "0 0 24px rgba(5,150,105,0.5)" }}>
              <span className="text-white font-black text-lg">E</span>
            </div>
            <div>
              <p className="text-white font-black text-lg leading-none tracking-tight">EstateFlow</p>
              <p className="text-emerald-300/70 text-xs">Real Estate CRM</p>
            </div>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                  style={{
                    background: step >= s ? "linear-gradient(135deg, #059669, #0891b2)" : "rgba(255,255,255,0.07)",
                    border: step >= s ? "none" : "1px solid rgba(255,255,255,0.12)",
                    color: step >= s ? "white" : "rgba(255,255,255,0.3)",
                    boxShadow: step >= s ? "0 0 12px rgba(5,150,105,0.4)" : "none",
                  }}>
                  {step > s ? "✓" : s}
                </div>
                <span className="text-xs font-medium" style={{ color: step === s ? "white" : "rgba(255,255,255,0.3)" }}>
                  {s === 1 ? "Your Info" : "Password"}
                </span>
                {s < 2 && (
                  <div className="w-8 h-px mx-1 transition-all duration-500"
                    style={{ background: step > 1 ? "linear-gradient(90deg, #059669, #0891b2)" : "rgba(255,255,255,0.1)" }} />
                )}
              </div>
            ))}
          </div>

          {/* Heading */}
          <div className="mb-6">
            <h1 className="text-3xl font-black text-white mb-1.5 leading-tight">
              {step === 1 ? "Create account ✨" : "Set password 🔐"}
            </h1>
            <p className="text-white/40 text-sm">
              {step === 1 ? "Step 1 of 2 — Enter your details" : "Step 2 of 2 — Choose a strong password"}
            </p>
          </div>

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <form onSubmit={handleNext} noValidate className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-white/40 uppercase tracking-[0.15em] mb-2">Full Name</label>
                <div className="relative">
                  <HiUser className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focused === "name" ? "text-emerald-400" : "text-white/25"}`} />
                  <input name="name" type="text" value={form.name} onChange={handleChange}
                    onFocus={() => setFocused("name")} onBlur={() => setFocused("")}
                    placeholder="Himanshu Sharma" autoComplete="name"
                    className={inputClass} style={inputStyle("name")} />
                </div>
                {errors.name && <p className="text-red-400 text-xs mt-1.5">⚠ {errors.name}</p>}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-white/40 uppercase tracking-[0.15em] mb-2">Email Address</label>
                <div className="relative">
                  <HiMail className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focused === "email" ? "text-emerald-400" : "text-white/25"}`} />
                  <input name="email" type="email" value={form.email} onChange={handleChange}
                    onFocus={() => setFocused("email")} onBlur={() => setFocused("")}
                    placeholder="you@company.com" autoComplete="email"
                    className={inputClass} style={inputStyle("email")} />
                </div>
                {errors.email && <p className="text-red-400 text-xs mt-1.5">⚠ {errors.email}</p>}
              </div>

              <button type="submit"
                className="w-full relative overflow-hidden group py-3.5 rounded-xl font-bold text-white text-sm transition-all duration-300 mt-2"
                style={{ background: "linear-gradient(135deg, #059669, #0891b2)", boxShadow: "0 0 40px rgba(5,150,105,0.4), 0 4px 20px rgba(0,0,0,0.3)" }}>
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
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
                <label className="block text-[11px] font-bold text-white/40 uppercase tracking-[0.15em] mb-2">Password</label>
                <div className="relative">
                  <HiLockClosed className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focused === "password" ? "text-emerald-400" : "text-white/25"}`} />
                  <input name="password" type={showPassword ? "text" : "password"} value={form.password}
                    onChange={handleChange} onFocus={() => setFocused("password")} onBlur={() => setFocused("")}
                    placeholder="Min. 6 characters"
                    className={`${inputClass} pr-12`} style={inputStyle("password")} />
                  <button type="button" onClick={() => setShowPassword(p => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors">
                    {showPassword ? <HiEyeOff className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
                  </button>
                </div>
                {form.password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(i => (
                        <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                          style={{ background: i <= strength.score ? strength.color : "rgba(255,255,255,0.08)" }} />
                      ))}
                    </div>
                    <p className="text-xs font-semibold" style={{ color: strength.color }}>{strength.label}</p>
                  </div>
                )}
                {errors.password && <p className="text-red-400 text-xs mt-1.5">⚠ {errors.password}</p>}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-white/40 uppercase tracking-[0.15em] mb-2">Confirm Password</label>
                <div className="relative">
                  <HiLockClosed className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focused === "confirm" ? "text-emerald-400" : "text-white/25"}`} />
                  <input name="confirm" type={showConfirm ? "text" : "password"} value={form.confirm}
                    onChange={handleChange} onFocus={() => setFocused("confirm")} onBlur={() => setFocused("")}
                    placeholder="Repeat your password"
                    className={`${inputClass} pr-12`} style={inputStyle("confirm")} />
                  <button type="button" onClick={() => setShowConfirm(p => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors">
                    {showConfirm ? <HiEyeOff className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
                  </button>
                </div>
                {form.confirm && (
                  <p className="text-xs mt-1.5 font-semibold" style={{ color: form.confirm === form.password ? "#10b981" : "#ef4444" }}>
                    {form.confirm === form.password ? "✓ Passwords match" : "✗ Passwords don't match"}
                  </p>
                )}
                {errors.confirm && <p className="text-red-400 text-xs mt-1.5">⚠ {errors.confirm}</p>}
              </div>

              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setStep(1)}
                  className="px-5 py-3.5 rounded-xl text-sm font-medium text-white/40 hover:text-white/70 transition-all duration-200"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  ← Back
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 relative overflow-hidden group py-3.5 rounded-xl font-bold text-white text-sm transition-all duration-300 disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #059669, #0891b2)", boxShadow: "0 0 40px rgba(5,150,105,0.4), 0 4px 20px rgba(0,0,0,0.3)" }}>
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
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
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-white/20">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <p className="text-center text-sm text-white/30">
            Already have an account?{" "}
            <Link to="/login" className="text-emerald-300 hover:text-emerald-200 font-semibold transition-colors">
              Sign in →
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-white/20 mt-4 flex items-center justify-center gap-1.5">
          🔒 Secured with Firebase Authentication
        </p>
      </div>

      <style>{`
        @keyframes particleFloat {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.3; }
          25% { transform: translateY(-18px) translateX(8px); opacity: 0.7; }
          75% { transform: translateY(8px) translateX(-6px); opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
