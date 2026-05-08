import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { HiMail, HiLockClosed, HiEye, HiEyeOff, HiArrowRight } from "react-icons/hi";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { validateEmail } from "../utils/validators";

// Real estate background images — rotates every few seconds
const BG_IMAGES = [
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=85",
  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1920&q=85",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1920&q=85",
];

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
  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    // Rotate background image every 6 seconds
    const interval = setInterval(() => {
      setBgIndex(i => (i + 1) % BG_IMAGES.length);
    }, 6000);
    return () => { clearTimeout(t); clearInterval(interval); };
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

      {/* ── Background image with crossfade ── */}
      {BG_IMAGES.map((src, i) => (
        <div key={src} className="absolute inset-0 transition-opacity duration-2000"
          style={{ opacity: i === bgIndex ? 1 : 0, transitionDuration: "2000ms" }}>
          <img src={src} alt="" className="w-full h-full object-cover" />
        </div>
      ))}

      {/* ── Design overlays on top of image ── */}

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/75 via-violet-950/60 to-black/80" />

      {/* Radial glow in center */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(109,40,217,0.2) 0%, transparent 70%)" }} />

      {/* Grid pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "70px 70px",
        }}
      />

      {/* Vignette edges */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 50%, rgba(0,0,0,0.6) 100%)" }} />

      {/* Floating particles */}
      {[...Array(16)].map((_, i) => (
        <div key={i} className="absolute rounded-full pointer-events-none"
          style={{
            width: Math.random() * 3 + 2 + "px",
            height: Math.random() * 3 + 2 + "px",
            top: Math.random() * 100 + "%",
            left: Math.random() * 100 + "%",
            background: ["#a78bfa", "#c4b5fd", "#f0abfc", "#93c5fd"][i % 4],
            opacity: Math.random() * 0.5 + 0.2,
            animation: `particleFloat ${Math.random() * 8 + 5}s ease-in-out infinite`,
            animationDelay: Math.random() * 4 + "s",
          }}
        />
      ))}

      {/* ── Bottom info bar ── */}
      <div className="absolute bottom-0 left-0 right-0 px-8 py-5 flex items-center justify-between pointer-events-none"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)" }}>
        <div className="flex items-center gap-6">
          {["2,400+ Properties", "₹210Cr+ Closed", "500+ Agents"].map((s) => (
            <div key={s} className="text-white/60 text-xs font-medium">{s}</div>
          ))}
        </div>
        <div className="flex gap-1.5">
          {BG_IMAGES.map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full transition-all duration-500"
              style={{ background: i === bgIndex ? "white" : "rgba(255,255,255,0.3)" }} />
          ))}
        </div>
      </div>

      {/* ── Glass form card ── */}
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
          <div className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)", boxShadow: "0 0 24px rgba(124,58,237,0.6)" }}>
              <span className="text-white font-black text-lg">E</span>
            </div>
            <div>
              <p className="text-white font-black text-lg leading-none tracking-tight">EstateFlow</p>
              <p className="text-violet-300/70 text-xs">Real Estate CRM</p>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-7">
            <h1 className="text-3xl font-black text-white mb-1.5 leading-tight">Welcome back 👋</h1>
            <p className="text-white/40 text-sm">Sign in to continue to your dashboard</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-[11px] font-bold text-white/40 uppercase tracking-[0.15em] mb-2">Email</label>
              <div className="relative">
                <HiMail className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${focused === "email" ? "text-violet-400" : "text-white/25"}`} />
                <input name="email" type="email" value={form.email} onChange={handleChange}
                  onFocus={() => setFocused("email")} onBlur={() => setFocused("")}
                  placeholder="you@estateflow.com" autoComplete="email"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm text-white placeholder:text-white/20 outline-none transition-all duration-200"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: errors.email ? "1px solid rgba(239,68,68,0.7)" : focused === "email" ? "1px solid rgba(167,139,250,0.6)" : "1px solid rgba(255,255,255,0.1)",
                    boxShadow: focused === "email" ? "0 0 0 3px rgba(124,58,237,0.15)" : "none",
                  }}
                />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1.5">⚠ {errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] font-bold text-white/40 uppercase tracking-[0.15em] mb-2">Password</label>
              <div className="relative">
                <HiLockClosed className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${focused === "password" ? "text-violet-400" : "text-white/25"}`} />
                <input name="password" type={showPassword ? "text" : "password"} value={form.password}
                  onChange={handleChange}
                  onFocus={() => setFocused("password")} onBlur={() => setFocused("")}
                  placeholder="••••••••" autoComplete="current-password"
                  className="w-full pl-11 pr-12 py-3.5 rounded-xl text-sm text-white placeholder:text-white/20 outline-none transition-all duration-200"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: errors.password ? "1px solid rgba(239,68,68,0.7)" : focused === "password" ? "1px solid rgba(167,139,250,0.6)" : "1px solid rgba(255,255,255,0.1)",
                    boxShadow: focused === "password" ? "0 0 0 3px rgba(124,58,237,0.15)" : "none",
                  }}
                />
                <button type="button" onClick={() => setShowPassword(p => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors">
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
                    background: form.remember ? "linear-gradient(135deg, #7c3aed, #4f46e5)" : "rgba(255,255,255,0.07)",
                    border: form.remember ? "none" : "1px solid rgba(255,255,255,0.15)",
                  }}>
                  {form.remember && <span className="text-white text-xs font-bold">✓</span>}
                </button>
                <span className="text-sm text-white/35 group-hover:text-white/60 transition-colors">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-violet-300 hover:text-violet-200 font-medium transition-colors">
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full relative overflow-hidden group py-3.5 rounded-xl font-bold text-white text-sm transition-all duration-300 disabled:opacity-50 mt-2"
              style={{
                background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
                boxShadow: "0 0 40px rgba(124,58,237,0.45), 0 4px 20px rgba(0,0,0,0.3)",
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
            Forgot your password?{" "}
            <Link to="/forgot-password" className="text-violet-300 hover:text-violet-200 font-semibold transition-colors">
              Reset it here →
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-white/20 mt-4 flex items-center justify-center gap-1.5">
          🔒 Secured with Firebase Authentication · Accounts created by Admin
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
