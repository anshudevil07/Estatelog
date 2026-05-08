// Premium abstract illustration for auth pages
// Inspired by modern SaaS products like Linear, Vercel, Stripe

export default function AuthIllustration({ variant = "login" }) {
  return (
    <div className="relative w-full h-full min-h-screen overflow-hidden bg-[#0a0a0f]">

      {/* ── Deep space gradient base ── */}
      <div className="absolute inset-0"
        style={{
          background: variant === "login"
            ? "radial-gradient(ellipse 80% 60% at 50% 0%, #3b0764 0%, #0a0a0f 70%)"
            : "radial-gradient(ellipse 80% 60% at 50% 0%, #1e1b4b 0%, #0a0a0f 70%)"
        }}
      />

      {/* ── Large glowing orbs ── */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-30"
        style={{
          background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)",
          animation: "orbFloat 8s ease-in-out infinite",
          filter: "blur(40px)"
        }}
      />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full opacity-25"
        style={{
          background: "radial-gradient(circle, #4f46e5 0%, transparent 70%)",
          animation: "orbFloat 10s ease-in-out infinite reverse",
          filter: "blur(50px)"
        }}
      />
      <div className="absolute top-[40%] right-[10%] w-[300px] h-[300px] rounded-full opacity-20"
        style={{
          background: "radial-gradient(circle, #ec4899 0%, transparent 70%)",
          animation: "orbFloat 12s ease-in-out infinite",
          animationDelay: "2s",
          filter: "blur(60px)"
        }}
      />

      {/* ── Noise texture overlay ── */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px"
        }}
      />

      {/* ── Grid lines ── */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px"
        }}
      />

      {/* ── Floating geometric shapes ── */}
      {/* Large ring */}
      <div className="absolute top-[15%] left-[10%]"
        style={{ animation: "spinSlow 20s linear infinite" }}>
        <svg width="180" height="180" viewBox="0 0 180 180" fill="none">
          <circle cx="90" cy="90" r="80" stroke="url(#ring1)" strokeWidth="1.5" strokeDasharray="8 6" />
          <circle cx="90" cy="90" r="60" stroke="url(#ring2)" strokeWidth="0.8" opacity="0.5" />
          <defs>
            <linearGradient id="ring1" x1="0" y1="0" x2="180" y2="180">
              <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="ring2" x1="0" y1="0" x2="180" y2="180">
              <stop offset="0%" stopColor="#818cf8" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.1" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Small ring bottom right */}
      <div className="absolute bottom-[20%] right-[8%]"
        style={{ animation: "spinSlow 15s linear infinite reverse" }}>
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
          <circle cx="60" cy="60" r="55" stroke="url(#ring3)" strokeWidth="1" strokeDasharray="4 4" />
          <defs>
            <linearGradient id="ring3" x1="0" y1="0" x2="120" y2="120">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0.2" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Floating triangle */}
      <div className="absolute top-[55%] left-[5%]"
        style={{ animation: "floatY 7s ease-in-out infinite", animationDelay: "1s" }}>
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
          <polygon points="30,5 55,50 5,50" stroke="#a78bfa" strokeWidth="1.5" fill="none" opacity="0.5" />
        </svg>
      </div>

      {/* Floating diamond */}
      <div className="absolute top-[30%] right-[12%]"
        style={{ animation: "floatY 9s ease-in-out infinite", animationDelay: "3s" }}>
        <svg width="50" height="50" viewBox="0 0 50 50" fill="none">
          <rect x="10" y="10" width="30" height="30" stroke="#818cf8" strokeWidth="1.5" fill="none" opacity="0.6" transform="rotate(45 25 25)" />
        </svg>
      </div>

      {/* Floating plus */}
      <div className="absolute top-[70%] right-[20%]"
        style={{ animation: "floatY 6s ease-in-out infinite", animationDelay: "0.5s" }}>
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
          <line x1="15" y1="2" x2="15" y2="28" stroke="#c4b5fd" strokeWidth="2" opacity="0.5" />
          <line x1="2" y1="15" x2="28" y2="15" stroke="#c4b5fd" strokeWidth="2" opacity="0.5" />
        </svg>
      </div>

      {/* ── Glowing dots scattered ── */}
      {[
        { top: "20%", left: "30%", size: 6, color: "#a78bfa", delay: "0s" },
        { top: "45%", left: "70%", size: 4, color: "#818cf8", delay: "1s" },
        { top: "65%", left: "25%", size: 5, color: "#ec4899", delay: "2s" },
        { top: "80%", left: "55%", size: 3, color: "#a78bfa", delay: "0.5s" },
        { top: "15%", left: "60%", size: 4, color: "#6366f1", delay: "1.5s" },
        { top: "35%", left: "45%", size: 3, color: "#c4b5fd", delay: "2.5s" },
        { top: "90%", left: "15%", size: 5, color: "#818cf8", delay: "3s" },
        { top: "10%", left: "80%", size: 4, color: "#ec4899", delay: "0.8s" },
      ].map((dot, i) => (
        <div key={i} className="absolute rounded-full"
          style={{
            top: dot.top, left: dot.left,
            width: dot.size, height: dot.size,
            backgroundColor: dot.color,
            boxShadow: `0 0 ${dot.size * 3}px ${dot.color}`,
            animation: `pulse ${2 + i * 0.3}s ease-in-out infinite`,
            animationDelay: dot.delay,
          }}
        />
      ))}

      {/* ── Central hero element ── */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative flex items-center justify-center"
          style={{ animation: "floatY 6s ease-in-out infinite" }}>

          {/* Outer glow ring */}
          <div className="absolute w-64 h-64 rounded-full opacity-20"
            style={{
              background: "radial-gradient(circle, #7c3aed, transparent 70%)",
              animation: "pulse 3s ease-in-out infinite"
            }}
          />

          {/* Rotating dashed ring */}
          <div className="absolute w-52 h-52"
            style={{ animation: "spinSlow 12s linear infinite" }}>
            <svg width="208" height="208" viewBox="0 0 208 208" fill="none">
              <circle cx="104" cy="104" r="100" stroke="url(#heroRing)" strokeWidth="1" strokeDasharray="6 4" />
              <defs>
                <linearGradient id="heroRing" x1="0" y1="0" x2="208" y2="208">
                  <stop offset="0%" stopColor="#a78bfa" />
                  <stop offset="50%" stopColor="#ec4899" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Inner glass card */}
          <div className="relative w-36 h-36 rounded-3xl flex flex-col items-center justify-center gap-2"
            style={{
              background: "linear-gradient(135deg, rgba(124,58,237,0.3) 0%, rgba(79,70,229,0.2) 100%)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(167,139,250,0.3)",
              boxShadow: "0 0 60px rgba(124,58,237,0.3), inset 0 1px 0 rgba(255,255,255,0.1)"
            }}>
            <span className="text-4xl">🏢</span>
            <span className="text-white font-black text-sm tracking-tight">EstateFlow</span>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-emerald-400 text-xs font-medium">Live</span>
            </div>
          </div>

          {/* Orbiting mini cards */}
          <OrbitCard angle={0} radius={140} icon="🏠" label="Property" delay="0s" />
          <OrbitCard angle={120} radius={140} icon="👤" label="Lead" delay="0s" />
          <OrbitCard angle={240} radius={140} icon="💰" label="Deal" delay="0s" />
        </div>
      </div>

      {/* ── Bottom gradient fade ── */}
      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: "linear-gradient(to top, #0a0a0f, transparent)" }}
      />

      {/* ── Top gradient fade ── */}
      <div className="absolute top-0 left-0 right-0 h-20 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, #0a0a0f 0%, transparent 100%)" }}
      />

      {/* ── Branding ── */}
      <div className="absolute top-8 left-8 z-20 flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
            boxShadow: "0 0 20px rgba(124,58,237,0.5)"
          }}>
          <span className="text-white font-black text-lg">E</span>
        </div>
        <div>
          <p className="text-white font-black text-base leading-none">EstateFlow</p>
          <p className="text-purple-400 text-xs">Real Estate CRM</p>
        </div>
      </div>

      {/* ── Bottom tagline ── */}
      <div className="absolute bottom-8 left-0 right-0 text-center z-20">
        <p className="text-white/30 text-xs tracking-[0.2em] uppercase font-medium">
          Trusted by 500+ agents across India
        </p>
      </div>

      {/* ── Animations ── */}
      <style>{`
        @keyframes orbFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.05); }
          66% { transform: translate(-20px, 15px) scale(0.95); }
        }
        @keyframes floatY {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-16px); }
        }
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}

// ── Orbiting card around center ───────────────────────────────────────────────
function OrbitCard({ angle, radius, icon, label, delay }) {
  const rad = (angle * Math.PI) / 180;
  const x = Math.cos(rad) * radius;
  const y = Math.sin(rad) * radius;

  return (
    <div
      className="absolute flex flex-col items-center gap-1 pointer-events-none"
      style={{
        transform: `translate(${x}px, ${y}px)`,
        animation: `floatY ${4 + angle / 60}s ease-in-out infinite`,
        animationDelay: `${angle / 120}s`,
      }}
    >
      <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg"
        style={{
          background: "linear-gradient(135deg, rgba(124,58,237,0.4), rgba(79,70,229,0.3))",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(167,139,250,0.3)",
          boxShadow: "0 4px 20px rgba(124,58,237,0.2)"
        }}>
        {icon}
      </div>
      <span className="text-white/60 text-[10px] font-medium">{label}</span>
    </div>
  );
}
