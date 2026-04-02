import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import GithubContributionGraph from "../components/GithubContributionGraph";

// ─── Social Link Button ──────────────────────────────────────
function SocialButton({ href, icon, label, color = "zinc" }) {
  if (!href) return null;
  const colors = {
    github:   "border-white/[0.12] hover:border-white/[0.30] text-zinc-300 hover:text-white",
    leetcode: "border-orange-500/20 hover:border-orange-500/40 text-orange-400/80 hover:text-orange-400",
    linkedin: "border-blue-500/20 hover:border-blue-500/40 text-blue-400/80 hover:text-blue-400",
    twitter:  "border-sky-500/20 hover:border-sky-500/40 text-sky-400/80 hover:text-sky-400",
    website:  "border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400/80 hover:text-emerald-400",
  };
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border bg-white/[0.02] text-sm font-medium transition-all duration-200 ${colors[color]}`}
    >
      {icon}
      <span>{label}</span>
      <svg className="w-3 h-3 ml-auto opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    </a>
  );
}

// ─── Skill Badge ─────────────────────────────────────────────
const SKILL_COLORS = [
  "border-violet-500/20 bg-violet-500/5 text-violet-300",
  "border-blue-500/20 bg-blue-500/5 text-blue-300",
  "border-cyan-500/20 bg-cyan-500/5 text-cyan-300",
  "border-teal-500/20 bg-teal-500/5 text-teal-300",
  "border-emerald-500/20 bg-emerald-500/5 text-emerald-300",
  "border-yellow-500/20 bg-yellow-500/5 text-yellow-300",
  "border-orange-500/20 bg-orange-500/5 text-orange-300",
  "border-pink-500/20 bg-pink-500/5 text-pink-300",
];

function SkillBadge({ skill, index }) {
  const colorClass = SKILL_COLORS[index % SKILL_COLORS.length];
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-mono border ${colorClass} hover:scale-105 transition-transform cursor-default`}
    >
      {skill}
    </span>
  );
}

// ─── Not Found ────────────────────────────────────────────────
function NotFound({ username }) {
  return (
    <div className="min-h-screen bg-[#080a0c] flex flex-col items-center justify-center text-center px-6">
      <div className="w-16 h-16 rounded-2xl border border-white/[0.06] bg-white/[0.02] flex items-center justify-center mb-6 text-2xl">
        ◎
      </div>
      <h1 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
        No card found
      </h1>
      <p className="text-zinc-500 text-sm mb-6">
        <span className="font-mono text-zinc-400">@{username}</span> hasn't set up their DevCard yet.
      </p>
      <Link
        to="/"
        className="px-5 py-2.5 rounded-xl bg-emerald-500 text-black text-sm font-semibold hover:bg-emerald-400 transition-all"
      >
        Create yours →
      </Link>
    </div>
  );
}

// ─── Main Public Profile ──────────────────────────────────────
export default function PublicProfile() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied,  setCopied]  = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .single();
      setProfile(data);
      setLoading(false);
    }
    load();
  }, [username]);

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080a0c] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) return <NotFound username={username} />;

  const hasLinks = profile.github_url || profile.leetcode_url || profile.linkedin_url || profile.twitter_url || profile.website_url;

  return (
    <div
      className="min-h-screen bg-[#080a0c] text-white py-12 px-4"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-emerald-500/[0.03] blur-[120px]" />
      </div>

      <div className="relative max-w-xl mx-auto space-y-4">

        {/* ── Main Card ── */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] backdrop-blur-sm overflow-hidden">

          {/* Header strip */}
          <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500/40 via-teal-400/60 to-emerald-500/40" />

          <div className="p-8">
            {/* Avatar + name */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={
                      profile.avatar_url ||
                      `https://api.dicebear.com/7.x/initials/svg?seed=${profile.full_name}&backgroundColor=0a3622&textColor=34d399`
                    }
                    alt={profile.full_name}
                    className="w-16 h-16 rounded-2xl ring-2 ring-white/[0.06]"
                  />
                  {profile.available_for_hire && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-[#080a0c] animate-pulse" />
                  )}
                </div>

                <div>
                  <h1
                    className="text-xl font-bold leading-tight"
                    style={{ fontFamily: "'Syne', sans-serif" }}
                  >
                    {profile.full_name}
                  </h1>
                  <p className="font-mono text-sm text-emerald-400/80 mt-0.5">
                    @{profile.username}
                  </p>
                  {profile.location && (
                    <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {profile.location}
                    </p>
                  )}
                </div>
              </div>

              {/* Copy + share */}
              <button
                onClick={copyLink}
                className={`p-2 rounded-lg border text-xs transition-all
                  ${copied
                    ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/5"
                    : "border-white/[0.08] text-zinc-500 hover:text-zinc-300 hover:border-white/[0.16]"
                  }`}
                title="Copy link"
              >
                {copied ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Available badge */}
            {profile.available_for_hire && (
              <div className="flex mb-5">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] text-emerald-400 font-mono tracking-wide">Open to opportunities</span>
                </div>
              </div>
            )}

            {/* Bio */}
            {profile.bio && (
              <p className="text-zinc-400 text-sm leading-relaxed mb-6 border-l-2 border-emerald-500/20 pl-4">
                {profile.bio}
              </p>
            )}

            {/* Skills */}
            {profile.skills?.length > 0 && (
              <div className="mb-6">
                <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mb-2.5">Stack</p>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, i) => (
                    <SkillBadge key={skill} skill={skill} index={i} />
                  ))}
                </div>
              </div>
            )}

            {/* Social links */}
            {hasLinks && (
              <div className="grid grid-cols-1 gap-2">
                <SocialButton
                  href={profile.github_url}
                  color="github"
                  label="GitHub"
                  icon={
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  }
                />
                <SocialButton
                  href={profile.leetcode_url}
                  color="leetcode"
                  label="LeetCode"
                  icon={
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16.102 17.93l-2.697 2.607c-.466.466-1.108.67-1.675.567l-1.256-.611c.073-.264.021-.576-.14-.795l-1.267-1.042a1.14 1.14 0 0 1-.162-.361l-1.264-1.031-1.374.647.093.378c.018.074.028.15.028.227v1.071l-2.297-.92-.068-.08-.663-.805a.972.972 0 0 1-.21-.584v-1.484a.97.97 0 0 1 .97-.97H8.7l.84-.61.463-.337.14.061-.44 1.203 1.316.625 1.015-.977a.99.99 0 0 1 .709-.302c.277 0 .527.107.716.281l1.078 1.006 1.256-.393c.264-.082.534.035.668.272.134.236.074.532-.144.7l-1.318 1.03.188.347 1.016-.402.386.84zm1.82-10.44l-2.27 2.19a1.14 1.14 0 0 0-.259 1.31l.545 1.17c.189.407.579.682 1.025.739l1.342.164c.17.024.336.012.491-.034l.022-.008 1.36.832c.394.242.539.75.33 1.158l-.584 1.14a1.03 1.03 0 0 1-.922.566H17.5a1.03 1.03 0 0 1-.92-1.494l.302-.59-1.058-.648-.303.064-.055-.16 1.262-1.217-.418-.9-1.752.55a1.14 1.14 0 0 1-1.044-.184L12.45 11.3a1.15 1.15 0 0 1-.4-1.23l.55-1.87a1.14 1.14 0 0 1 .79-.795l2.07-.563 1.462-1.41V4.16l-1.05-1.02H14.13l-1.012.38-.18.27-.297-.125.44-1.202-1.315-.624-1.015.978a.99.99 0 0 1-.709.302.99.99 0 0 1-.716-.281l-1.078-1.007-1.257.393a.63.63 0 0 1-.668-.272.631.631 0 0 1 .145-.7l1.317-1.03-.187-.348-1.016.403-.386-.84 2.697-2.607c.397-.393.973-.56 1.524-.44l1.298.631-.058.255c.088.007.175.025.256.055l1.626.629a1.14 1.14 0 0 1 .705.996v1.073c0 .062-.006.123-.018.183l1.4.657c.315.148.517.47.517.82v.553c0 .17-.045.33-.125.469l1.358.83c.405.247.55.77.332 1.18z"/>
                    </svg>
                  }
                />
                <SocialButton
                  href={profile.linkedin_url}
                  color="linkedin"
                  label="LinkedIn"
                  icon={
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  }
                />
                <SocialButton
                  href={profile.twitter_url}
                  color="twitter"
                  label="Twitter / X"
                  icon={
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  }
                />
                <SocialButton
                  href={profile.website_url}
                  color="website"
                  label="Website"
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  }
                />
              </div>
            )}
          </div>
        </div>

        {/* ── GitHub Contribution Graph ── */}
        {profile.github_url && (
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-[#0e4429]/60 via-[#26a641]/60 to-[#0e4429]/60" />
            <div className="p-6">
              <GithubContributionGraph githubUrl={profile.github_url} />
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <div className="text-center pt-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            <div className="w-4 h-4 rounded bg-emerald-500/80 flex items-center justify-center">
              <span className="text-black font-bold text-[8px]">D</span>
            </div>
            Create your DevCard →
          </Link>
        </div>
      </div>
    </div>
  );
}