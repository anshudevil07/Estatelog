// Animated real estate illustration for auth pages
// Pure CSS + SVG — no external image dependencies

export default function AuthIllustration() {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden select-none">

      {/* ── Sky gradient background ── */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-violet-950 to-slate-950" />

      {/* ── Stars ── */}
      <div className="absolute inset-0">
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 2 + 1 + "px",
              height: Math.random() * 2 + 1 + "px",
              top: Math.random() * 60 + "%",
              left: Math.random() * 100 + "%",
              opacity: Math.random() * 0.7 + 0.2,
              animation: `twinkle ${Math.random() * 3 + 2}s ease-in-out infinite`,
              animationDelay: Math.random() * 3 + "s",
            }}
          />
        ))}
      </div>

      {/* ── Moon ── */}
      <div className="absolute top-12 right-16 w-16 h-16 rounded-full bg-gradient-to-br from-yellow-100 to-amber-200 shadow-[0_0_40px_rgba(251,191,36,0.4)]"
        style={{ animation: "float 6s ease-in-out infinite" }}
      />
      <div className="absolute top-10 right-12 w-14 h-14 rounded-full bg-indigo-950 opacity-80" />

      {/* ── Clouds ── */}
      <Cloud top="15%" delay="0s" duration="18s" opacity={0.12} size={1} />
      <Cloud top="25%" delay="6s" duration="24s" opacity={0.08} size={0.7} />
      <Cloud top="10%" delay="12s" duration="30s" opacity={0.06} size={1.3} />

      {/* ── City skyline ── */}
      <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center gap-1 px-4">

        {/* Far background buildings — dark, small */}
        <Building height={80} width={18} color="#1e1b4b" windows={2} cols={1} delay="0s" glow={false} />
        <Building height={110} width={22} color="#1e1b4b" windows={3} cols={1} delay="0.1s" glow={false} />
        <Building height={65} width={16} color="#1e1b4b" windows={2} cols={1} delay="0.2s" glow={false} />
        <Building height={130} width={20} color="#1e1b4b" windows={4} cols={1} delay="0.3s" glow={false} />
        <Building height={90} width={18} color="#1e1b4b" windows={3} cols={1} delay="0.4s" glow={false} />
        <Building height={150} width={24} color="#1e1b4b" windows={5} cols={2} delay="0.5s" glow={false} />
        <Building height={70} width={16} color="#1e1b4b" windows={2} cols={1} delay="0.6s" glow={false} />
        <Building height={120} width={20} color="#1e1b4b" windows={4} cols={1} delay="0.7s" glow={false} />
        <Building height={85} width={18} color="#1e1b4b" windows={3} cols={1} delay="0.8s" glow={false} />
        <Building height={160} width={26} color="#1e1b4b" windows={5} cols={2} delay="0.9s" glow={false} />
        <Building height={75} width={16} color="#1e1b4b" windows={2} cols={1} delay="1s" glow={false} />
        <Building height={100} width={20} color="#1e1b4b" windows={3} cols={1} delay="1.1s" glow={false} />

        {/* Mid buildings — medium purple */}
        <Building height={140} width={28} color="#2e1065" windows={4} cols={2} delay="0s" glow />
        <Building height={200} width={34} color="#3b0764" windows={6} cols={2} delay="0.15s" glow />
        <Building height={110} width={24} color="#2e1065" windows={3} cols={2} delay="0.3s" glow />
        <Building height={240} width={38} color="#4c0519" windows={7} cols={3} delay="0.45s" glow accent="#7c3aed" />
        <Building height={160} width={30} color="#2e1065" windows={5} cols={2} delay="0.6s" glow />
        <Building height={280} width={42} color="#3b0764" windows={8} cols={3} delay="0.75s" glow accent="#6d28d9" />
        <Building height={130} width={26} color="#2e1065" windows={4} cols={2} delay="0.9s" glow />
        <Building height={190} width={32} color="#3b0764" windows={6} cols={2} delay="1.05s" glow />
        <Building height={150} width={28} color="#2e1065" windows={5} cols={2} delay="1.2s" glow />

        {/* Foreground buildings — bright violet */}
        <Building height={180} width={36} color="#4c1d95" windows={5} cols={2} delay="0s" glow accent="#8b5cf6" />
        <Building height={260} width={44} color="#5b21b6" windows={8} cols={3} delay="0.2s" glow accent="#7c3aed" tall />
        <Building height={140} width={30} color="#4c1d95" windows={4} cols={2} delay="0.4s" glow />
        <Building height={320} width={50} color="#6d28d9" windows={10} cols={3} delay="0.6s" glow accent="#a78bfa" tall />
        <Building height={200} width={38} color="#5b21b6" windows={6} cols={3} delay="0.8s" glow accent="#8b5cf6" />
        <Building height={170} width={32} color="#4c1d95" windows={5} cols={2} delay="1s" glow />
        <Building height={290} width={46} color="#6d28d9" windows={9} cols={3} delay="1.2s" glow accent="#7c3aed" tall />
        <Building height={150} width={28} color="#4c1d95" windows={4} cols={2} delay="1.4s" glow />
      </div>

      {/* ── Ground / road ── */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-slate-950 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-3 bg-slate-950" />

      {/* ── Road lines ── */}
      <div className="absolute bottom-1.5 left-0 right-0 flex justify-center gap-8">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="w-8 h-0.5 bg-yellow-400/30 rounded-full" />
        ))}
      </div>

      {/* ── Floating UI cards ── */}
      <FloatingCard
        style={{ top: "12%", left: "8%", animationDelay: "0s" }}
        icon="🏠" title="New Listing" sub="Sunset Villa, Mumbai" badge="₹2.4Cr" badgeColor="text-emerald-400"
      />
      <FloatingCard
        style={{ top: "35%", right: "6%", animationDelay: "1.5s" }}
        icon="👤" title="New Lead" sub="Rahul Sharma" badge="Interested" badgeColor="text-violet-400"
      />
      <FloatingCard
        style={{ bottom: "38%", left: "5%", animationDelay: "3s" }}
        icon="💰" title="Deal Closed" sub="Sky Penthouse" badge="₹5.1Cr" badgeColor="text-amber-400"
      />

      {/* ── Orbiting dot ── */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{ animation: "orbit 12s linear infinite" }}>
        <div className="w-3 h-3 rounded-full bg-violet-400 shadow-[0_0_12px_rgba(167,139,250,0.8)]"
          style={{ transform: "translateX(160px)" }} />
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{ animation: "orbit 18s linear infinite reverse" }}>
        <div className="w-2 h-2 rounded-full bg-pink-400 shadow-[0_0_10px_rgba(244,114,182,0.8)]"
          style={{ transform: "translateX(220px)" }} />
      </div>

      {/* ── Glow at horizon ── */}
      <div className="absolute bottom-6 left-0 right-0 h-24 bg-gradient-to-t from-violet-900/30 to-transparent pointer-events-none" />

      {/* ── Branding overlay ── */}
      <div className="absolute top-8 left-8 flex items-center gap-3 z-10">
        <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur border border-white/25 flex items-center justify-center shadow-lg">
          <span className="text-white font-black text-lg">E</span>
        </div>
        <div>
          <p className="text-white font-black text-lg leading-none">EstateFlow</p>
          <p className="text-violet-300 text-xs">Real Estate CRM</p>
        </div>
      </div>

      {/* ── Bottom tagline ── */}
      <div className="absolute bottom-12 left-0 right-0 text-center z-10">
        <p className="text-white/60 text-xs tracking-widest uppercase">
          India's Smartest Real Estate CRM
        </p>
      </div>

      {/* ── CSS Animations ── */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes floatCard {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes cloudMove {
          from { transform: translateX(-120%); }
          to { transform: translateX(120vw); }
        }
        @keyframes buildingRise {
          from { transform: scaleY(0); transform-origin: bottom; opacity: 0; }
          to { transform: scaleY(1); transform-origin: bottom; opacity: 1; }
        }
        @keyframes windowBlink {
          0%, 90%, 100% { opacity: 1; }
          95% { opacity: 0.2; }
        }
        @keyframes orbit {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 8px rgba(139,92,246,0.4); }
          50% { box-shadow: 0 0 20px rgba(139,92,246,0.8); }
        }
      `}</style>
    </div>
  );
}

// ── Building component ────────────────────────────────────────────────────────
function Building({ height, width, color, windows, cols, delay, glow, accent, tall }) {
  const rows = Math.ceil(windows / cols);

  return (
    <div
      className="relative shrink-0 rounded-t-sm"
      style={{
        height: height + "px",
        width: width + "px",
        backgroundColor: color,
        animation: `buildingRise 0.8s ease forwards`,
        animationDelay: delay,
        opacity: 0,
        boxShadow: glow ? `0 -4px 20px ${accent || "rgba(109,40,217,0.3)"}` : "none",
      }}
    >
      {/* Antenna on tall buildings */}
      {tall && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-current opacity-60"
          style={{ backgroundColor: accent || "#8b5cf6" }}>
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
            style={{ backgroundColor: accent || "#8b5cf6", animation: "pulse-glow 2s ease-in-out infinite" }} />
        </div>
      )}

      {/* Windows grid */}
      <div
        className="absolute inset-x-1 top-2 grid gap-0.5"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {[...Array(rows * cols)].map((_, i) => (
          <div
            key={i}
            className="rounded-sm"
            style={{
              height: "4px",
              backgroundColor: Math.random() > 0.3
                ? (accent || "rgba(167,139,250,0.7)")
                : "rgba(255,255,255,0.1)",
              animation: Math.random() > 0.7
                ? `windowBlink ${Math.random() * 4 + 3}s ease-in-out infinite`
                : "none",
              animationDelay: Math.random() * 5 + "s",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Cloud component ───────────────────────────────────────────────────────────
function Cloud({ top, delay, duration, opacity, size }) {
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        top,
        left: "-20%",
        opacity,
        transform: `scale(${size})`,
        animation: `cloudMove ${duration} linear infinite`,
        animationDelay: delay,
      }}
    >
      <div className="relative">
        <div className="w-24 h-8 bg-white rounded-full" />
        <div className="absolute -top-4 left-4 w-14 h-10 bg-white rounded-full" />
        <div className="absolute -top-2 left-10 w-16 h-8 bg-white rounded-full" />
      </div>
    </div>
  );
}

// ── Floating notification card ────────────────────────────────────────────────
function FloatingCard({ style, icon, title, sub, badge, badgeColor }) {
  return (
    <div
      className="absolute z-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-3 py-2.5 flex items-center gap-2.5 shadow-xl min-w-[160px]"
      style={{ ...style, animation: "floatCard 4s ease-in-out infinite" }}
    >
      <span className="text-xl shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-white text-xs font-semibold leading-tight">{title}</p>
        <p className="text-white/50 text-xs truncate">{sub}</p>
      </div>
      <span className={`text-xs font-bold ml-auto shrink-0 ${badgeColor}`}>{badge}</span>
    </div>
  );
}
