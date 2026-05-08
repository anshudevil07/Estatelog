import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { HiMail, HiLockClosed, HiEye, HiEyeOff, HiArrowRight } from "react-icons/hi";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { validateEmail } from "../utils/validators";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState({ email: "", password: "", remember: true });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: "" }));
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
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center">

      {/* ══════════════════════════════════════════
          FULL PAGE ANIMATED BACKGROUND
      ══════════════════════════════════════════ */}

      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]" />

      {/* Animated aurora blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="aurora-blob"
          style={{
            width: "70vw", height: "70vw",
            top: "-20%", left: "-15%",
            background: "radial-gradient(circle, rgba(120,40,200,0.5) 0%, transparent 65%)",
            animation: "auroraMove1 12s ease-in-out infinite",
          }}
        />
        <div className="aurora-blob"
          style={{
            width: "60vw", height: "60vw",
            bottom: "-20%", right: "-10%",
            background: "radial-gradient(circle, rgba(60,80,220,0.45) 0%, transparent 65%)",
            animation: "auroraMove2 15s ease-in-out infinite",
          }}
        />
        <div className="aurora-blob"
          style={{
            width: "50vw", height: "50vw",
            top: "30%", right: "20%",
            background: "radial-gradient(circle, rgba(200,50,150,0.3) 0%, transparent 65%)",
            animation: "auroraMove3 18s ease-in-out infinite",
          }}
        />
        <div className="aurora-blob"
          style={{
            width: "40vw", height: "40vw",
            bottom: "10%", left: "20%",
            background: "radial-gradient(circle, rgba(40,180,180,0.25) 0%, transparent 65%)",
            animation: "auroraMove1 20s ease-in-out infinite reverse",
          }}
        />
      </div>

      {/* Mesh grid overlay */}
      <div className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
        <div key={i} className="absolute rounded-full pointer-events-none"
          style={{
            width: Math.random() * 4 + 2 + "px",
            height: Math.random() * 4 + 2 + "px",
            top: Math.random() * 100 + "%",
            left: Math.random() * 100 + "%",
            background: ["#a78bfa", "#818cf8", "#ec4899", "#38bdf8"][Math.floor(Math.random() * 4)],
            opacity: Math.random() * 0.6 + 0.2,
            animation: `particleFloat ${Math.random() * 8 + 6}s ease-in-out infinite`,
            animationDelay: Math.random() * 5 + "s",
            boxShadow: `0 0 6px currentColor`,
          }}
        />
      ))}

      {/* Diagonal light beam */}
      <div className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          background: "linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.08) 50%, transparent 70%)",
          animation: "beamSweep 8s ease-in-out infinite",
        }}
      />

      {/* ══════════════════════════════════════════
          GLASS FORM CARD — centered on full page
      ══════════════════════════════════════════ */}
      <div
        className={`relative z-10 w-full max-w-md mx-4 transition-all duration-700 ${
          mounted ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"
        }`}
      >
        {/* Glass card */}
        <div className="rounded-3xl p-8 backdrop-blur-2xl"
          style={{
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.15)",
            boxShadow: "0 25px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
          }}
        >
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)", boxShadow: "0 0 20px rgba(124,58,237,0.5)" }}>
              <span className="text-white font-black text-lg">E</span>
            </div>
            <div>
              <p className="text-white font-black text-lg leading-none">EstateFlow</p>
              <p className="text-purple-300 text-xs opacity-70">Real Estate CRM</p>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-7">
            <h1 className="text-3xl font-black text-white mb-1">Welcome back 👋</h1>
            <p className="text-white/50 text-sm">Sign in to continue to your dashboard</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">Email</label>
              <div className="relative">
                <HiMail className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focused === "email" ? "text-violet-300" : "text-white/30"}`} />
                <input
                  name="email" type="email" value={form.email}
                  onChange={handleChange}
                  onFocus={() => setFocused("email")} onBlur={() => setFocused("")}
                  placeholder="you@estateflow.com" autoComplete="email"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm text-white placeholder:text-white/20 outline-none transition-all duration-200"
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    border: errors.email ? "1px solid rgba(239,68,68,0.7)" : focused === "email" ? "1px solid rgba(167,139,250,0.7)" : "1px solid rgba(255,255,255,0.1)",
                    boxShadow: focused === "email" ? "0 0 0 3px rgba(124,58,237,0.15), inset 0 1px 0 rgba(255,255,255,0.05)" : "inset 0 1px 0 rgba(255,255,255,0.05)",
                  }}
                />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1.5">⚠ {errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">Password</label>
              <div className="relative">
                <HiLockClosed className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focused === "password" ? "text-violet-300" : "text-white/30"}`} />
                <input
                  name="password" type={showPassword ? "text" : "password"} value={form.password}
                  onChange={handleChange}
                  onFocus={() => setFocused("password")} onBlur={() => setFocused("")}
                  placeholder="••••••••" autoComplete="current-password"
                  className="w-full pl-11 pr-12 py-3.5 rounded-xl text-sm text-white placeholder:text-white/20 outline-none transition-all duration-200"
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    border: errors.password ? "1px solid rgba(239,68,68,0.7)" : focused === "password" ? "1px solid rgba(167,139,250,0.7)" : "1px solid rgba(255,255,255,0.1)",
                    boxShadow: focused === "password" ? "0 0 0 3px rgba(124,58,237,0.15), inset 0 1px 0 rgba(255,255,255,0.05)" : "inset 0 1px 0 rgba(255,255,255,0.05)",
                  }}
                />
                <button type="button" onClick={() => setShowPassword(p => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors">
                  {showPassword ? <HiEyeOff className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1.5">⚠ {errors.password}</p>}
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <button type="button" onClick={() => setForm(p => ({ ...p, remember: !p.remember }))}
                  className="w-5 h-5 rounded-md flex items-center justify-center transition-all duration-200 shrink-0"
                  style={{
                    background: form.remember ? "linear-gradient(135deg, #7c3aed, #4f46e5)" : "rgba(255,255,255,0.08)",
                    border: form.remember ? "none" : "1px solid rgba(255,255,255,0.15)",
                  }}>
                  {form.remember && <span className="text-white text-xs font-bold">✓</span>}
                </button>
                <span className="text-sm text-white/40 group-hover:text-white/70 transition-colors">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-violet-300 hover:text-violet-200 font-medium transition-colors">
                Forgot password?
              </Link>
            </div>

            {/* Submit button */}
            <button type="submit" disabled={loading}
              className="w-full relative overflow-hidden group py-3.5 rounded-xl font-bold text-white text-sm transition-all duration-300 disabled:opacity-50 mt-2"
              style={{
                background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #6d28d9 100%)",
                boxShadow: "0 0 40px rgba(124,58,237,0.5), 0 4px 15px rgba(0,0,0,0.3)",
              }}>
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
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
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-white/20">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <p className="text-center text-sm text-white/30">
            Don't have an account?{" "}
            <Link to="/signup" className="text-violet-300 hover:text-violet-200 font-semibold transition-colors">
              Create one free →
            </Link>
          </p>
        </div>

        {/* Below card */}
        <p className="text-center text-xs text-white/20 mt-5 flex items-center justify-center gap-1.5">
          🔒 Secured with Firebase Authentication
        </p>
      </div>

      {/* ── All animations ── */}
      <style>{`
        .aurora-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
        }
        @keyframes auroraMove1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(5vw, -5vh) scale(1.1); }
          66% { transform: translate(-3vw, 4vh) scale(0.95); }
        }
        @keyframes auroraMove2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-6vw, 4vh) scale(1.05); }
          66% { transform: translate(4vw, -6vh) scale(1.1); }
        }
        @keyframes auroraMove3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-4vw, -4vh) scale(1.15); }
        }
        @keyframes particleFloat {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.3; }
          25% { transform: translateY(-20px) translateX(10px); opacity: 0.8; }
          75% { transform: translateY(10px) translateX(-8px); opacity: 0.5; }
        }
        @keyframes beamSweep {
          0%, 100% { opacity: 0; transform: translateX(-100%); }
          50% { opacity: 1; transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
