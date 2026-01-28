# 🏥 UhaiLink

> **Empowering You to Act When Every Second Counts**

An AI-powered, offline-aware emergency response platform designed to provide real-time medical guidance, secure critical health information, and connect users with verified emergency services. Built for Kenya, designed for the world.

---

## 🎯 Mission Statement

**"To bridge the critical gap between emergency, information, and action—when every second matters."**

---

## 📋 Table of Contents

- [About UhaiLink](#about-uhailink)
- [Core Features](#-core-features)
- [Project Structure](#-project-structure)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)
- [Support](#-support)

---

## 🌟 About UhaiLink

**UhaiLink** is a comprehensive emergency response ecosystem that combines cutting-edge AI, secure data management, and mobile-first design to transform how people handle medical emergencies.

### The Problem We Solve
In emergencies, critical seconds are lost gathering medical information. Individuals with chronic conditions, allergies, or complex medical histories may be unconscious, unable to communicate. Emergency responders lack instant access to essential medical data. Families don't know how to help. Lives are lost.

### Our Solution
UhaiLink centralizes your critical medical information, makes it instantly accessible to first responders via QR codes, provides AI-guided first aid support, and connects you with verified emergency services—all offline-ready, secure, and designed for low-connectivity environments.

### Why UhaiLink?

- 🚀 **Speed Matters**: Instant medical profile access for first responders (scan QR code, no internet required for basic info)
- 🤖 **AI-Powered Guidance**: Real-time first aid instructions adapted to your specific medical history
- 🔒 **Security First**: End-to-end encrypted profiles, token-based access, Row Level Security (Supabase RLS)
- 📱 **Offline Ready**: Core features work without internet; sync when available
- 🌍 **Local Context**: Emergency services directory for Kenya; scalable to other regions
- 👥 **For Everyone**: Individual users, families, corporate teams, universities, hospitals

---

## ✨ Core Features

### 🤖 Uhai Assist — AI First Aid Assistant
Real-time AI-powered emergency guidance when you need it most:
- **Multi-turn Conversations**: Complex medical scenarios handled intelligently
- **Step-by-Step Instructions**: CPR, bleeding control, burns, choking, fractures, seizures, allergic reactions
- **Context-Aware Responses**: Uses your medical history, allergies, and medications for personalized guidance
- **Voice & Text Support**: Chat interface and hands-free voice guidance for emergencies
- **Powered by OpenRouter AI**: Reliable, accurate, medical-trained models
- **Offline Modules** (Premium): Access critical instructions without internet

### 📱 Uhai QR ID — Medical QR System
Secure emergency identification accessible to responders instantly:
- **Auto-Generated QR Codes**: Unique, encrypted token-based access
- **Multiple Formats**: Digital (phone), physical card (wallet-sized), wristband, keychain
- **First Responder Access**: Scan → instant medical profile (blood type, allergies, medications, emergency contacts)
- **One-Click Ordering**: QR Card (KSh 500), QR Wristband (KSh 800), Bundle (KSh 1,200)
- **Regenerate Anytime**: Deactivate compromised codes instantly
- **Secure Token System**: Public QR doesn't expose personal data; regenerate for privacy

### 👤 Personal Medical Profile
Comprehensive health information management in one secure location:
- **Core Medical Data**: Blood type, allergies, medications, chronic conditions
- **Medical History**: Past treatments, surgeries, hospitalizations
- **Emergency Contacts**: Multiple contacts with priority levels and relationship types
- **Medical Preferences**: Hospital preferences, treatment authorizations, DNR status
- **Secure Cloud Storage**: Supabase with Row Level Security (only you and authorized responders access)
- **Easy Updates**: Intuitive UI to keep information current

### 🎓 Uhai Learn — First Aid Learning Center
Educational resources to build life-saving skills:
- **Expert Video Tutorials**: Professional demonstrations of emergency procedures
- **Interactive Guides**: Step-by-step first aid instructions categorized by emergency type
- **Downloadable Materials**: E-books, PDF guides, posters for offline access
- **Search & Filter**: Quickly find tutorials by emergency type, skill level, or duration
- **Webinars & Expert Sessions**: Expert-led training for advanced techniques
- **Certification Paths** (Future): First aid certification programs in partnership with organizations

### 🏥 Uhai Emergency Directory
Verified emergency services network across Kenya:
- **Hospital Directory**: Comprehensive list of hospitals with locations, hours, services
- **Ambulance Services**: Active 24/7 ambulance providers with contact info
- **Fire & Rescue**: Fire departments and rescue units across regions
- **NGO Network**: Kenya Red Cross, AMREF, St. John Ambulance, and partner organizations
- **One-Click Calling**: Direct contact integration
- **Location-Based Search**: Find nearest services to your location
- **Service Verification**: Regularly updated, community-verified provider information

### 🛡️ Uhai Admin — Admin Dashboard
Comprehensive platform management interface for administrators:
- **User Management**: View, monitor, manage, and support user accounts
- **Content Management**: Create, edit, delete tutorials and learning materials
- **Organization Directory**: Manage emergency service providers and verify data
- **Analytics Dashboard**: Real-time platform statistics (user count, QR scans, AI usage, emergency calls guided)
- **Activity Logs**: Comprehensive audit trail of all platform actions and changes
- **Role-Based Access Control**: Secure admin/moderator/editor roles via Supabase RLS
- **Bulk Operations**: Onboard organizations, manage corporate/university accounts
- **Reporting Tools**: Export data, generate compliance reports

---

## 📁 Project Structure

```
uhailink/
├── src/
│   ├── components/
│   │   ├── shared/              # Shared components (Header, Footer, Layouts)
│   │   │   ├── Layout.tsx
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   ├── admin/               # Admin-specific components
│   │   │   ├── AdminContentTab.tsx
│   │   │   ├── AdminUsersTab.tsx
│   │   │   ├── AdminOrganizationsTab.tsx
│   │   │   ├── AdminPaymentsTab.tsx
│   │   │   ├── AdminQRProductsTab.tsx
│   │   │   └── AdminEmergencyLogsTab.tsx
│   │   └── ui/                  # Radix UI primitives (button, card, form, etc.)
│   │
│   ├── pages/
│   │   ├── public/              # Public-facing pages (no auth required)
│   │   │   ├── Index.tsx        # Home page with hero & features
│   │   │   ├── Auth.tsx         # Login & signup
│   │   │   ├── Services.tsx     # Pricing & service tiers
│   │   │   ├── Learn.tsx        # First aid learning hub
│   │   │   ├── About.tsx        # About UhaiLink
│   │   │   ├── Contact.tsx      # Contact form
│   │   │   ├── AIAssistant.tsx  # Uhai Assist (AI chatbot)
│   │   │   ├── BuyQRTag.tsx     # QR card/wristband ordering
│   │   │   ├── PublicProfileView.tsx # QR scanned profile (public)
│   │   │   └── NotFound.tsx     # 404 page
│   │   ├── user/                # User dashboard pages (auth required)
│   │   │   ├── UserDashboard.tsx    # Main user dashboard
│   │   │   ├── UserProfilePage.tsx  # Comprehensive profile editor
│   │   │   ├── UserQRPage.tsx       # QR code management & sharing
│   │   │   ├── UserLearn.tsx        # Personalized learning
│   │   │   └── UserSettings.tsx     # Account & privacy settings
│   │   └── admin/               # Admin pages (admin auth required)
│   │       └── AdminDashboard.tsx   # Admin control panel
│   │
│   ├── hooks/
│   │   ├── shared/              # Shared hooks (use-toast, use-mobile)
│   │   │   ├── use-toast.ts
│   │   │   └── use-mobile.tsx
│   │
│   ├── lib/
│   │   └── shared/              # Shared utilities
│   │       └── utils.ts         # cn() for Tailwind merging
│   │
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts        # Supabase client initialization
│   │       └── types.ts         # Database types
│   │
│   ├── App.tsx                  # Router configuration
│   ├── main.tsx                 # Entry point
│   └── index.css                # Global styles
│
├── public/
│   └── robots.txt               # SEO robots directive
│
├── index.html                   # HTML entry point
├── vite.config.ts              # Vite configuration
├── tsconfig.json               # TypeScript config
├── tailwind.config.ts          # Tailwind CSS config
├── eslint.config.js            # ESLint config
├── package.json                # Dependencies
└── README.md                   # This file
```

### Architecture Overview

**UhaiLink** follows a modular, component-driven architecture:

- **Public Pages**: Unauthenticated landing, auth, services, learning
- **User Dashboard**: Authenticated user workspace (profile, QR, settings, learn)
- **Admin Dashboard**: Restricted admin panel (users, content, analytics)
- **Shared Components**: Layout, header, footer (used across all sections)
- **Supabase Backend**: Real-time database, auth, RLS policies, file storage

---

## 🛠️ Tech Stack

### Frontend
- **React 18** — UI library with hooks
- **TypeScript** — Type safety and better DX
- **Vite** — Fast build tool and dev server
- **React Router v6** — Client-side routing
- **Tailwind CSS** — Utility-first styling
- **Radix UI** — Accessible component primitives
- **React Hook Form** — Form state management
- **React Query** — Server state & caching
- **Lucide React** — Icon library
- **Sonner** — Toast notifications
- **QRCode.react** — QR code generation
- **Recharts** — Data visualization

### Backend & Services
- **Supabase** — PostgreSQL database, real-time, auth, storage
  - Row Level Security (RLS) for data protection
  - PostgreSQL functions for business logic
  - File storage for tutorials and materials
- **OpenRouter** — AI model access (first aid guidance)

### Development
- **ESLint** — Code quality
- **TypeScript ESLint** — Type checking
- **Autoprefixer** — CSS vendor prefixes
- **PostCSS** — CSS processing

### Infrastructure
- **Environment Variables** — Secure config management
- **Responsive Design** — Mobile-first, works on all devices

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 16+ and **npm** 7+
- **Git** for version control
- Supabase account (free tier available)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-org/uhailink.git
   cd uhailink
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables** (see [Environment Variables](#-environment-variables) section)

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:8080/`

### Available Commands

```bash
# Development
npm run dev          # Start dev server with hot reload

# Build & Deploy
npm run build        # Build for production
npm run preview      # Preview production build locally

# Code Quality
npm run lint         # Run ESLint and fix issues
npm run lint -- --fix # Auto-fix fixable issues

# Type Checking
npx tsc --noEmit    # Check TypeScript types without emitting files
```

---

## 🔐 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# AI/LLM Configuration (OpenRouter)
VITE_OPENROUTER_API_KEY=your-openrouter-key-here

# App Configuration
VITE_APP_URL=http://localhost:8080
VITE_APP_NAME=UhaiLink
```

### Getting Credentials

**Supabase:**
1. Sign up at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to **Project Settings → API** to find your URL and anon key

**OpenRouter:**
1. Sign up at [openrouter.ai](https://openrouter.ai)
2. Create an API key in the dashboard
3. Add credits to your account

---

## 🌐 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push

```bash
# One-click deploy
# Visit: https://vercel.com/new
```

### Docker
```bash
# Build Docker image
docker build -t uhailink:latest .

# Run container
docker run -p 8080:8080 uhailink:latest
```

### Self-Hosted
```bash
npm run build          # Creates dist/ folder
# Serve dist/ folder with your web server (nginx, Apache, etc.)
```

---

## 👥 Contributing

We welcome contributions from developers, designers, and healthcare professionals!

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make changes** following code style conventions
4. **Run linter and type checks:**
   ```bash
   npm run lint -- --fix
   npx tsc --noEmit
   npm run build
   ```
5. **Commit with clear messages:**
   ```bash
   git commit -m "feat: add new feature" -m "Detailed description"
   ```
6. **Push to your fork and create a Pull Request**

### Code Standards

- **TypeScript**: No explicit `any` types; use `unknown` with type guards
- **Components**: Functional components with hooks
- **Styling**: Tailwind CSS utilities
- **Naming**: Clear, descriptive names (PascalCase for components, camelCase for functions)
- **Comments**: Document complex logic and business rules
- **Accessibility**: WCAG 2.1 AA compliance for UI components

### Reporting Issues

Found a bug? Please open an issue with:
- Clear description of the problem
- Steps to reproduce
- Expected vs. actual behavior
- Your environment (OS, browser, Node version)

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🆘 Support

### Getting Help

- **Documentation**: [docs.uhailink.com](#) (coming soon)
- **Email**: support@uhailink.com
- **Discord**: [Community Chat](#) (coming soon)
- **Issues**: [GitHub Issues](https://github.com/your-org/uhailink/issues)

### Frequently Asked Questions

**Q: Is my medical information secure?**
A: Yes. All data is encrypted in transit (HTTPS/TLS) and at rest. We use Supabase Row Level Security (RLS) to ensure only authorized users access your profile.

**Q: Does UhaiLink work offline?**
A: Core features (QR scanning, AI first aid) are designed to work in low-connectivity environments. Data syncs when internet is available.

**Q: Can I share my QR code?**
A: Yes, your QR code is designed to be shared. It contains a secure token that expires if compromised. You can regenerate it instantly.

**Q: How much does UhaiLink cost?**
A: Basic features are free. Premium plans ($4.99/month for individuals) unlock unlimited AI assistance, offline modules, and family bundles.

---

## 🔮 Future Enhancements

### Planned Features
- [ ] **Mobile App** - React Native version for iOS and Android
- [ ] **Voice Assistant** - Hands-free emergency guidance
- [ ] **Multi-language Support** - Swahili, Kikuyu, and other local languages
- [ ] **Offline Mode** - Access critical information without internet
- [ ] **Emergency Video Calls** - Direct connection with medical professionals
- [ ] **Community Features** - Forum for first aid tips and experiences
- [ ] **Wearable Integration** - Sync with smartwatches and fitness trackers
- [ ] **SMS Alerts** - Emergency notifications via text message
- [ ] **Geolocation Services** - Find nearest hospitals and emergency services
- [ ] **Medical History Export** - Download your data in standard formats

### Advanced Features
- AI-powered symptom checker
- Integration with national emergency systems
- Blockchain-verified medical credentials
- Real-time ambulance tracking
- Mental health crisis support
- Disaster response coordination

---

## 🙏 Acknowledgments

- **Radix UI** for accessible component primitives
- **Tailwind CSS** for rapid styling
- **Supabase** for backend infrastructure
- **OpenRouter** for AI model access
- **Kenya Red Cross**, **AMREF**, and **St. John Ambulance** for emergency services partnerships
- All contributors and the open-source community

---

## 🔗 Useful Links

- **Website**: [uhailink.com](#)
- **Twitter**: [@UhaiLink](#)
- **GitHub**: [github.com/your-org/uhailink](#)
- **Blog**: [uhailink.com/blog](#)

---

**Made with ❤️ for emergencies. Built with 🔒 for safety.**
