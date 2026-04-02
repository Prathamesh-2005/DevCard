# 🚀 DevLink - Link-in-Bio Platform for Developers

> **The modern link-in-bio platform built for developers by developers.** Share your GitHub contributions, skills, and social profiles in one beautiful, shareable link.

[![React](https://img.shields.io/badge/React-19.2-blue?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.0-purple?logo=vite)](https://vitejs.dev)
[![Supabase](https://img.shields.io/badge/Supabase-Auth--Ready-green?logo=supabase)](https://supabase.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-blue?logo=tailwindcss)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## ✨ Features

### 🔐 **Authentication**

- Google OAuth 2.0 integration
- Automatic profile creation on signup
- Persistent sessions (stays logged in on refresh)
- Secure auth state management

### 👤 **Developer Profiles**

- Beautiful, customizable profile cards
- Real-time form updates
- Avatar image support
- Bio, location, and skills showcase
- "Open to work" badge with pulse animation

### 🔗 **Social Links**

- GitHub, LeetCode, LinkedIn, Twitter/X, Website
- Customizable link display
- Quick copy-to-clipboard links
- Color-coded social buttons

### 📊 **GitHub Integration**

- Real-time GitHub contribution heatmap
- Last 365 days of activity visualization
- Total contribution count
- Responsive calendar widget

### 🌐 **Public Profiles**

- Dynamic routing by username (/@username)
- SEO-friendly URLs
- Shareable profile links
- Beautiful dark theme UI

### ⚡ **Performance**

- Fast Vite build system
- React 19 for optimal performance
- Tailwind CSS (utility-first styling)
- Optimized bundle size
- CDN-ready for images

---

## 🛠 Tech Stack

| Layer              | Technology                   |
| ------------------ | ---------------------------- |
| **Frontend**       | React 19 + Vite              |
| **Styling**        | Tailwind CSS 4               |
| **Routing**        | React Router v7              |
| **Forms**          | React Hook Form + Zod        |
| **Authentication** | Supabase Auth (Google OAuth) |
| **Database**       | Supabase PostgreSQL          |
| **Deployement**    | Vercel                       |

---

## 📦 Installation

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (free tier works)
- Google OAuth credentials

### 1. Clone the Repository

```bash
git clone https://github.com/Prathamesh-2005/DevCard
cd devlink
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Get these from [Supabase Dashboard](https://app.supabase.com) → Project Settings → API

### 4. Set Up Supabase

Run the SQL migrations in Supabase SQL Editor:

```sql
-- Create profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  full_name text,
  bio text,
  avatar_url text,
  github_url text,
  leetcode_url text,
  twitter_url text,
  linkedin_url text,
  website_url text,
  skills text[] DEFAULT '{}',
  location text,
  available_for_hire boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Auto-update timestamp
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  base_username text;
  final_username text;
  suffix int := 0;
BEGIN
  base_username := lower(regexp_replace(
    coalesce(split_part(NEW.raw_user_meta_data->>'email', '@', 1), 'user'),
    '[^a-z0-9_]', '', 'g'
  ));

  IF length(base_username) < 3 THEN
    base_username := base_username || 'dev';
  END IF;

  final_username := base_username;

  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
    suffix := suffix + 1;
    final_username := base_username || suffix::text;
  END LOOP;

  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    final_username,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Disable RLS for development (enable for production)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
```

### 5. Configure Google OAuth

1. Get OAuth credentials from [Google Cloud Console](https://console.cloud.google.com)
2. Go to Supabase Dashboard → Authentication → Providers → Google
3. Set Redirect URLs:
   - `http://localhost:5173/dashboard` (development)
   - `https://yourdomain.com/dashboard` (production)

### 6. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:5173`

---

## 📁 Project Structure

```
devlink/
├── src/
│   ├── components/
│   │   ├── ProtectedRoute.jsx      # Auth wrapper component
│   │   └── GithubContributionGraph.jsx # GitHub heatmap
│   ├── context/
│   │   └── AuthContext.jsx          # Auth state management
│   ├── lib/
│   │   └── supabase.js              # Supabase client
│   ├── pages/
│   │   ├── LandingPage.jsx          # Marketing page
│   │   ├── Dashboard.jsx            # User dashboard
│   │   └── PublicProfile.jsx        # Public profile page
│   ├── App.jsx                      # Main router
│   ├── main.jsx                     # Entry point
│   └── index.css                    # Tailwind styles
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── .env.example
├── .gitignore
├── QUICK_DEPLOY.md                  # Vercel deployment guide
├── VERCEL_DEPLOYMENT.md             # Detailed deployment docs
└── README.md
```

---

## 🚀 Usage

### User Journey

1. **Sign Up**
   - Click "Sign in with Google"
   - Automatic profile creation
   - Redirected to dashboard

2. **Edit Profile**
   - Upload avatar
   - Add name, bio, location
   - Add social links (GitHub, LinkedIn, etc)
   - Add skills/tech stack
   - Toggle "Open to work" badge

3. **Share Profile**
   - Get unique link: `yoursite.com/@username`
   - Copy and share anywhere
   - Works on any device

4. **Public View**
   - Beautiful dark theme card
   - GitHub contribution heatmap
   - All social links clickable
   - Ready to impress!

---

## 📊 Key Pages

| Page           | Route        | Access    | Description                    |
| -------------- | ------------ | --------- | ------------------------------ |
| Landing        | `/`          | Public    | Marketing page, sign-in button |
| Dashboard      | `/dashboard` | Protected | Edit profile, view public link |
| Public Profile | `/@username` | Public    | Shareable profile card         |

---

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start dev server

# Production
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
```

---

## 🚀 Deployment

**TL;DR:**

```bash
# 1. Push to GitHub
git push origin main

# 2. Go to vercel.com/dashboard
# 3. Select your repo and deploy
# 4. Add environment variables
# 5. Done! 🎉
```

### Production Checklist

- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] Environment variables added
- [ ] Supabase RLS policies enabled
- [ ] Google OAuth redirect URLs updated
- [ ] Domain configured (optional)
- [ ] Analytics enabled

---

## 🔐 Security

### Current Setup (Development)

- ✅ Google OAuth 2.0 for authentication
- ✅ Secure session management
- ✅ RLS disabled for development (easy testing)

### For Production

Enable RLS policies in Supabase:

```sql
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
```

---

## 📸 Features in Action

### Landing Page

- Animated grid background
- Feature showcase
- Google OAuth CTA
- Responsive design

### Dashboard

- Real-time form validation
- Live username in header
- Copy-to-clipboard links
- GitHub heatmap preview
- Beautiful dark theme

### Public Profile

- Glassmorphism design
- Social media buttons
- GitHub contributions
- Shareable URL
- Mobile responsive

---

## 🐛 Troubleshooting

### Problem: "Supabase credentials missing"

**Solution**: Check `.env.local` file with correct keys

### Problem: "Google OAuth not working"

**Solution**: Verify redirect URLs in Supabase match your domain

### Problem: "Profile not saving"

**Solution**: Disable RLS temporarily:

```sql
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
```

### Problem: "Avatar not showing after login"

**Solution**: Click "Save Profile" once to store avatar in database

See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for more troubleshooting.

---

## 📚 Resources

- [React Documentation](https://react.dev)
- [Vite Guide](https://vitejs.dev)
- [Supabase Docs](https://supabase.com/docs)
- [React Router v7](https://reactrouter.com)
- [Tailwind CSS](https://tailwindcss.com)
- [React Hook Form](https://react-hook-form.com)
- [Zod Validation](https://zod.dev)

---

## 📝 Environment Variables Reference

```env
# Supabase API
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

**Never commit `.env` files to git!** Use `.env.local` for local development.

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

Built with ❤️ by Developers, for Developers

- **GitHub**: [@your-username](https://github.com/Prathamesh-2005)
- **Email**: your.email@example.com
- **Website**: your-website.com

---

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) for excellent backend infrastructure
- [Vercel](https://vercel.com) for seamless deployment
- [Tailwind CSS](https://tailwindcss.com) for beautiful styling
- [React](https://react.dev) for amazing framework
- All contributors and supporters!
