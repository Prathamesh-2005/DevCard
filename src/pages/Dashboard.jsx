import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import GithubContributionGraph from "../components/GithubContributionGraph";

// ─── Zod Schema ───────────────────────────────────────────────
const profileSchema = z.object({
  username: z
    .string()
    .min(3, "At least 3 characters")
    .max(30, "Maximum 30 characters")
    .regex(/^[a-z0-9_-]+$/, "Only lowercase letters, numbers, - and _"),
  full_name:    z.string().min(1, "Name is required").max(80),
  bio:          z.string().max(200, "Keep bio under 200 characters").optional(),
  github_url:   z.string().url("Must be a valid URL").optional().or(z.literal("")),
  leetcode_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  twitter_url:  z.string().url("Must be a valid URL").optional().or(z.literal("")),
  linkedin_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  website_url:  z.string().url("Must be a valid URL").optional().or(z.literal("")),
  location:     z.string().max(60).optional(),
  skills_raw:   z.string().optional(), // comma-separated
  available_for_hire: z.boolean().optional(),
});

// ─── Field Components ─────────────────────────────────────────
function Field({ label, error, children, hint }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-zinc-400 tracking-wide uppercase">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-[11px] text-zinc-600">{hint}</p>}
      {error  && <p className="text-[11px] text-red-400">{error}</p>}
    </div>
  );
}

function Input({ className = "", ...props }) {
  return (
    <input
      className={`w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-zinc-600 
        focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all ${className}`}
      {...props}
    />
  );
}

function Textarea({ className = "", ...props }) {
  return (
    <textarea
      className={`w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-zinc-600 
        focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all resize-none ${className}`}
      rows={3}
      {...props}
    />
  );
}

// ─── Main Dashboard ───────────────────────────────────────────
export default function Dashboard() {
  const { user, profile, loading, signOut, fetchProfile } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving]     = useState(false);
  const [copied, setCopied]     = useState(false);
  const [toast, setToast]       = useState(null);
  const [activeTab, setActiveTab] = useState("profile");

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate("/", { replace: true });
    }
  }, [user, loading, navigate]);

  // Fetch profile when user changes
  useEffect(() => {
    if (user && !profile) {
      fetchProfile(user.id);
    }
  }, [user, profile, fetchProfile]);

  // Auto-save avatar_url if profile loaded but missing avatar
  useEffect(() => {
    const saveAvatarIfMissing = async () => {
      if (profile && !profile.avatar_url && user?.user_metadata?.avatar_url) {
        try {
          await supabase
            .from("profiles")
            .update({ avatar_url: user.user_metadata.avatar_url })
            .eq("id", user.id);

          // Refresh profile
          await fetchProfile(user.id);
        } catch (error) {
          console.error("Error saving avatar:", error);
        }
      }
    };

    saveAvatarIfMissing();
  }, [profile, user, fetchProfile]);

  // Show loading screen
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#080a0c] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          <p className="font-mono text-xs text-zinc-600 tracking-widest uppercase">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const { register, handleSubmit, reset, watch, formState: { errors, isDirty } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username:    "",
      full_name:   "",
      bio:         "",
      github_url:  "",
      leetcode_url: "",
      twitter_url: "",
      linkedin_url: "",
      website_url: "",
      location:    "",
      skills_raw:  "",
      available_for_hire: false,
    },
  });

  // Populate form when profile loads
  useEffect(() => {
    if (profile) {
      reset({
        username:    profile.username   || "",
        full_name:   profile.full_name  || "",
        bio:         profile.bio        || "",
        github_url:  profile.github_url || "",
        leetcode_url: profile.leetcode_url || "",
        twitter_url: profile.twitter_url || "",
        linkedin_url: profile.linkedin_url || "",
        website_url: profile.website_url || "",
        location:    profile.location   || "",
        skills_raw:  (profile.skills || []).join(", "),
        available_for_hire: profile.available_for_hire || false,
      });
    }
  }, [profile, reset]);

  const githubUrl = watch("github_url");
  const username = watch("username");
  const fullName = watch("full_name");

  async function onSubmit(values) {
    setSaving(true);

    try {
      const skills = values.skills_raw
        ? values.skills_raw.split(",").map((s) => s.trim()).filter(Boolean)
        : [];

      const { github_url, leetcode_url, linkedin_url, twitter_url, website_url, username, full_name, bio, location, available_for_hire } = values;

      // Include avatar_url from Google OAuth if not already saved
      const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || null;

      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          username,
          full_name,
          bio,
          location,
          github_url,
          leetcode_url,
          linkedin_url,
          twitter_url,
          website_url,
          skills,
          available_for_hire,
          avatar_url: avatarUrl, // Save avatar here
        });

      if (error) {
        console.error("Save error:", error);
        if (error.code === "23505") {
          showToast("That username is already taken.", "error");
        } else {
          showToast(`Error: ${error.message}`, "error");
        }
      } else {
        // Refresh profile to show latest data
        await fetchProfile(user.id);
        showToast("Profile saved!", "success");
      }
    } catch (err) {
      console.error("Submit error:", err);
      showToast("Something went wrong. Try again.", "error");
    } finally {
      setSaving(false);
    }
  }

  function showToast(msg, type) {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function copyLink() {
    if (!username) return;
    navigator.clipboard.writeText(`${window.location.origin}/${username}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const publicUrl = username ? `${window.location.origin}/${username}` : null;

  return (
    <div
      className="min-h-screen bg-[#080a0c] text-white"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-xl border transition-all
            ${toast.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Top nav */}
      <nav className="border-b border-white/[0.05] px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-emerald-500 flex items-center justify-center">
            <span className="text-black font-bold text-[10px]" style={{ fontFamily: "'Syne', sans-serif" }}>D</span>
          </div>
          <div>
            <span className="text-sm font-semibold" style={{ fontFamily: "'Syne', sans-serif" }}>DevCard</span>
            {username && (
              <p className="text-xs font-mono text-emerald-400 leading-none">/{username}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {publicUrl && (
            <a
              href={`/${username}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-white border border-white/[0.06] hover:border-white/[0.12] transition-all"
            >
              <span className="font-mono">/{username}</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
          <button
            onClick={signOut}
            className="px-3 py-1.5 rounded-lg text-xs text-zinc-500 hover:text-red-400 border border-white/[0.06] hover:border-red-500/20 transition-all"
          >
            Sign out
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Sidebar ── */}
        <aside className="space-y-4">
          {/* Avatar card */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 flex flex-col items-center text-center">
            <img
              src={profile?.avatar_url || user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${fullName || "Dev"}`}
              alt="avatar"
              className="w-16 h-16 rounded-full mb-3 ring-2 ring-emerald-500/20"
            />
            <p className="font-semibold text-sm">{fullName || user?.user_metadata?.full_name || "Your Name"}</p>
            {username && (
              <p className="font-mono text-xs text-emerald-400 mt-0.5">@{username}</p>
            )}
            {profile?.available_for_hire && (
              <div className="mt-2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-emerald-400 font-mono">Open to work</span>
              </div>
            )}
          </div>

          {/* Copy link */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <p className="text-xs text-zinc-500 mb-2 font-mono uppercase tracking-widest">Your link</p>
            {username ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/30 border border-white/[0.05]">
                  <span className="font-mono text-xs text-zinc-400 truncate flex-1">{window.location.origin}/{username}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/${username}`);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className={`w-full py-2 rounded-lg text-xs font-medium border transition-all
                    ${copied
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                      : "bg-white/[0.04] border-white/[0.08] text-zinc-300 hover:border-emerald-500/30 hover:text-emerald-400"
                    }`}
                >
                  {copied ? "✓ Copied!" : "Copy Link"}
                </button>
              </div>
            ) : (
              <p className="text-xs text-zinc-600">Set a username to get your link</p>
            )}
          </div>

          {/* Stats */}
          {profile?.skills?.length > 0 && (
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <p className="text-xs text-zinc-500 mb-3 font-mono uppercase tracking-widest">Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {profile.skills.map((s) => (
                  <span key={s} className="px-2 py-0.5 rounded-full text-[11px] font-mono border border-white/[0.08] bg-white/[0.03] text-zinc-400">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* ── Form ── */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold" style={{ fontFamily: "'Syne', sans-serif" }}>
                Edit Profile
              </h1>
              <p className="text-zinc-500 text-sm mt-0.5">
                Customize your public DevCard page
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-lg bg-white/[0.03] border border-white/[0.06] w-fit">
            {["profile", "links", "preview"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-md text-xs font-medium capitalize transition-all
                  ${activeTab === tab
                    ? "bg-white/[0.08] text-white"
                    : "text-zinc-500 hover:text-zinc-300"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {activeTab === "profile" && (
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Username *" error={errors.username?.message} hint="Your unique DevCard URL handle">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 text-sm font-mono">@</span>
                      <Input
                        {...register("username")}
                        placeholder="yourhandle"
                        className="pl-7"
                      />
                    </div>
                  </Field>

                  <Field label="Full Name *" error={errors.full_name?.message}>
                    <Input {...register("full_name")} placeholder="Jane Doe" />
                  </Field>
                </div>

                <Field label="Bio" error={errors.bio?.message} hint="Max 200 characters">
                  <Textarea
                    {...register("bio")}
                    placeholder="Full-stack engineer who loves open source and coffee..."
                  />
                </Field>

                <Field
                  label="Location"
                  error={errors.location?.message}
                >
                  <Input {...register("location")} placeholder="San Francisco, CA" />
                </Field>

                <Field
                  label="Skills"
                  error={errors.skills_raw?.message}
                  hint="Comma-separated: React, TypeScript, Go..."
                >
                  <Input {...register("skills_raw")} placeholder="React, TypeScript, Node.js, PostgreSQL" />
                </Field>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      {...register("available_for_hire")}
                    />
                    <div className="w-9 h-5 rounded-full bg-white/[0.06] border border-white/[0.10] peer-checked:bg-emerald-500/80 peer-checked:border-emerald-400 transition-all" />
                    <div className="absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-white/60 peer-checked:translate-x-4 peer-checked:bg-white transition-all" />
                  </div>
                  <span className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors">
                    Available for hire
                  </span>
                </label>
              </div>
            )}

            {activeTab === "links" && (
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 space-y-5">
                {[
                  { name: "github_url",   label: "GitHub",   placeholder: "https://github.com/username",   icon: "⬡" },
                  { name: "leetcode_url", label: "LeetCode", placeholder: "https://leetcode.com/username",  icon: "◈" },
                  { name: "linkedin_url", label: "LinkedIn", placeholder: "https://linkedin.com/in/username", icon: "◎" },
                  { name: "twitter_url",  label: "Twitter/X", placeholder: "https://twitter.com/username",  icon: "◇" },
                  { name: "website_url",  label: "Website",  placeholder: "https://yourwebsite.com",        icon: "⊕" },
                ].map(({ name, label, placeholder, icon }) => (
                  <Field key={name} label={`${icon} ${label}`} error={errors[name]?.message}>
                    <Input {...register(name)} placeholder={placeholder} />
                  </Field>
                ))}
              </div>
            )}

            {activeTab === "preview" && (
              <div className="space-y-4">
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
                  <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest mb-4">GitHub Contributions Preview</p>
                  {githubUrl ? (
                    <GithubContributionGraph githubUrl={githubUrl} />
                  ) : (
                    <div className="text-center py-8 text-zinc-600 text-sm">
                      Add your GitHub URL in the Links tab to see contributions
                    </div>
                  )}
                </div>
                {publicUrl && (
                  <a
                    href={`/${username}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-white/[0.08] text-sm text-zinc-400 hover:text-white hover:border-white/[0.16] transition-all"
                  >
                    View public profile
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>
            )}

            {/* Submit */}
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-zinc-600">
                {isDirty ? "You have unsaved changes" : "All changes saved"}
              </p>
              <button
                type="submit"
                disabled={saving || !isDirty}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(52,211,153,0.3)]"
              >
                {saving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save Profile"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}