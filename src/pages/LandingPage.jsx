import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const FEATURES = [
  {
    icon: "⬡",
    title: "GitHub Activity",
    desc: "Live contribution heatmap, streak stats, and repo highlights — all fetched in real time.",
  },
  {
    icon: "◈",
    title: "Skill Badges",
    desc: "Showcase your stack with elegant, interactive skill badges that tell your story at a glance.",
  },
  {
    icon: "◎",
    title: "One Link",
    desc: "devcard.app/yourname — share it anywhere. Resume, Twitter bio, email signature.",
  },
  {
    icon: "⊕",
    title: "Always Live",
    desc: "Your card updates the moment you push code. No manual updates, ever.",
  },
];

const SAMPLE_SKILLS = ["React", "TypeScript", "Node.js", "Go", "PostgreSQL", "Docker", "AWS", "GraphQL"];

export default function LandingPage() {
  const { user, signInWithGoogle, loading } = useAuth();
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, loading, navigate]);

  // Animated grid background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animFrame;
    let t = 0;

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const size = 40;
      ctx.strokeStyle = "rgba(255,255,255,0.03)";
      ctx.lineWidth = 1;

      for (let x = 0; x < canvas.width + size; x += size) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height + size; y += size) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Glowing orbs
      const orbs = [
        { x: canvas.width * 0.2, y: canvas.height * 0.3, r: 300, color: "rgba(52,211,153,0.04)" },
        { x: canvas.width * 0.8, y: canvas.height * 0.6, r: 250, color: "rgba(16,185,129,0.03)" },
      ];
      orbs.forEach(({ x, y, r, color }) => {
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, color);
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      });

      t++;
      animFrame = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animFrame);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-[#080a0c] text-white overflow-hidden" style={{ fontFamily: "'Outfit', sans-serif" }}>
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-emerald-500 flex items-center justify-center">
            <span className="text-black font-bold text-xs" style={{ fontFamily: "'Syne', sans-serif" }}>D</span>
          </div>
          <span className="text-sm font-semibold tracking-wide" style={{ fontFamily: "'Syne', sans-serif" }}>
            DevCard
          </span>
        </div>
        <div className="flex items-center gap-6 text-sm text-zinc-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <button
            onClick={signInWithGoogle}
            className="px-4 py-1.5 rounded-lg border border-white/10 hover:border-emerald-500/50 hover:text-emerald-400 transition-all text-xs font-medium"
          >
            Sign in
          </button>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex flex-col items-center text-center px-6 pt-24 pb-32 max-w-4xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 mb-8">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-400 font-mono tracking-widest uppercase">
            Free Forever
          </span>
        </div>

        <h1
          className="text-5xl sm:text-7xl font-bold leading-[1.05] tracking-tight mb-6"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          Your developer
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500">
            identity card.
          </span>
        </h1>

        <p className="text-zinc-400 text-lg max-w-xl mb-10 leading-relaxed">
          One beautiful link for everything you've built.
          GitHub contributions, skills, and profiles — live, public, and permanent.
        </p>

        {/* CTA */}
        <button
          onClick={signInWithGoogle}
          className="group flex items-center gap-3 px-7 py-4 rounded-xl bg-white text-black font-semibold text-sm hover:bg-emerald-50 transition-all duration-200 shadow-[0_0_40px_rgba(52,211,153,0.15)] hover:shadow-[0_0_60px_rgba(52,211,153,0.25)]"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Generate Your DevCard — Continue with Google
          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <p className="mt-4 text-xs text-zinc-600">No credit card required · Takes 30 seconds</p>

        {/* Sample URL preview */}
        <div className="mt-12 flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06]">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="font-mono text-sm text-zinc-400">devcard.app/</span>
          <span className="font-mono text-sm text-emerald-400">yourname</span>
        </div>

        {/* Sample skill badges */}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {SAMPLE_SKILLS.map((skill) => (
            <span
              key={skill}
              className="px-3 py-1 rounded-full text-xs font-mono border border-white/[0.08] bg-white/[0.03] text-zinc-400"
            >
              {skill}
            </span>
          ))}
        </div>
      </main>

      {/* Features */}
      <section id="features" className="relative z-10 max-w-5xl mx-auto px-6 pb-32">
        <p className="text-center text-xs font-mono text-zinc-600 tracking-widest uppercase mb-12">
          Everything a developer needs
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="p-6 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:border-emerald-500/20 hover:bg-emerald-500/[0.02] transition-all duration-300 group"
            >
              <div className="text-2xl mb-3 text-emerald-400 group-hover:scale-110 transition-transform inline-block">
                {f.icon}
              </div>
              <h3 className="font-semibold text-sm mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>{f.title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.04] py-8 text-center">
        <p className="text-xs text-zinc-700 font-mono">
          © {new Date().getFullYear()} DevCard · Built with ❤️ for developers
        </p>
      </footer>
    </div>
  );
}